"""End-to-End Pilot Pipeline Integration Test Suite.

Simulates the complete pilot operational lifecycle across all subsystems:
1. Ingestion: Ingests data from all 5 sources (Land GIS, Remote Sensing, AGMARKNET, PMFBY, FPO ERP).
2. Scoring: Runs Models A, B, C, D to compute AgriTrust score & generate Credit Passport.
3. Consent: Farmer grants sovereign cryptographic consent to SBI with authorized scopes.
4. Credit Profile: Lender fetches consent-gated credit profile (Zero-PII guaranteed).
5. Underwriting Dossier: Lender retrieves multi-model dossier (Cashflow, Prices, Risk, Memo).
6. Loan Decision: Lender logs underwriting sanction against passport_id for model feedback.
"""

import json
import unittest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from app.main import app
from app.ingestion.tasks import run_ingestion_now
from pipelines.passport_orchestrator import generate_credit_passport


class TestPilotEndToEndPipeline(unittest.TestCase):
    active_consent_token = None
    active_consent_id = None
    active_passport_id = None

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.lender_api_key = "test_lender_key_sbi_01"
        cls.lender_id = "88888888-8888-8888-8888-888888888888"
        cls.farmer_id = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        cls.farmer_code = "NSK-101"

    # -------------------------------------------------------------------------
    # STEP 1: Multi-Source Data Ingestion
    # -------------------------------------------------------------------------
    def test_01_run_all_ingestion_connectors(self):
        """Execute ingestion across all 5 connectors and verify audit logs."""
        sources = ["LAND_GIS", "REMOTE_SENSING", "AGMARKNET", "PMFBY", "FPO_ERP"]
        for src in sources:
            result = run_ingestion_now(src)
            self.assertEqual(result["status"], "SUCCESS", f"Ingestion failed for {src}: {result.get('errors')}")
            self.assertGreater(result["rows_ingested"], 0, f"No rows ingested for {src}")

        # Check ingestion freshness endpoint
        res = self.client.get("/api/v1/health/ingestion-freshness")
        self.assertEqual(res.status_code, 200)
        freshness_data = res.json()
        self.assertGreaterEqual(freshness_data["platform_data_confidence"], 0.85)

    # -------------------------------------------------------------------------
    # STEP 2: ML Scoring & Credit Passport Generation
    # -------------------------------------------------------------------------
    def test_02_generate_credit_passport(self):
        """Run ML scoring orchestrator to calculate scores and issue passport."""
        passport = generate_credit_passport(farmer_id=self.farmer_id)
        self.assertIsNotNone(passport)
        self.assertEqual(passport["farmer_id"], self.farmer_id)
        self.assertGreaterEqual(passport["agritrust_score"], 300)
        self.assertLessEqual(passport["agritrust_score"], 900)
        self.assertGreater(passport["safe_credit_min"], 0)
        self.assertGreater(passport["safe_credit_max"], passport["safe_credit_min"])
        self.assertGreaterEqual(passport["data_confidence"], 0.70)
        self.assertIn("shap_explainability", passport)

    # -------------------------------------------------------------------------
    # STEP 3: Farmer Sovereign Consent Grant
    # -------------------------------------------------------------------------
    def test_03_farmer_grants_sovereign_consent(self):
        """Farmer grants time-bound cryptographic consent to State Bank of India."""
        consent_payload = {
            "farmer_id": self.farmer_id,
            "lender_id": self.lender_id,
            "shared_attributes": [
                "agritrust_score",
                "data_confidence",
                "recommendations",
                "risk_profile",
            ],
            "validity_days": 30,
        }
        res = self.client.post("/api/v1/consent", json=consent_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()

        self.assertTrue(data["is_active"])
        self.assertIsNotNone(data["consent_token"])
        self.assertIn("expires_at", data)
        self.assertEqual(data["farmer_id"], self.farmer_id)
        self.assertEqual(data["lender_id"], self.lender_id)

        # Cache consent token for subsequent steps
        TestPilotEndToEndPipeline.active_consent_token = data["consent_token"]
        TestPilotEndToEndPipeline.active_consent_id = data["consent_id"]

    # -------------------------------------------------------------------------
    # STEP 4: Lender Pulls Consent-Gated Credit Profile (Zero-PII)
    # -------------------------------------------------------------------------
    def test_04_lender_pulls_credit_profile(self):
        """Lender queries credit profile using API Key and active consent token."""
        token = TestPilotEndToEndPipeline.active_consent_token
        self.assertIsNotNone(token, "Consent token was not set in step 3")
        headers = {
            "X-API-Key": self.lender_api_key,
            "X-Consent-Token": token,
        }
        res = self.client.get(
            f"/api/v1/farmer/{self.farmer_id}/credit-profile",
            headers=headers,
        )
        self.assertEqual(res.status_code, 200)
        profile = res.json()

        # Check required schema shape
        self.assertEqual(profile["farmer_id"], self.farmer_id)
        self.assertIn("agritrust_score", profile)
        self.assertIn("data_confidence", profile)
        self.assertIn("recommendations", profile)
        self.assertIn("risk_profile", profile)

        # STRICT ZERO-PII GUARANTEE
        raw_text = res.text.lower()
        self.assertNotIn("aadhaar", raw_text)
        self.assertNotIn("mobile_number", raw_text)
        self.assertNotIn("phone", raw_text)

    # -------------------------------------------------------------------------
    # STEP 5: Lender Retrieves Deep Underwriting Dossier
    # -------------------------------------------------------------------------
    def test_05_lender_retrieves_underwriting_dossier(self):
        """Lender accesses multi-model dossier (Models B, C, D & Stage 4 memorandum)."""
        token = TestPilotEndToEndPipeline.active_consent_token or "hmac_sha256_sbi_demo.78f92ab84c019d3e8"
        headers = {
            "X-API-Key": self.lender_api_key,
            "X-Consent-Token": token,
        }
        res = self.client.get(
            f"/api/v1/lender/farmer/{self.farmer_id}/underwriting-dossier",
            headers=headers,
        )
        self.assertEqual(res.status_code, 200)
        dossier = res.json()

        # Model B: Cashflow engine
        self.assertIn("cash_flow", dossier)
        self.assertGreater(dossier["cash_flow"]["net_cashflow_inr"], 0)
        self.assertGreater(dossier["cash_flow"]["dscr"], 1.0)

        # Model D: Price projections
        self.assertIn("price_projections", dossier)
        self.assertEqual(len(dossier["price_projections"]["scenarios"]), 3)

        # Model C: Crop risk
        self.assertIn("crop_risk", dossier)
        self.assertIn("climate_resilience_score", dossier["crop_risk"])

        # Stage 4: Institutional explanation
        self.assertIn("lender_explanation", dossier)
        self.assertEqual(dossier["lender_explanation"]["audience"], "lender")
        self.assertIn("underwriting_covenants", dossier["lender_explanation"])

        # Save passport_id for decision logging
        TestPilotEndToEndPipeline.active_passport_id = dossier["passport_id"]

    # -------------------------------------------------------------------------
    # STEP 6: Lender Records Loan Underwriting Decision
    # -------------------------------------------------------------------------
    def test_06_lender_records_loan_decision(self):
        """Lender logs loan sanction decision against passport_id for model feedback."""
        passport_id = TestPilotEndToEndPipeline.active_passport_id or "pass_78492019-d83a-493a-810a-203847291a0b"
        headers = {
            "X-API-Key": self.lender_api_key,
        }
        decision_payload = {
            "passport_id": passport_id,
            "farmer_id": self.farmer_id,
            "decision": "APPROVED",
            "approved_amount": 150000.0,
            "tenure_months": 12,
            "interest_rate_pct": 7.0,
            "covenants": "Mandatory PMFBY crop insurance policy and FPO settlement escrow",
            "notes": "Pilot phase 1 approved under priority sector lending terms",
        }
        res = self.client.post(
            "/api/v1/lender/loan-decisions",
            json=decision_payload,
            headers=headers,
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()

        self.assertIn("decision_id", data)
        self.assertEqual(data["decision"], "APPROVED")
        self.assertEqual(data["approved_amount"], 150000.0)
        self.assertEqual(data["passport_id"], passport_id)

        # Confirm listing endpoint contains recorded decision
        list_res = self.client.get(
            "/api/v1/lender/loan-decisions",
            headers=headers,
        )
        self.assertEqual(list_res.status_code, 200)
        decision_ids = [d["decision_id"] for d in list_res.json()]
        self.assertIn(data["decision_id"], decision_ids)


if __name__ == "__main__":
    unittest.main()
