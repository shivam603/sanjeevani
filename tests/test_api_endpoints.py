"""
Integration tests for FastAPI gateway endpoints.
"""
import unittest
import sys
from pathlib import Path
from starlette.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from gateway.app import app


class TestGatewayEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "hackathon-engine")

    def test_verticals_endpoint(self):
        resp = self.client.get("/verticals")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("verticals", data)
        v_ids = [v["id"] for v in data["verticals"]]
        self.assertIn("agriculture", v_ids)
        self.assertIn("healthcare", v_ids)
        self.assertIn("education", v_ids)
        self.assertIn("business", v_ids)

    def test_web_message_endpoint(self):
        payload = {
            "channel": "web",
            "text": "Tomato crop with yellow leaf spots",
            "vertical": "agriculture"
        }
        resp = self.client.post("/message", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["channel"], "web")
        self.assertIn("pipeline", data)
        self.assertIn("understand", data["pipeline"])
        self.assertIn("recommend", data["pipeline"])

    def test_whatsapp_message_endpoint(self):
        payload = {
            "channel": "whatsapp",
            "text": "#agri Wheat drought issue",
            "vertical": "agriculture"
        }
        resp = self.client.post("/message", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["channel"], "whatsapp")
        self.assertIn("message", data)
        self.assertIn("ADVISORY", data["message"])

    def test_api_message_endpoint(self):
        payload = {
            "channel": "api",
            "query": "Warehouse stockout risk",
            "vertical": "business"
        }
        resp = self.client.post("/message", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("data", data)
        self.assertIn("decision_id", data["data"])

    def test_index_html_serving(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("IBM watsonx.ai Hackathon Engine", resp.text)


if __name__ == "__main__":
    unittest.main()
