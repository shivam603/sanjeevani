"""
Unit Tests for Smart Notification Engine (SANJEEVANI)
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.engine.notification_engine import (
    generate_smart_notifications,
    CATEGORIES,
    PRIORITIES,
)


class TestSmartNotificationEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_all_six_sources_generated(self):
        """Verify that notifications are generated strictly from the 6 required sources."""
        result = generate_smart_notifications(
            farmer_name="Ramesh Patel",
            field_id="field-184a",
            field_name="Field A",
            crop="Wheat (HD 3086)",
            rain_forecast=True,
        )

        self.assertEqual(result["status"], "success")
        self.assertGreaterEqual(result["total_notifications"], 6)

        categories_found = {n["category"] for n in result["notifications"]}
        expected_categories = {"WEATHER", "MARKET", "RISK", "CROP", "SCHEME", "CALENDAR"}
        self.assertEqual(categories_found, expected_categories)

    def test_priority_distribution(self):
        """Verify that priorities are not all HIGH and are distributed appropriately."""
        result = generate_smart_notifications(
            farmer_name="Ramesh Patel",
            field_id="field-184a",
            field_name="Field A",
            rain_forecast=True,
            active_risk_level="HIGH",
            task_status="TODAY",
        )

        priorities_found = {n["priority"] for n in result["notifications"]}
        self.assertIn("HIGH", priorities_found)
        self.assertIn("MEDIUM", priorities_found)
        self.assertIn("LOW", priorities_found)

        # Confirm not everything is HIGH
        high_count = sum(1 for n in result["notifications"] if n["priority"] == "HIGH")
        self.assertLess(high_count, result["total_notifications"])

    def test_deduplication(self):
        """Verify that deduplication prevents duplicate notifications for the same event."""
        result = generate_smart_notifications(
            farmer_name="Ramesh Patel",
            field_id="field-184a",
            rain_forecast=True,
        )

        keys = [n["dedup_key"] for n in result["notifications"]]
        self.assertEqual(len(keys), len(set(keys)), "Duplicate dedup_keys found in notifications output!")

    def test_api_endpoint(self):
        """Verify GET /api/v1/notifications returns 200 with valid structure and filtering."""
        response = self.client.get("/api/v1/notifications?crop=Wheat&field_name=Field%20A")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("unread_count", data)
        self.assertIn("notifications", data)

        # Test category filter
        resp_weather = self.client.get("/api/v1/notifications?category=WEATHER")
        self.assertEqual(resp_weather.status_code, 200)
        data_weather = resp_weather.json()
        for item in data_weather["notifications"]:
            self.assertEqual(item["category"], "WEATHER")


if __name__ == "__main__":
    unittest.main()
