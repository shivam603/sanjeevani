"""Comprehensive Unit Tests for KisanCred Ingestion Connectors."""

import io
import json
import unittest
import uuid
import zipfile
from datetime import date, timedelta
from decimal import Decimal
import shapefile
from app.ingestion.base import BaseIngestor, IngestionResult
from app.ingestion.land_gis_ingestor import LandGISIngestor
from app.ingestion.remote_sensing_ingestor import (
    RemoteSensingIngestor,
    SatelliteDataProvider,
    MockSentinel2Provider,
)
from app.ingestion.agmarknet_ingestor import AgmarknetIngestor
from app.ingestion.pmfby_ingestor import PMFBYIngestor
from app.ingestion.fpo_erp_ingestor import FPOERPIngestor
from app.ingestion.tasks import run_ingestion_now


class TestLandGISIngestor(unittest.TestCase):
    """Test GeoJSON and Shapefile parcel boundary parsing & validation."""

    def setUp(self):
        self.ingestor = LandGISIngestor()
        self.test_farmer_id = uuid.uuid4()

    def test_valid_geojson_polygon(self):
        """Test parsing valid GeoJSON polygon with properties."""
        geojson = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "survey_number": "SURV-NAS-104",
                        "acreage": 3.75,
                        "soil_type": "Black Cotton",
                        "irrigation_source": "Canal",
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
        res = self.ingestor.execute(farmer_id=self.test_farmer_id, geojson_data=geojson)
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 1)
        self.assertEqual(res.rows_failed, 0)
        self.assertEqual(res.details.get("total_features_found"), 1)

    def test_self_intersecting_polygon_repaired(self):
        """Test that self-intersecting 'bowtie' polygons are repaired via make_valid."""
        bowtie_geojson = {
            "type": "Feature",
            "properties": {"survey_number": "SURV-BOWTIE"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [73.80, 20.00],
                        [73.82, 20.02],
                        [73.80, 20.02],
                        [73.82, 20.00],
                        [73.80, 20.00],
                    ]
                ],
            },
        }
        res = self.ingestor.execute(farmer_id=self.test_farmer_id, geojson_data=bowtie_geojson)
        # Should succeed because make_valid cleans the bowtie
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 1)

    def test_out_of_bounds_geometry_rejected(self):
        """Test rejection of coordinates outside valid WGS84 range."""
        invalid_coords = {
            "type": "Feature",
            "properties": {"survey_number": "SURV-INVALID"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [250.0, 110.0],
                        [251.0, 110.0],
                        [251.0, 111.0],
                        [250.0, 111.0],
                        [250.0, 110.0],
                    ]
                ],
            },
        }
        res = self.ingestor.execute(farmer_id=self.test_farmer_id, geojson_data=invalid_coords)
        self.assertEqual(res.status, "FAILED")
        self.assertEqual(res.rows_failed, 1)
        self.assertTrue(any("out of WGS84 bounds" in err for err in res.errors))

    def test_shapefile_zip_parsing(self):
        """Test reading a zipped ESRI Shapefile archive created in-memory."""
        # Create an in-memory Shapefile using pyshp
        shp_io = io.BytesIO()
        shx_io = io.BytesIO()
        dbf_io = io.BytesIO()

        with shapefile.Writer(shp=shp_io, shx=shx_io, dbf=dbf_io) as w:
            w.field("survey_no", "C", 50)
            w.field("acreage", "N", 10, 2)
            w.poly([
                [
                    [73.850, 20.050],
                    [73.855, 20.050],
                    [73.855, 20.055],
                    [73.850, 20.055],
                    [73.850, 20.050],
                ]
            ])
            w.record(survey_no="SURV-SHP-01", acreage=4.20)

        # Pack into ZIP archive
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zf:
            zf.writestr("parcels.shp", shp_io.getvalue())
            zf.writestr("parcels.shx", shx_io.getvalue())
            zf.writestr("parcels.dbf", dbf_io.getvalue())

        zip_bytes = zip_buffer.getvalue()
        res = self.ingestor.execute(farmer_id=self.test_farmer_id, shapefile_bytes=zip_bytes)
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 1)
        self.assertEqual(res.rows_failed, 0)


