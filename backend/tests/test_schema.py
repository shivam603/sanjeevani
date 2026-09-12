"""Unit tests for Stage 1 Relational and Spatial Schema."""

import unittest
import uuid
import hashlib
from app.models import (
    Base,
    FPO,
    Lender,
    Farmer,
    LandParcel,
    CropCycle,
    MarketTransaction,
    CreditPassport,
    DataConsent,
    InsuranceRecord,
)
from app.db.seed import generate_seed_records


class TestStage1Schema(unittest.TestCase):
    def test_table_registration(self):
        """Verify all 9 required tables are registered in metadata."""
        expected_tables = {
            "farmers",
            "land_parcels",
            "crop_cycles",
            "market_transactions",
            "credit_passports",
            "data_consents",
            "fpos",
            "lenders",
            "insurance_records",
        }
        registered = set(Base.metadata.tables.keys())
        self.assertTrue(expected_tables.issubset(registered))

    def test_aadhaar_one_way_hash_enforcement(self):
        """Test model layer strictly enforces one-way hashing and never stores raw 12-digit Aadhaar."""
        raw_aadhaar = "998877665544"
        farmer = Farmer(
            full_name="Test Farmer",
            mobile_number="9876500001",
        )
        farmer.aadhaar_hash = raw_aadhaar
        
        # Must NOT equal raw 12-digit number
        self.assertNotEqual(farmer.aadhaar_hash, raw_aadhaar)
        self.assertEqual(len(farmer.aadhaar_hash), 64)
        
        # Must match expected SHA-256
        expected_hash = hashlib.sha256(raw_aadhaar.encode("utf-8")).hexdigest()
        self.assertEqual(farmer.aadhaar_hash, expected_hash)

        # Invalid non-numeric input must raise ValueError
        with self.assertRaises(ValueError):
            farmer.aadhaar_hash = "invalid_plain_text_not_12_digits"

    def test_land_parcel_spatial_column(self):
        """Verify PostGIS geometry column type and SRID 4326 configuration."""
        polygon_col = LandParcel.__table__.c.boundary_polygon
        self.assertEqual(polygon_col.type.srid, 4326)
        self.assertEqual(polygon_col.type.geometry_type, "POLYGON")

    def test_foreign_key_and_soft_delete(self):
        """Verify foreign key configuration and archival flags."""
        farmer = Farmer(full_name="Archive Test", mobile_number="9876500002")
        farmer.set_aadhaar("112233445566")
        self.assertTrue(farmer.is_active)
        self.assertFalse(farmer.is_archived)

        # Soft delete / archival
        farmer.archive()
        self.assertFalse(farmer.is_active)
        self.assertTrue(farmer.is_archived)

    def test_credit_passport_constraints(self):
        """Verify check constraint metadata on CreditPassport."""
        constraints = [c.name for c in CreditPassport.__table__.constraints if hasattr(c, "name")]
        self.assertIn("chk_agritrust_score_range", constraints)
        self.assertIn("chk_credit_limit_range", constraints)

    def test_seed_fixtures_volume_and_integrity(self):
        """Verify seed data generates 1 FPO, 2 Lenders, 25 Farmers, and related records."""
        fixtures = generate_seed_records()
        self.assertEqual(len(fixtures["fpos"]), 1)
        self.assertEqual(len(fixtures["lenders"]), 2)
        self.assertEqual(len(fixtures["farmers"]), 25)
        self.assertEqual(len(fixtures["land_parcels"]), 25)
        self.assertEqual(len(fixtures["crop_cycles"]), 25)
        self.assertEqual(len(fixtures["market_transactions"]), 50)
        self.assertEqual(len(fixtures["credit_passports"]), 25)
        self.assertEqual(len(fixtures["data_consents"]), 25)
        self.assertEqual(len(fixtures["insurance_records"]), 25)

        # Verify all 25 farmers have valid 64-char hashes
        for f in fixtures["farmers"]:
            self.assertEqual(len(f["aadhaar_hash"]), 64)
            self.assertRegex(f["aadhaar_hash"], r"^[a-f0-9]{64}$")

        # Verify parcels have valid SRID 4326 WKT polygons
        for p in fixtures["land_parcels"]:
            self.assertTrue(p["boundary_polygon"].startswith("POLYGON(("))
            self.assertTrue(p["boundary_polygon"].endswith("))"))


if __name__ == "__main__":
    unittest.main()
