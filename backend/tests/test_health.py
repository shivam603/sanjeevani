import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthAndPlatform(unittest.TestCase):
    def test_root_endpoint(self):
        """Verify that root endpoint returns operational status and metadata."""
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "operational")
        self.assertIn("Sanjeevani", data["service"])
        self.assertIn("version", data)

    def test_health_check_endpoint(self):
        """Verify that /health returns 200 with platform component health."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("status", data)
        self.assertEqual(data["platform"], "Sanjeevani API")
        self.assertIn("services", data)
        self.assertIn("api", data["services"])
        self.assertEqual(data["services"]["api"]["status"], "operational")

    def test_api_v1_health_endpoint(self):
        """Verify that /api/v1/health returns 200 and matches HealthResponse schema."""
        response = client.get("/api/v1/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsNotNone(data["version"])
        self.assertIn("database", data["services"])
        self.assertIn("redis", data["services"])

    def test_consent_grant_and_verify_flow(self):
        """Test Stage 5 cryptographic consent token grant and verification."""
        grant_payload = {
            "farmer_id": "f_1001",
            "lender_entity_id": "bank_sbi_agri_01",
            "scope": ["credit_score", "satellite_ndvi"],
            "purpose": "Kisan Credit Card Loan Underwriting",
            "validity_days": 30,
        }
        grant_res = client.post("/api/v1/consent/grant", json=grant_payload)
        self.assertEqual(grant_res.status_code, 200)
        grant_data = grant_res.json()
        self.assertIn("consent_token", grant_data)
        self.assertEqual(grant_data["farmer_id"], "f_1001")
        self.assertIsNotNone(grant_data["signature"])

        token = grant_data["consent_token"]

        verify_res = client.post(
            "/api/v1/consent/verify",
            json={"consent_token": token, "requested_scope": "credit_score"},
        )
        self.assertEqual(verify_res.status_code, 200)
        verify_data = verify_res.json()
        self.assertTrue(verify_data["is_valid"])
        self.assertTrue(verify_data["scope_permitted"])

        unauthorized_scope_res = client.post(
            "/api/v1/consent/verify",
            json={"consent_token": token, "requested_scope": "bank_statement_raw"},
        )
        self.assertEqual(unauthorized_scope_res.status_code, 200)
        unauthorized_data = unauthorized_scope_res.json()
        self.assertTrue(unauthorized_data["is_valid"])
        self.assertFalse(unauthorized_data["scope_permitted"])


if __name__ == "__main__":
    unittest.main()