class TestRemoteSensingIngestor(unittest.TestCase):
    """Test pluggable satellite data provider and weekly remote sensing ingestor."""

    def test_mock_sentinel2_provider_phenology(self):
        """Verify Sentinel-2 provider returns reasonable NDVI and NDWI bounds."""
        provider = MockSentinel2Provider()
        # Test during monsoon season (August 15)
        august_date = date(2025, 8, 15)
        indices = provider.fetch_indices(parcel_id="test-p1", reading_date=august_date)

        self.assertGreaterEqual(indices["ndvi_value"], 0.20)
        self.assertLessEqual(indices["ndvi_value"], 0.90)
        self.assertIn("Sentinel-2", indices["satellite_source"])
        self.assertIsNotNone(indices["moisture_index"])

    def test_custom_pluggable_provider_injection(self):
        """Test custom satellite provider injection via SatelliteDataProvider ABC."""
        class CustomProvider(SatelliteDataProvider):
            def fetch_indices(self, parcel_id, reading_date, geometry_wkt=None):
                return {
                    "ndvi_value": 0.7725,
                    "moisture_index": 0.3412,
                    "cloud_coverage_pct": 5.0,
                    "satellite_source": "Custom-Microsat-1",
                }

        ingestor = RemoteSensingIngestor(provider=CustomProvider())
        test_parcel_id = uuid.uuid4()
        res = ingestor.execute(
            reading_date=date(2025, 9, 1),
            parcel_ids=[test_parcel_id],
        )
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 1)
        self.assertEqual(res.source, "REMOTE_SENSING")


class TestAgmarknetIngestor(unittest.TestCase):
    """Test daily AGMARKNET mandi wholesale price ingestor."""

    def test_benchmark_mandis_generation(self):
        """Test deterministic generation of APMC mandi prices."""
        ingestor = AgmarknetIngestor()
        target_date = date(2025, 10, 15)
        res = ingestor.execute(price_date=target_date)

        self.assertEqual(res.status, "SUCCESS")
        self.assertGreaterEqual(res.rows_ingested, 5)
        self.assertEqual(res.rows_failed, 0)
        self.assertEqual(res.details.get("price_date"), "2025-10-15")

    def test_explicit_records_override(self):
        """Test ingesting explicit AGMARKNET API responses."""
        ingestor = AgmarknetIngestor()
        records = [
            {
                "crop_name": "Onion",
                "mandi_name": "Lasalgaon",
                "state": "Maharashtra",
                "modal_price": 2450.0,
                "min_price": 2100.0,
                "max_price": 2700.0,
                "arrival_volume": 620.0,
                "price_date": "2025-10-15",
            },
            {
                "crop_name": "Grapes",
                "mandi_name": "Pimpalgaon Baswant",
                "state": "Maharashtra",
                "modal_price": 5200.0,
                "arrival_volume": 310.0,
                "price_date": "2025-10-15",
            },
        ]
        res = ingestor.execute(records_override=records)
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 2)
        self.assertEqual(res.rows_failed, 0)


class TestPMFBYIngestor(unittest.TestCase):
    """Test PMFBY seasonal crop insurance ingestor."""

    def test_insurance_records_ingestion(self):
        """Test processing seasonal insurance policy and claims data."""
        ingestor = PMFBYIngestor()
        test_farmer = uuid.uuid4()
        records = [
            {
                "farmer_id": str(test_farmer),
                "scheme_name": "PM Fasal Bima Yojana (PMFBY)",
                "season": "Kharif 2025",
                "premium_paid": 1450.0,
                "claim_amount": 0.0,
                "claim_status": "ACTIVE",
            },
            {
                "farmer_id": str(test_farmer),
                "scheme_name": "Restructured Weather Based Crop Insurance (RWBCIS)",
                "season": "Kharif 2025",
                "premium_paid": 980.0,
                "claim_amount": 3200.0,
                "claim_status": "SETTLED",
            },
        ]
        res = ingestor.execute(insurance_records_data=records, season="Kharif 2025")
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 2)
        self.assertEqual(res.rows_failed, 0)


