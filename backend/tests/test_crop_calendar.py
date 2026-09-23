"""
Unit tests for Personalized Crop Calendar Engine and Endpoint (/api/v1/crop-calendar).
"""

import os
import sys
import unittest
from datetime import date, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.engine.calendar_engine import generate_crop_calendar


class TestCropCalendarEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_wheat_timeline_generation(self):
        """Test Wheat crop calendar timeline generation."""
        fixed_today = date(2026, 2, 20)
        sowing = "2025-11-15"
        res = generate_crop_calendar(
            crop="Wheat (HD 3086)",
            sowing_date_str=sowing,
            field_name="Field A (Plot #184/A)",
            reference_date=fixed_today,
        )
        self.assertEqual(res["status"], "success")
        self.assertEqual(res["crop"], "Wheat (HD 3086)")
        self.assertEqual(res["field_name"], "Field A (Plot #184/A)")
        self.assertEqual(res["days_after_sowing"], 97)
        self.assertGreater(len(res["activities"]), 4)

        # Check approximate date labels
        for act in res["activities"]:
            self.assertIn("Estimated:", act["approximate_date"])

        # Check next activity presence
        self.assertIsNotNone(res["next_activity"])

    def test_mustard_timeline_generation(self):
        """Test Mustard crop calendar timeline generation."""
        fixed_today = date(2026, 2, 20)
        res = generate_crop_calendar(
            crop="Mustard (Pusa Bold)",
            sowing_date_str="2025-10-25",
            field_name="Field B",
            reference_date=fixed_today,
        )
        self.assertEqual(res["status"], "success")
        self.assertTrue(any("Aphid" in a["activity_name"] or "Siliqua" in a["activity_name"] for a in res["activities"]))

    def test_statuses_and_due_labels(self):
        """Verify statuses: COMPLETED, TODAY, UPCOMING, OVERDUE."""
        fixed_today = date(2026, 2, 20)
        # Sowing today: day 0 should be TODAY, day 22 UPCOMING
        res = generate_crop_calendar(
            crop="Wheat",
            sowing_date_str="2026-02-20",
            reference_date=fixed_today,
        )
        self.assertEqual(res["activities"][0]["status"], "TODAY")
        self.assertEqual(res["activities"][0]["due_label"], "Due Today")
        self.assertEqual(res["activities"][1]["status"], "UPCOMING")

    def test_api_endpoint(self):
        """Verify GET /api/v1/crop-calendar returns 200 with valid schema."""
        resp = self.client.get("/api/v1/crop-calendar?crop=Wheat&sowing_date=2025-11-15&field_name=Field%20A")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("activities", data)
        self.assertIn("next_activity", data)
        self.assertIn("disclaimer", data)
        self.assertIn("progress_percentage", data)


if __name__ == "__main__":
    unittest.main()
