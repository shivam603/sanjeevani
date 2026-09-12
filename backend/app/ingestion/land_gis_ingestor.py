"""Land GIS Ingestor for GeoJSON and Shapefile parcel boundaries."""

import io
import json
import logging
import uuid
import zipfile
from decimal import Decimal
from typing import Any, Dict, List, Optional, Union
from shapely.geometry import Polygon, MultiPolygon, shape
from shapely.validation import make_valid
from geoalchemy2.shape import from_shape
from sqlalchemy import select
from app.ingestion.base import BaseIngestor, IngestionResult
from app.models.land_parcel import LandParcel

logger = logging.getLogger("kisancred.ingestion.land_gis")


class LandGISIngestor(BaseIngestor):
    """
    Ingests, validates, repairs, and upserts farm parcel boundaries
    from GeoJSON payloads or zipped Shapefiles.
    """
    source_name = "LAND_GIS"

    def ingest(
        self,
        result: IngestionResult,
        farmer_id: Optional[Union[str, uuid.UUID]] = None,
        geojson_data: Optional[Union[Dict[str, Any], str, bytes]] = None,
        shapefile_bytes: Optional[bytes] = None,
        default_soil_type: Optional[str] = "Alluvial Loam",
        default_irrigation: Optional[str] = "Canal & Borewell",
        **kwargs,
    ) -> None:
        """
        Parse parcel boundaries and upsert into `land_parcels`.
        """
        if farmer_id is None:
            farmer_uuid = uuid.UUID("3fa85f64-5717-4562-b3fc-2c963f66afa6")
        else:
            farmer_uuid = uuid.UUID(str(farmer_id))
        features_to_process: List[Dict[str, Any]] = []

        # 1. Parse Input Source
        if geojson_data:
            features_to_process = self._parse_geojson(geojson_data)
        elif shapefile_bytes:
            features_to_process = self._parse_shapefile(shapefile_bytes)
        else:
            # Default seed parcel for automated pipeline runs
            default_geojson = {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "survey_number": "SURV-NSK-101",
                            "acreage": 4.5,
                            "soil_type": default_soil_type or "Alluvial Loam",
                            "irrigation_source": default_irrigation or "Canal & Borewell",
                        },
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [
                                    [73.8120, 20.0120],
                                    [73.8160, 20.0120],
                                    [73.8160, 20.0160],
                                    [73.8120, 20.0160],
                                    [73.8120, 20.0120],
                                ]
                            ],
                        },
                    }
                ],
            }
            features_to_process = self._parse_geojson(default_geojson)

        result.details["total_features_found"] = len(features_to_process)
        if not features_to_process:
            result.errors.append("No features found in provided spatial data.")
            return

        session = self._get_sync_session()

        for idx, feat in enumerate(features_to_process):
            try:
                geom_dict = feat.get("geometry")
                props = feat.get("properties", {}) or {}

                if not geom_dict:
                    result.rows_skipped += 1
                    result.errors.append(f"Feature index {idx}: missing geometry object.")
                    continue

                # Convert to Shapely geometry & validate
                geom = shape(geom_dict)
                if not geom.is_valid:
                    self.logger.warning(f"Feature {idx} invalid geometry. Attempting repair with make_valid.")
                    geom = make_valid(geom)

                # Ensure polygon / multi-polygon
                if isinstance(geom, MultiPolygon):
                    # Pick largest polygon if multi-part
                    geom = max(geom.geoms, key=lambda p: p.area)
                elif not isinstance(geom, Polygon):
                    result.rows_skipped += 1
                    result.errors.append(f"Feature index {idx}: Geometry must be Polygon, got {geom.geom_type}")
                    continue

                # Coordinate sanity check (Longitude: -180 to 180, Latitude: -90 to 90)
                bounds = geom.bounds  # (minx, miny, maxx, maxy)
                if not (-180 <= bounds[0] <= 180 and -90 <= bounds[1] <= 90 and
                        -180 <= bounds[2] <= 180 and -90 <= bounds[3] <= 90):
                    result.rows_failed += 1
                    result.errors.append(f"Feature {idx}: Coordinates out of WGS84 bounds: {bounds}")
                    continue

                # Extract survey number
                survey_no = str(props.get("survey_number") or props.get("survey_no") or props.get("id") or f"SURVEY-{idx+101}")

                # Extract or compute acreage (approximate 1 deg lat ~ 111km)
                raw_acreage = props.get("acreage") or props.get("area_acres")
                if raw_acreage:
                    acreage = Decimal(str(raw_acreage))
                else:
                    # Rough planar degree-to-acre approximation for tropical India (~19°N)
                    # 1 sq deg ≈ 111 km * 105 km ≈ 1,165,500 ha ≈ 2,880,000 acres
                    approx_acres = round(geom.area * 2880000.0, 2)
                    acreage = Decimal(str(max(approx_acres, 0.5)))

                soil_type = props.get("soil_type") or default_soil_type
                irrigation_source = props.get("irrigation_source") or default_irrigation

                # PostGIS Geometry representation (SRID 4326)
                geoalchemy_geom = from_shape(geom, srid=4326)

                # Upsert into land_parcels (match on farmer_id + survey_number)
                if session:
                    stmt = select(LandParcel).where(
                        LandParcel.farmer_id == farmer_uuid,
                        LandParcel.survey_number == survey_no,
                    )
                    existing = session.execute(stmt).scalars().first()

                    if existing:
                        existing.boundary_polygon = geoalchemy_geom
                        existing.acreage = acreage
                        existing.soil_type = soil_type
                        existing.irrigation_source = irrigation_source
                        self.logger.info(f"Updated existing parcel {existing.parcel_id} (survey={survey_no})")
                    else:
                        new_parcel = LandParcel(
                            parcel_id=uuid.uuid4(),
                            farmer_id=farmer_uuid,
                            survey_number=survey_no,
                            acreage=acreage,
                            soil_type=soil_type,
                            irrigation_source=irrigation_source,
                            boundary_polygon=geoalchemy_geom,
                        )
                        session.add(new_parcel)
                        self.logger.info(f"Inserted new parcel {new_parcel.parcel_id} (survey={survey_no})")

                    session.commit()

                result.rows_ingested += 1

            except Exception as e:
                self.logger.warning(f"Failed to process feature index {idx}: {e}")
                result.rows_failed += 1
                result.errors.append(f"Feature {idx}: {str(e)}")
                if session:
                    session.rollback()

        if self.db_session is None and session:
            session.close()

    def _parse_geojson(self, data: Union[Dict[str, Any], str, bytes]) -> List[Dict[str, Any]]:
        """Normalize GeoJSON input into a list of features."""
        if isinstance(data, (bytes, bytearray)):
            data = data.decode("utf-8")
        if isinstance(data, str):
            data = json.loads(data)

        if not isinstance(data, dict):
            raise ValueError("GeoJSON must be a JSON object.")

        dtype = data.get("type", "")
        if dtype == "FeatureCollection":
            return data.get("features", [])
        elif dtype == "Feature":
            return [data]
        elif dtype in ("Polygon", "MultiPolygon"):
            return [{"type": "Feature", "geometry": data, "properties": {}}]
        raise ValueError(f"Unsupported GeoJSON type: '{dtype}'")

    def _parse_shapefile(self, shapefile_bytes: bytes) -> List[Dict[str, Any]]:
        """Extract features from a zipped Shapefile archive using pyshp."""
        import shapefile
        features = []
        with zipfile.ZipFile(io.BytesIO(shapefile_bytes)) as zf:
            # Find .shp and .dbf files
            shp_names = [n for n in zf.namelist() if n.lower().endswith(".shp")]
            if not shp_names:
                raise ValueError("No .shp file found inside Shapefile ZIP archive.")
            shp_name = shp_names[0]
            base_name = shp_name[:-4]

            # Read raw components
            shp_io = io.BytesIO(zf.read(shp_name))
            dbf_io = io.BytesIO(zf.read(base_name + ".dbf")) if (base_name + ".dbf") in zf.namelist() else None
            shx_io = io.BytesIO(zf.read(base_name + ".shx")) if (base_name + ".shx") in zf.namelist() else None

            sf = shapefile.Reader(shp=shp_io, dbf=dbf_io, shx=shx_io)
            for shape_rec in sf.shapeRecords():
                geojson_geom = shape_rec.shape.__geo_interface__
                record_dict = shape_rec.record.as_dict() if hasattr(shape_rec.record, "as_dict") else {}
                features.append({
                    "type": "Feature",
                    "geometry": geojson_geom,
                    "properties": record_dict,
                })
        return features
