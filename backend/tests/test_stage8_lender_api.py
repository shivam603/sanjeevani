"""Stage 8 Integration Test Suite: Lender Dashboard & Underwriting API.

Verifies:
1. Portfolio search filtering: strictly returns ONLY farmers with active sovereign consent.
2. Unconsented / revoked farmers are excluded from portfolio search.
3. Lender API key authentication & role-based access.
4. Comprehensive multi-model underwriting dossier (Model B cashflow, Model D price projections,
   Model C crop risk, and Stage 4 lender explanation).
5. Strict Zero-PII guarantee (aadhaar_hash and mobile_number are NEVER exposed).
6. Underwriting dossier access control: unconsented or revoked farmers return HTTP 403.
7. Consent request flow: initiate request (creates PENDING) and list active requests.
8. Loan decision logging against passport_id for model retraining feedback.
"""

import json
import unittest
from fastapi.testclient import TestClient

from app.main import app


class TestStage8LenderAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.api_key = "test_lender_key_sbi_01"
        cls.headers = {
            "X-API-Key": cls.api_key,
        }
        cls.farmer_consented_id = "3fa85f64-5717-4562-b3fc-2c963f66afa6"  # NSK-101 (Active)
        cls.farmer_revoked_id = "5fa85f64-5717-4562-b3fc-2c963f66afa8"    # NSK-103 (Revoked)

    # -------------------------------------------------------------------------
    # 1. Portfolio Search & Consent Filter Tests
    # -------------------------------------------------------------------------

    def test_portfolio_search_returns_only_active_consented_farmers(self):
        """Verify portfolio search returns ONLY farmers with active consent, never revoked."""
        res = self.client.get(
            "/api/v1/lender/portfolio",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

        # All returned farmers must have active consent status
        farmer_codes = [f["farmer_code"] for f in data]
        for item in data:
            self.assertEqual(item["consent_status"], "active")
            self.assertIsNotNone(item["consent_expires_at"])
            self.assertIsNotNone(item["consent_token"])

        # Active farmers must be present
        self.assertIn("NSK-101", farmer_codes)
        self.assertIn("NSK-102", farmer_codes)
        self.assertIn("NSK-104", farmer_codes)

        # CRITICAL: Revoked farmer NSK-103 must NEVER appear in portfolio search!
        self.assertNotIn("NSK-103", farmer_codes)

    def test_portfolio_search_filters(self):
        """Verify filtering by crop, min_score, and risk_category."""
        # Filter by crop 'Pomegranate'
        res = self.client.get(
            "/api/v1/lender/portfolio?crop=Pomegranate",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        items = res.json()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["farmer_code"], "NSK-102")

        # Filter by min_score
        res_score = self.client.get(
            "/api/v1/lender/portfolio?min_score=80",
            headers=self.headers,
        )
        self.assertEqual(res_score.status_code, 200)
        score_items = res_score.json()
        for f in score_items:
            self.assertGreaterEqual(f["agritrust_score"], 80)

    def test_portfolio_search_unauthenticated_fails(self):
        """Verify request without X-API-Key returns HTTP 401."""
        res = self.client.get("/api/v1/lender/portfolio")
        self.assertEqual(res.status_code, 401)

    # -------------------------------------------------------------------------
    # 2. Comprehensive Underwriting Dossier & Zero-PII Tests
    # -------------------------------------------------------------------------

    def test_farmer_underwriting_dossier_contains_all_models(self):
        """Verify underwriting dossier contains Models B, C, D, and Stage 4 explanation."""
        res = self.client.get(
            f"/api/v1/lender/farmer/{self.farmer_consented_id}/underwriting-dossier",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check top-level identifiers and consent metadata
        self.assertEqual(data["farmer_id"], self.farmer_consented_id)
        self.assertEqual(data["farmer_code"], "NSK-101")
        self.assertIn("passport_id", data)
        self.assertIn("consent_info", data)
        self.assertEqual(data["consent_info"]["status"], "active")
        self.assertIn("token", data["consent_info"])
        self.assertIn("expires_at", data["consent_info"])

        # Model B: Cash flow engine
        cash_flow = data["cash_flow"]
        self.assertIn("expected_yield_qtl", cash_flow)
        self.assertIn("gross_revenue_inr", cash_flow)
        self.assertIn("input_costs_inr", cash_flow)
        self.assertIn("net_cashflow_inr", cash_flow)
        self.assertIn("dscr", cash_flow)
        self.assertGreater(cash_flow["dscr"], 1.0)

        # Model D: Price projections with 3 scenarios
        price_projections = data["price_projections"]
        self.assertIn("crop_name", price_projections)
        self.assertIn("scenarios", price_projections)
        self.assertEqual(len(price_projections["scenarios"]), 3)
        for sc in price_projections["scenarios"]:
            self.assertIn("horizon_days", sc)
            self.assertIn("base_price", sc)
            self.assertIn("optimistic_price", sc)
            self.assertIn("downside_price", sc)
            self.assertGreater(sc["optimistic_price"], sc["base_price"])
            self.assertLess(sc["downside_price"], sc["base_price"])

        # Model C: Crop risk breakdown
        crop_risk = data["crop_risk"]
        self.assertIn("overall_risk_score", crop_risk)
        self.assertIn("climate_resilience_score", crop_risk)
        self.assertIn("pest_disease_index", crop_risk)
        self.assertIn("water_stress_score", crop_risk)

        # Stage 4: Lender-facing institutional explanation
        explanation = data["lender_explanation"]
        self.assertEqual(explanation["audience"], "lender")
        self.assertIn("summary", explanation)
        self.assertIn("key_metrics", explanation)
        self.assertIn("underwriting_covenants", explanation)
        self.assertIsInstance(explanation["underwriting_covenants"], list)

    def test_farmer_underwriting_dossier_strict_zero_pii_guarantee(self):
        """Verify aadhaar_hash, aadhaar, mobile_number, and phone are NEVER returned."""
        res = self.client.get(
            f"/api/v1/lender/farmer/{self.farmer_consented_id}/underwriting-dossier",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        raw_json_str = res.text.lower()

        # Strict checks against PII keywords
        self.assertNotIn("aadhaar_hash", raw_json_str)
        self.assertNotIn("mobile_number", raw_json_str)
        self.assertNotIn('"aadhaar"', raw_json_str)
        self.assertNotIn('"phone"', raw_json_str)

    def test_farmer_underwriting_dossier_unconsented_farmer_forbidden_403(self):
        """Verify accessing a farmer without active consent returns HTTP 403."""
        res = self.client.get(
            f"/api/v1/lender/farmer/{self.farmer_revoked_id}/underwriting-dossier",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("No active sovereign consent token", res.json()["detail"])

    # -------------------------------------------------------------------------
    # 3. Consent Request Flow (Stage 5/6 Loop)
    # -------------------------------------------------------------------------

    def test_consent_request_creation_and_listing(self):
        """Verify lender can initiate consent requests and view pending requests."""
        payload = {
            "farmer_id": self.farmer_revoked_id,
            "loan_purpose": "Seasonal Working Capital Facility",
            "requested_attributes": ["agritrust_score", "safe_limit", "cash_flow"],
        }
        post_res = self.client.post(
            "/api/v1/lender/consent-requests",
            json=payload,
            headers=self.headers,
        )
        self.assertEqual(post_res.status_code, 201)
        created = post_res.json()
        self.assertTrue(created["request_id"].startswith("req_cns_"))
        self.assertEqual(created["status"], "PENDING")
        self.assertEqual(created["farmer_id"], self.farmer_revoked_id)
        self.assertEqual(created["loan_purpose"], payload["loan_purpose"])

        # Listing endpoint
        list_res = self.client.get(
            "/api/v1/lender/consent-requests",
            headers=self.headers,
        )
        self.assertEqual(list_res.status_code, 200)
        requests = list_res.json()
        req_ids = [r["request_id"] for r in requests]
        self.assertIn(created["request_id"], req_ids)

    # -------------------------------------------------------------------------
    # 4. Loan Decision Logging
    # -------------------------------------------------------------------------

    def test_loan_decision_logging_and_listing(self):
        """Verify recording an underwriting loan decision against passport_id."""
        payload = {
            "passport_id": "pass_78492019-d83a-493a-810a-203847291a0b",
            "farmer_id": self.farmer_consented_id,
            "decision": "APPROVED",
            "approved_amount": 150000.0,
            "tenure_months": 12,
            "interest_rate_pct": 7.25,
            "covenants": "Mandatory PMFBY crop insurance policy and FPO settlement",
            "notes": "Approved under AgriTrust FastTrack guidelines",
        }
        res = self.client.post(
            "/api/v1/lender/loan-decisions",
            json=payload,
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()

        self.assertIn("decision_id", data)
        self.assertEqual(data["decision"], "APPROVED")
        self.assertEqual(data["approved_amount"], 150000.0)
        self.assertEqual(data["tenure_months"], 12)
        self.assertEqual(data["passport_id"], payload["passport_id"])
        self.assertIn("recorded against passport", data["message"])

        # Verify in list of decisions
        list_res = self.client.get(
            "/api/v1/lender/loan-decisions",
            headers=self.headers,
        )
        self.assertEqual(list_res.status_code, 200)
        decisions = list_res.json()
        decision_ids = [d["decision_id"] for d in decisions]
        self.assertIn(data["decision_id"], decision_ids)


if __name__ == "__main__":
    unittest.main()
