"""Stage 7 Integration Test Suite: FPO Portal & Aggregation Endpoints.

Verifies:
1. Multi-tenant role-based access control & cross-FPO isolation (hard 403).
2. Portfolio summary aggregation (score distribution, risk mix, verified volume).
3. Member management (search, data update flags, FPO-level permissioned passports).
4. Production attestation workflow (verified_by_fpo=True & audit log recording).
5. Bulk financing negotiation summary for banks.
"""

import uuid
import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.api.v1.endpoints.fpo import _ATTESTATION_AUDIT_LOGS


class TestStage7FPOAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.fpo_id = "11111111-1111-1111-1111-111111111111"
        cls.other_fpo_id = "22222222-2222-2222-2222-222222222222"
        cls.headers = {
            "X-FPO-ID": cls.fpo_id,
            "X-FPO-Admin-Key": "fpo_admin_key_nashik_01",
        }

    # -------------------------------------------------------------------------
    # 1. Multi-Tenant Role-Based Isolation Tests
    # -------------------------------------------------------------------------

    def test_tenant_isolation_cross_fpo_header_fails_403(self):
        """Verify an admin for FPO 2 attempting to view FPO 1 is rejected with HTTP 403."""
        cross_headers = {
            "X-FPO-ID": self.other_fpo_id,  # Admin belongs to FPO 2
        }
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/portfolio-summary",  # Trying to access FPO 1
            headers=cross_headers,
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("Cross-FPO Access Denied", res.json()["detail"])

    def test_tenant_isolation_cross_fpo_key_fails_403(self):
        """Verify an admin key belonging to FPO 2 cannot access FPO 1 data."""
        cross_headers = {
            "X-FPO-Admin-Key": "fpo_admin_key_pune_02",  # Key for FPO 2
        }
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/members",
            headers=cross_headers,
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("Cross-FPO Access Denied", res.json()["detail"])

    # -------------------------------------------------------------------------
    # 2. Portfolio Summary Tests
    # -------------------------------------------------------------------------

    def test_portfolio_summary_shape_and_aggregation(self):
        """Verify GET /portfolio-summary returns score distribution, volume, and risk mix."""
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/portfolio-summary",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["fpo_id"], self.fpo_id)
        self.assertIn("score_distribution", data)
        self.assertIn("risk_mix", data)
        self.assertGreater(data["total_members"], 0)
        self.assertGreater(data["total_verified_volume_inr"], 0)

        # Check score distribution tiers
        dist = data["score_distribution"]
        self.assertIn("tier_0_49", dist)
        self.assertIn("tier_50_69", dist)
        self.assertIn("tier_70_79", dist)

        # Check risk mix
        risk = data["risk_mix"]
        self.assertIn("low", risk)
        self.assertIn("moderate", risk)
        self.assertIn("high", risk)

    # -------------------------------------------------------------------------
    # 3. Member Management & Flagging Tests
    # -------------------------------------------------------------------------

    def test_member_listing_and_search(self):
        """Verify listing members and search filtering."""
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/members",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        members = res.json()
        self.assertGreater(len(members), 0)

        # Test search query
        res_search = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/members?search=Sunita",
            headers=self.headers,
        )
        self.assertEqual(res_search.status_code, 200)
        search_members = res_search.json()
        self.assertEqual(len(search_members), 1)
        self.assertEqual(search_members[0]["full_name"], "Sunita Deshmukh")

    def test_member_needs_data_update_filter(self):
        """Verify filtering for members needing data updates."""
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/members?needs_update_only=true",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        flagged = res.json()
        self.assertTrue(all(m["needs_data_update"] is True for m in flagged))
        self.assertTrue(any(len(m["missing_data_reasons"]) > 0 for m in flagged))

    def test_member_passport_fpo_permission_and_zero_pii(self):
        """Verify individual member passport is scrubbed of Aadhaar / raw banking credentials."""
        farmer_id = "3fa85f64-5717-4562-b3fc-2c963f66afa6"
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/farmer/{farmer_id}/passport",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["farmer_id"], farmer_id)
        self.assertIn("agritrust_score", data)
        self.assertIn("safe_limit", data)
        self.assertIn("telemetry", data)

        # Zero-PII assertions
        self.assertNotIn("aadhaar_hash", data)
        self.assertNotIn("mobile_number", data)

    # -------------------------------------------------------------------------
    # 4. Production Attestation & Audit Logging Tests
    # -------------------------------------------------------------------------

    def test_pending_attestations_listing(self):
        """Verify listing pending delivery slips awaiting attestation."""
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/pending-attestations",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        pending = res.json()
        self.assertIsInstance(pending, list)

    def test_attest_transaction_sets_verified_and_creates_audit_log(self):
        """Verify attesting transaction sets verified_by_fpo=True and writes immutable audit entry."""
        initial_log_count = len(_ATTESTATION_AUDIT_LOGS)
        tx_id = "tx_deliv_89102"

        payload = {
            "transaction_id": tx_id,
            "attested_by": "FPO_Supervisor_Kailas",
            "notes": "Verified against Lasalgaon Mandi weighing bridge receipt #84102",
        }

        res = self.client.post(
            f"/api/v1/fpo/{self.fpo_id}/attest-transaction",
            json=payload,
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertTrue(data["verified_by_fpo"])
        self.assertEqual(data["attested_by"], "FPO_Supervisor_Kailas")
        self.assertIn("audit_id", data)

        # Verify audit log was recorded
        self.assertEqual(len(_ATTESTATION_AUDIT_LOGS), initial_log_count + 1)
        last_audit = _ATTESTATION_AUDIT_LOGS[-1]
        self.assertEqual(last_audit["transaction_id"], tx_id)
        self.assertEqual(last_audit["attested_by"], "FPO_Supervisor_Kailas")

    # -------------------------------------------------------------------------
    # 5. Bulk Financing Summary Tests
    # -------------------------------------------------------------------------

    def test_bulk_financing_summary_metrics(self):
        """Verify bulk financing dossier calculation for bank negotiations."""
        res = self.client.get(
            f"/api/v1/fpo/{self.fpo_id}/bulk-financing-summary",
            headers=self.headers,
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["fpo_id"], self.fpo_id)
        self.assertGreater(data["aggregate_safe_credit_limit"], 10000000)  # > ₹1 Cr
        self.assertGreater(data["aggregate_repayment_capacity"], 10000000)
        self.assertGreater(data["proposed_interest_subvention_pct"], 0)
        self.assertGreater(len(data["covenants"]), 0)


if __name__ == "__main__":
    unittest.main()
