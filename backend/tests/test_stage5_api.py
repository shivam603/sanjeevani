"""Integration tests for Stage 5 REST API layer & Sovereign Consent Security Backbone."""

from datetime import datetime, timedelta, timezone
import json
import unittest
import uuid
import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend and ml-engine on path
root_dir = Path(__file__).resolve().parent.parent.parent
for p in [str(root_dir / "backend"), str(root_dir / "ml-engine"), str(root_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app
from app.core.security import (
    create_signed_consent_token,
    hash_api_key,
    lender_rate_limiter,
)
from app.api.v1.endpoints.credit import TEST_LENDERS, _IN_MEMORY_PASSPORTS
from app.api.v1.endpoints.consent import _CONSENT_DB_CACHE


class TestStage5ConsentAndCreditAPI(unittest.TestCase):
    """Test suite covering the 5 Stage 5 REST endpoints and security contracts."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.test_farmer_id = str(uuid.uuid4())
        cls.test_lender_key = "test_lender_key_sbi_01"
        cls.test_lender_id = TEST_LENDERS[cls.test_lender_key]["lender_id"]
        cls.headers = {"X-API-Key": cls.test_lender_key}

    def setUp(self):
        # Reset rate limiter before each test
        lender_rate_limiter.reset()

    # -------------------------------------------------------------------------
    # 1. Consent Grant & Revocation Lifecycle Tests
    # -------------------------------------------------------------------------

    def test_consent_grant_and_revocation_lifecycle(self):
        """Test POST /api/v1/consent grants token, and DELETE /api/v1/consent/{id} revokes it."""
        farmer_id = str(uuid.uuid4())
        lender_id = self.test_lender_id

        # 1. Grant consent
        grant_payload = {
            "farmer_id": farmer_id,
            "lender_id": lender_id,
            "shared_attributes": ["agritrust_score", "safe_limit", "crop_risk"],
            "validity_days": 15,
            "purpose": "KCC Season Loan",
        }
        res = self.client.post("/api/v1/consent", json=grant_payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        
        self.assertTrue(data["is_active"])
        self.assertEqual(data["farmer_id"], farmer_id)
        self.assertEqual(data["lender_id"], lender_id)
        self.assertIn("consent_token", data)
        self.assertIn("consent_id", data)

        consent_id = data["consent_id"]
        token = data["consent_token"]

        # Verify profile accessible with this token
        prof_res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": token},
        )
        self.assertEqual(prof_res.status_code, 200)

        # 2. Revoke consent
        del_res = self.client.delete(f"/api/v1/consent/{consent_id}")
        self.assertEqual(del_res.status_code, 200)
        del_data = del_res.json()
        self.assertEqual(del_data["status"], "revoked")
        self.assertFalse(del_data["is_active"])

        # 3. Verify immediate hard-fail with 403 on revoked token
        revoked_res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": token},
        )
        self.assertEqual(revoked_res.status_code, 403)
        self.assertIn("revoked", revoked_res.json()["detail"].lower())

    def test_revoke_nonexistent_consent_returns_404(self):
        """Verify revoking invalid consent ID returns HTTP 404."""
        bad_id = str(uuid.uuid4())
        res = self.client.delete(f"/api/v1/consent/{bad_id}")
        self.assertEqual(res.status_code, 404)

    # -------------------------------------------------------------------------
    # 2. Lender Credit Profile Access & Security Hard-Fails (403)
    # -------------------------------------------------------------------------

    def test_lender_profile_valid_consent_success(self):
        """Verify valid consent token returns HTTP 200 with exact specified response shape."""
        farmer_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=30)
        cid = str(uuid.uuid4())

        token = create_signed_consent_token(
            consent_id=cid,
            farmer_id=farmer_id,
            lender_id=self.test_lender_id,
            shared_attributes=[
                "agritrust_score",
                "data_confidence",
                "safe_limit",
                "recommended_tenure_months",
                "loan_purpose",
                "expected_repayment_capacity",
                "crop_risk",
                "market_volatility",
            ],
            expires_at=expires_at,
        )

        res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": token},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check required schema shape:
        # { farmer_id, agritrust_score, data_confidence, recommendations, risk_profile }
        self.assertEqual(data["farmer_id"], farmer_id)
        self.assertIsInstance(data["agritrust_score"], int)
        self.assertIsInstance(data["data_confidence"], float)

        # Check recommendations sub-dict
        recs = data["recommendations"]
        self.assertIn("safe_limit", recs)
        self.assertIn("recommended_tenure_months", recs)
        self.assertIn("loan_purpose", recs)
        self.assertIn("expected_repayment_capacity", recs)

        # Check risk_profile sub-dict
        risk = data["risk_profile"]
        self.assertIn("crop_risk", risk)
        self.assertIn("market_volatility", risk)

    def test_lender_profile_no_consent_fails_403(self):
        """Verify requesting credit profile without consent token hard-fails with HTTP 403."""
        farmer_id = str(uuid.uuid4())
        res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers=self.headers,  # No X-Consent-Token header
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("consent token", res.json()["detail"].lower())

    def test_lender_profile_expired_consent_fails_403(self):
        """Verify expired consent token hard-fails with HTTP 403."""
        farmer_id = str(uuid.uuid4())
        past_time = datetime.now(timezone.utc) - timedelta(days=2)  # Expired 2 days ago
        cid = str(uuid.uuid4())

        expired_token = create_signed_consent_token(
            consent_id=cid,
            farmer_id=farmer_id,
            lender_id=self.test_lender_id,
            shared_attributes=["agritrust_score"],
            expires_at=past_time,
        )

        res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": expired_token},
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("expired", res.json()["detail"].lower())

    def test_lender_profile_tampered_token_fails_403(self):
        """Verify tampered cryptographic signature hard-fails with HTTP 403."""
        farmer_id = str(uuid.uuid4())
        valid_token = create_signed_consent_token(
            consent_id=str(uuid.uuid4()),
            farmer_id=farmer_id,
            lender_id=self.test_lender_id,
            shared_attributes=["agritrust_score"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=5),
        )
        
        # Tamper signature part
        payload_part, sig_part = valid_token.split(".")
        tampered_token = f"{payload_part}.{sig_part[:-4]}ffff"

        res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": tampered_token},
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("signature", res.json()["detail"].lower())

    def test_lender_profile_farmer_mismatch_fails_403(self):
        """Verify token for Farmer A cannot be used to read Farmer B's profile (HTTP 403)."""
        farmer_a = str(uuid.uuid4())
        farmer_b = str(uuid.uuid4())

        token_for_a = create_signed_consent_token(
            consent_id=str(uuid.uuid4()),
            farmer_id=farmer_a,
            lender_id=self.test_lender_id,
            shared_attributes=["agritrust_score"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=10),
        )

        res = self.client.get(
            f"/api/v1/farmer/{farmer_b}/credit-profile",  # Requesting Farmer B
            headers={**self.headers, "X-Consent-Token": token_for_a},
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("different farmer", res.json()["detail"].lower())

    # -------------------------------------------------------------------------
    # 3. Attribute Filtering Tests
    # -------------------------------------------------------------------------

    def test_attribute_filtering_excludes_unauthorized_fields(self):
        """
        Verify that attributes NOT included in farmer's shared_attributes
        are strictly excluded from the lender's response payload.
        """
        farmer_id = str(uuid.uuid4())
        cid = str(uuid.uuid4())

        # Farmer ONLY authorizes 'agritrust_score' and 'safe_limit'
        # Deliberately omits 'market_volatility', 'expected_repayment_capacity', 'crop_risk'
        token = create_signed_consent_token(
            consent_id=cid,
            farmer_id=farmer_id,
            lender_id=self.test_lender_id,
            shared_attributes=["agritrust_score", "safe_limit"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=10),
        )

        res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": token},
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Authorized fields present
        self.assertIsNotNone(data["agritrust_score"])
        self.assertIn("safe_limit", data["recommendations"])

        # Unauthorized fields EXCLUDED
        self.assertIsNone(data["data_confidence"])
        self.assertNotIn("market_volatility", data["risk_profile"])
        self.assertNotIn("crop_risk", data["risk_profile"])
        self.assertNotIn("expected_repayment_capacity", data["recommendations"])
        self.assertNotIn("recommended_tenure_months", data["recommendations"])

    # -------------------------------------------------------------------------
    # 4. Mandatory Zero-PII Security Test
    # -------------------------------------------------------------------------

    def test_pii_strictly_excluded_from_lender_response(self):
        """
        CRITICAL REQUIREMENT:
        Personal identification (aadhaar_hash, mobile_number, full_name)
        must NEVER be returned to lenders under any circumstance.
        Asserts this on the endpoint response keys and nested values.
        """
        farmer_id = str(uuid.uuid4())
        token = create_signed_consent_token(
            consent_id=str(uuid.uuid4()),
            farmer_id=farmer_id,
            lender_id=self.test_lender_id,
            shared_attributes=["agritrust_score", "safe_limit", "data_confidence"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=10),
        )

        res = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={**self.headers, "X-Consent-Token": token},
        )
        self.assertEqual(res.status_code, 200)
        raw_text = res.text.lower()
        data = res.json()

        # 1. Assert top-level keys
        forbidden_fields = ["aadhaar", "aadhaar_hash", "mobile", "mobile_number", "full_name", "name", "phone"]
        for field in forbidden_fields:
            self.assertNotIn(field, data, f"PII leak: '{field}' present in top-level response!")

        # 2. Assert inside nested dicts
        for field in forbidden_fields:
            self.assertNotIn(field, data.get("recommendations", {}))
            self.assertNotIn(field, data.get("risk_profile", {}))

        # 3. Assert raw text does not contain key PII identifiers
        self.assertNotIn("aadhaar_hash", raw_text)
        self.assertNotIn("mobile_number", raw_text)

    # -------------------------------------------------------------------------
    # 5. Authentication & Rate Limiting Tests
    # -------------------------------------------------------------------------

    def test_lender_api_key_authentication(self):
        """Verify invalid or missing X-API-Key returns HTTP 401."""
        farmer_id = str(uuid.uuid4())
        
        # Missing key
        res_no_key = self.client.get(f"/api/v1/farmer/{farmer_id}/credit-profile")
        self.assertEqual(res_no_key.status_code, 401)

        # Invalid key
        res_bad_key = self.client.get(
            f"/api/v1/farmer/{farmer_id}/credit-profile",
            headers={"X-API-Key": "completely_invalid_key_xyz"},
        )
        self.assertEqual(res_bad_key.status_code, 401)

    def test_rate_limiting_per_lender_api_key(self):
        """Verify exceeding rate limit triggers HTTP 429 Too Many Requests."""
        rate_limit_key = "test_lender_rate_limit_key"
        TEST_LENDERS[rate_limit_key] = {"lender_id": "test_lender_99", "name": "Test Bank"}
        
        farmer_id = str(uuid.uuid4())
        token = create_signed_consent_token(
            consent_id=str(uuid.uuid4()),
            farmer_id=farmer_id,
            lender_id="test_lender_99",
            shared_attributes=["agritrust_score"],
            expires_at=datetime.now(timezone.utc) + timedelta(days=10),
        )
        headers = {"X-API-Key": rate_limit_key, "X-Consent-Token": token}

        # Exhaust rate limit (configured for 60 req/min)
        for i in range(60):
            lender_rate_limiter.is_allowed(rate_limit_key, limit=60)

        # 61st request must trigger 429
        res = self.client.get(f"/api/v1/farmer/{farmer_id}/credit-profile", headers=headers)
        self.assertEqual(res.status_code, 429)
        self.assertIn("rate limit exceeded", res.json()["detail"].lower())

    # -------------------------------------------------------------------------
    # 6. Farmer-Facing Passport & Background Refresh Tests
    # -------------------------------------------------------------------------

    def test_farmer_passport_with_stage4_explanation(self):
        """Verify GET /api/v1/farmer/{id}/passport returns full passport + Stage 4 explanation."""
        farmer_id = str(uuid.uuid4())
        res = self.client.get(f"/api/v1/farmer/{farmer_id}/passport")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["farmer_id"], farmer_id)
        self.assertIn("agritrust_score", data)
        self.assertIn("safe_credit_min", data)
        self.assertIn("safe_credit_max", data)

        # Stage 4 explanation must be included
        self.assertIn("explanation", data)
        exp = data["explanation"]
        self.assertEqual(exp["audience"], "farmer")
        self.assertIn("headline", exp)
        self.assertIn("summary_narrative", exp)
        self.assertIn("actionable_recommendations", exp)
        self.assertGreater(len(exp["actionable_recommendations"]), 0)

    def test_farmer_refresh_passport_background_job(self):
        """Verify POST /api/v1/farmer/{id}/refresh-passport returns 202 Accepted and queues work."""
        farmer_id = str(uuid.uuid4())
        res = self.client.post(f"/api/v1/farmer/{farmer_id}/refresh-passport")
        self.assertEqual(res.status_code, 202)
        data = res.json()

        self.assertEqual(data["status"], "queued")
        self.assertEqual(data["farmer_id"], farmer_id)
        self.assertIn("background", data["message"].lower())


if __name__ == "__main__":
    unittest.main()
