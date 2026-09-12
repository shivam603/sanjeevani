"""Remote Sensing Ingestor for Sentinel-2 NDVI & Soil Moisture Indices."""

from abc import ABC, abstractmethod
from datetime import date, datetime, timezone
from decimal import Decimal
import logging
import math
import random
import uuid
from typing import Any, Dict, List, Optional, Union
from sqlalchemy import select
from app.ingestion.base import BaseIngestor, IngestionResult
from app.models.land_parcel import LandParcel
from app.models.ndvi_reading import NDVIReading

logger = logging.getLogger("kisancred.ingestion.remote_sensing")


class SatelliteDataProvider(ABC):
    """
    Pluggable satellite data provider interface.
    Allows swapping Copernicus Open Access Hub, Sentinel Hub, Planet Labs,
    or Google Earth Engine without changing the ingestion pipeline.
    """

    @abstractmethod
    def fetch_indices(
        self,
        parcel_id: str,
        reading_date: date,
        geometry_wkt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Fetch spectral vegetation (NDVI) and moisture (NDWI) indices for a parcel.
        Returns:
            {
                "ndvi_value": float,
                "moisture_index": float,
                "cloud_coverage_pct": float,
                "satellite_source": str,
            }
        """
        raise NotImplementedError


class MockSentinel2Provider(SatelliteDataProvider):
    """
    Pluggable mock satellite provider for development and testing.
    Generates realistic, physically sound NDVI & NDWI values based on day-of-year
    phenology (Kharif / Rabi crop cycles in central and western India).
    """

    def __init__(self, satellite_name: str = "Sentinel-2-L2A"):
        self.satellite_name = satellite_name

    def fetch_indices(
        self,
        parcel_id: str,
        reading_date: date,
        geometry_wkt: Optional[str] = None,
    ) -> Dict[str, Any]:
        # Day of year phenological wave (Monsoon peak July-October; Rabi peak Nov-Feb)
        doy = reading_date.timetuple().tm_yday
        # Pseudo-random hash from parcel_id for consistency
        salt = int(hash(str(parcel_id)) % 1000) / 1000.0

        # Kharif peak: doy 230-260 (Aug-Sept)
        # Rabi peak: doy 350-40 (Dec-Jan)
        kharif_curve = math.sin((doy - 160) / 110.0 * math.pi) if 160 <= doy <= 290 else 0.0
        rabi_curve = math.sin((doy - 290) / 110.0 * math.pi) if (doy > 290 or doy < 70) else 0.0
        phenology = max(0.0, kharif_curve, rabi_curve)

        base_ndvi = 0.28 + (0.45 * phenology) + (salt * 0.12)
        ndvi = round(min(max(base_ndvi, 0.18), 0.88), 4)

        # NDWI moisture correlates with NDVI and rainy season
        base_moisture = -0.15 + (0.45 * phenology) + (salt * 0.08)
        moisture = round(min(max(base_moisture, -0.25), 0.55), 4)

        cloud_pct = round(12.0 * (1.0 - phenology * 0.5), 1)

        return {
            "ndvi_value": ndvi,
            "moisture_index": moisture,
            "cloud_coverage_pct": cloud_pct,
            "satellite_source": self.satellite_name,
        }


class RemoteSensingIngestor(BaseIngestor):
    """
    Weekly scheduled ingestor that samples active parcels and fetches
    Sentinel-2 vegetation indices, writing idempotently to `ndvi_readings`.
    """
    source_name = "REMOTE_SENSING"

    def __init__(self, provider: Optional[SatelliteDataProvider] = None, db_session=None):
        super().__init__(db_session=db_session)
        # Default pluggable provider
        self.provider = provider or MockSentinel2Provider()

    def ingest(
        self,
        result: IngestionResult,
        reading_date: Optional[date] = None,
        parcel_ids: Optional[List[Union[str, uuid.UUID]]] = None,
        **kwargs,
    ) -> None:
        target_date = reading_date or date.today()
        result.details["target_date"] = target_date.isoformat()

        session = self._get_sync_session()
        target_parcels: List[uuid.UUID] = []

        if parcel_ids:
            target_parcels = [uuid.UUID(str(p)) for p in parcel_ids]
        elif session:
            # Query all registered parcels
            stmt = select(LandParcel.parcel_id)
            target_parcels = list(session.execute(stmt).scalars().all())

        if not target_parcels:
            # Fallback to seed parcels for automated pipeline execution
            target_parcels = [uuid.UUID("11111111-1111-1111-1111-111111111111")]

        result.details["parcels_processed"] = len(target_parcels)

        for p_id in target_parcels:
            try:
                # 1. Fetch satellite observation from pluggable provider
                spectral = self.provider.fetch_indices(
                    parcel_id=str(p_id),
                    reading_date=target_date,
                )

                ndvi_val = Decimal(str(spectral["ndvi_value"]))
                moisture_val = Decimal(str(spectral["moisture_index"])) if spectral.get("moisture_index") is not None else None
                cloud_pct = Decimal(str(spectral.get("cloud_coverage_pct", 0.0)))
                source = str(spectral.get("satellite_source", "Sentinel-2-L2A"))

                # 2. Idempotent Upsert into ndvi_readings
                if session:
                    stmt = select(NDVIReading).where(
                        NDVIReading.parcel_id == p_id,
                        NDVIReading.reading_date == target_date,
                    )
                    existing = session.execute(stmt).scalars().first()

                    if existing:
                        existing.ndvi_value = ndvi_val
                        existing.moisture_index = moisture_val
                        existing.cloud_coverage_pct = cloud_pct
                        existing.satellite_source = source
                        result.rows_skipped += 1
                        self.logger.debug(f"Updated existing NDVI for parcel {p_id} on {target_date}")
                    else:
                        new_reading = NDVIReading(
                            reading_id=uuid.uuid4(),
                            parcel_id=p_id,
                            ndvi_value=ndvi_val,
                            moisture_index=moisture_val,
                            reading_date=target_date,
                            cloud_coverage_pct=cloud_pct,
                            satellite_source=source,
                        )
                        session.add(new_reading)
                        result.rows_ingested += 1
                        self.logger.debug(f"Inserted NDVI reading for parcel {p_id} on {target_date}")

                    session.commit()
                else:
                    # Simulation/dry-run mode
                    result.rows_ingested += 1

            except Exception as e:
                self.logger.warning(f"Error sampling remote sensing for parcel {p_id}: {e}")
                result.rows_failed += 1
                result.errors.append(f"Parcel {p_id}: {str(e)}")
                if session:
                    session.rollback()

        if self.db_session is None and session:
            session.close()
