"""Unit tests for the new Sovereign Agricultural Datasets Ingestors: NHB, PM-KISAN, KCC, and ICAR."""

import unittest
from app.ingestion.nhb_ingestor import NHBIngestor
from app.ingestion.pmkisan_ingestor import PMKisanIngestor
from app.ingestion.kcc_advisory_ingestor import KCCAdvisoryIngestor
from app.ingestion.icar_disease_ingestor import ICARDiseaseIngestor
from app.ingestion.tasks import run_ingestion_now


class TestSovereignAgriculturalDatasets(unittest.TestCase):
    """Test the newly added sovereign Indian agricultural datasets ingestors."""

    def test_nhb_horticulture_ingestion(self):
        """Test NHB benchmark statistics ingestion for horticulture crops."""
        ingestor = NHBIngestor()
        res = ingestor.execute()
        self.assertEqual(res.status, "SUCCESS")
        self.assertGreaterEqual(res.rows_ingested, 5)
        self.assertEqual(res.source, "NHB")
        self.assertEqual(res.details.get("year"), "2025-2026")

    def test_pmkisan_dbt_ingestion(self):
        """Test PM-KISAN village-level beneficiary count ingestion."""
        ingestor = PMKisanIngestor()
        res = ingestor.execute(state="Punjab", district="Ludhiana")
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 3)
        self.assertEqual(res.source, "PM_KISAN")
        self.assertEqual(res.details.get("district"), "Ludhiana")

    def test_kcc_advisory_ingestion(self):
        """Test Kisan Call Centre farmer advisory logs ingestion."""
        ingestor = KCCAdvisoryIngestor()
        res = ingestor.execute(state="Punjab", season="Rabi")
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 3)
        self.assertEqual(res.source, "KCC_ADVISORY")

    def test_icar_disease_ingestion(self):
        """Test ICAR crop pest and disease image registry ingestion."""
        ingestor = ICARDiseaseIngestor()
        res = ingestor.execute()
        self.assertEqual(res.status, "SUCCESS")
        self.assertEqual(res.rows_ingested, 4)
        self.assertEqual(res.source, "ICAR_DISEASE")

    def test_run_ingestion_now_dispatchers(self):
        """Verify run_ingestion_now executes all 4 new dataset sources."""
        for src in ["NHB", "PM_KISAN", "KCC_ADVISORY", "ICAR_DISEASE"]:
            res = run_ingestion_now(src)
            self.assertEqual(res["status"], "SUCCESS")
            self.assertGreater(res["rows_ingested"], 0)


if __name__ == "__main__":
    unittest.main()