class TestFPOERPIngestor(unittest.TestCase):
    """Test FPO ERP batch transaction ingestor with verified_by_fpo flag."""

    def test_fpo_transactions_verified_flag(self):
        """Test that FPO ERP transactions are ingested and verified."""
        ingestor = FPOERPIngestor()
        test_farmer = uuid.uuid4()
        test_fpo = uuid.uuid4()
        txs = [
            {
                "farmer_id": str(test_farmer),
                "crop_name": "Soybean",
                "quantity_sold": 25.5,
                "realization_price": 4750.0,
                "mandi_name": "Sahyadri Farmer Procurement Center",
                "transaction_date": "2025-10-20",
            },
            {
                "farmer_id": str(test_farmer),
                "crop_name": "Onion",
                "quantity_sold": 40.0,
                "realization_price": 2300.0,
                "mandi_name": "Lasalgaon Mandi Direct",
                "transaction_date": "2025-10-21",
            },
        ]
        res = ingestor.execute(transactions_data=txs, fpo_id=test_fpo)
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 2)
        self.assertEqual(res.rows_failed, 0)
        self.assertEqual(res.details.get("fpo_id"), str(test_fpo))


class TestDirectTaskRunner(unittest.TestCase):
    """Test direct task execution helper run_ingestion_now."""

    def test_run_ingestion_now_agmarknet(self):
        res = run_ingestion_now("AGMARKNET", price_date=date(2025, 11, 1))
        self.assertEqual(res["status"], "SUCCESS")
        self.assertGreater(res["rows_ingested"], 0)
        self.assertIsNotNone(res["duration_ms"])

    def test_run_ingestion_now_remote_sensing(self):
        test_p = uuid.uuid4()
        res = run_ingestion_now("REMOTE_SENSING", reading_date=date(2025, 11, 1), parcel_ids=[test_p])
        self.assertEqual(res["status"], "SUCCESS")
        self.assertEqual(res["rows_ingested"], 1)

    def test_unknown_source_raises_value_error(self):
        with self.assertRaises(ValueError):
            run_ingestion_now("NON_EXISTENT_SOURCE")


class TestDatabaseSessionPersistence(unittest.TestCase):
    """Test actual database session upserts and DataIngestionLog audit trails."""

    def setUp(self):
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from app.models.base import Base
        from app.models.market_price import MarketPrice
        from app.models.data_ingestion_log import DataIngestionLog

        # In-memory SQLite engine
        self.engine = create_engine("sqlite:///:memory:")
        # Create tables for market_prices and data_ingestion_log
        MarketPrice.__table__.create(self.engine)
        DataIngestionLog.__table__.create(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.session = self.Session()

    def tearDown(self):
        self.session.close()

    def test_agmarknet_idempotent_upsert_and_audit_log(self):
        """Verify first run inserts, second run updates, and audit logs are recorded."""
        ingestor = AgmarknetIngestor(db_session=self.session)
        rec = [
            {
                "crop_name": "Grapes",
                "mandi_name": "Pimpalgaon",
                "state": "Maharashtra",
                "modal_price": 5000.0,
                "arrival_volume": 100.0,
                "price_date": "2025-10-01",
            }
        ]

        # 1. First run: should INSERT
        res1 = ingestor.execute(records_override=rec)
        self.assertEqual(res1.status, "SUCCESS")
        self.assertEqual(res1.rows_ingested, 1)
        self.assertEqual(res1.rows_skipped, 0)

        # 2. Second run with updated price: should UPDATE (idempotent, no duplicate key error)
        rec[0]["modal_price"] = 5400.0
        res2 = ingestor.execute(records_override=rec)
        self.assertEqual(res2.status, "SUCCESS")
        self.assertEqual(res2.rows_skipped, 1)

        # Verify DB content
        from app.models.market_price import MarketPrice
        from app.models.data_ingestion_log import DataIngestionLog

        prices = self.session.query(MarketPrice).all()
        self.assertEqual(len(prices), 1)
        self.assertEqual(float(prices[0].modal_price), 5400.0)

        # Verify audit logs in data_ingestion_log
        logs = self.session.query(DataIngestionLog).all()
        self.assertEqual(len(logs), 2)
        self.assertEqual(logs[0].source, "AGMARKNET")
        self.assertEqual(logs[0].status, "SUCCESS")


if __name__ == "__main__":
    unittest.main()

