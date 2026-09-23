import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.engine.risk_engine import (
    calculate_rain_risk,
    calculate_heat_risk,
    calculate_pest_risk,
    calculate_disease_risk,
    calculate_water_risk,
    calculate_wind_risk,
    calculate_farm_risks,
)


class TestRiskEngine(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_heavy_rain_risk_high(self):
        weather = {"precipitation_sum": 42.0, "precipitation_probability_max": 80.0, "weather_code": 65}
        res = calculate_rain_risk(weather, crop="Wheat", crop_stage="Grain Filling")
        self.assertEqual(res["level"], "HIGH")
        self.assertIn("heavy precipitation", res["reason"].lower())
        self.assertIn("drainage furrows", res["action"].lower())

    def test_heavy_rain_risk_low(self):
        weather = {"precipitation_sum": 2.0, "precipitation_probability_max": 20.0, "weather_code": 1}
        res = calculate_rain_risk(weather, crop="Wheat", crop_stage="Tillering")
        self.assertEqual(res["level"], "LOW")

    def test_heat_stress_risk_high(self):
        weather = {"temperature_2m_max": 37.5, "temperature": 34.0}
        res = calculate_heat_risk(weather, crop="Wheat", crop_stage="Grain Filling")
        self.assertEqual(res["level"], "HIGH")
        self.assertIn("terminal thermal stress", res["reason"].lower())
        self.assertIn("sprinkler irrigation", res["action"].lower())

    def test_heat_stress_risk_low(self):
        weather = {"temperature_2m_max": 26.0, "temperature": 23.0}
        res = calculate_heat_risk(weather, crop="Wheat", crop_stage="Tillering")
        self.assertEqual(res["level"], "LOW")

    def test_pest_risk_high(self):
        # High humidity + warm temp + vegetative stage
        weather = {"relative_humidity_2m": 82.0, "temperature": 27.0}
        res = calculate_pest_risk(weather, crop="Mustard", crop_stage="Vegetative Canopy")
        self.assertEqual(res["level"], "HIGH")
        self.assertIn("optimal breeding environment", res["reason"].lower())
        self.assertIn("sticky traps", res["action"].lower())

    def test_disease_risk_high(self):
        # Damp/rainy code + humidity > 75% + moderate temp
        weather = {"relative_humidity_2m": 84.0, "temperature": 21.0, "weather_code": 61, "rainfall_mm": 8.0}
        res = calculate_disease_risk(weather, crop="Wheat", crop_stage="Heading")
        self.assertEqual(res["level"], "HIGH")
        self.assertIn("fungal spore germination", res["reason"].lower())
        self.assertIn("scout mid and lower canopy", res["action"].lower())

    def test_water_stress_risk_high(self):
        # Soil moisture < 16% + low rain + hot
        weather = {"rainfall_mm": 0.0, "temperature": 32.0}
        field = {"moisture": "12%"}
        res = calculate_water_risk(weather, crop="Wheat", crop_stage="Grain Filling", field=field)
        self.assertEqual(res["level"], "HIGH")
        self.assertIn("acute water deficit", res["reason"].lower())
        self.assertIn("irrigation within 24 hours", res["action"].lower())

    def test_wind_risk_high(self):
        # Wind speed > 30 km/h during lodging sensitive stage
        weather = {"wind_speed_10m_max": 36.0}
        res = calculate_wind_risk(weather, crop="Wheat", crop_stage="Grain Filling")
        self.assertEqual(res["level"], "HIGH")
        self.assertIn("lodging", res["reason"].lower())
        self.assertIn("do not irrigate", res["action"].lower())

    def test_master_risk_aggregator_prioritization(self):
        # Ensure HIGH comes before MEDIUM, then LOW
        fields = [
            {"id": "f1", "name": "Plot 1", "crop": "Wheat", "crop_stage": "Grain Filling", "moisture": "12%"},
            {"id": "f2", "name": "Plot 2", "crop": "Mustard", "crop_stage": "Flowering", "moisture": "24%"},
        ]
        weather = {
            "temperature_2m_max": 38.0,
            "relative_humidity_2m": 45.0,
            "rainfall_mm": 0.0,
            "wind_speed_10m_max": 12.0,
        }
        res = calculate_farm_risks(fields, weather)
        self.assertEqual(res["status"], "success")
        self.assertGreater(res["high_count"], 0)
        self.assertEqual(res["primary_severity"], "HIGH")

        # Check sorting order: every warning should have sort_weight >= next
        weights = [w["sort_weight"] for w in res["warnings"]]
        self.assertEqual(weights, sorted(weights, reverse=True))

    def test_api_get_warnings(self):
        response = self.client.get("/api/v1/warnings?lat=30.65&lon=76.28")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("warnings", data)
        self.assertIn("primary_severity", data)
        self.assertIn("high_count", data)
        self.assertIn("disclaimer", data)

    def test_api_evaluate_custom_scenario(self):
        custom_payload = {
            "lat": 30.65,
            "lon": 76.28,
            "fields": [
                {
                    "id": "test-f1",
                    "name": "Test Field Alpha",
                    "crop": "Paddy",
                    "crop_stage": "Flowering",
                    "area": "3.0 Acres",
                    "ndvi": 0.55,
                    "moisture": "14%",
                }
            ],
            "weather": {
                "temperature": 35.0,
                "temperature_2m_max": 37.0,
                "relative_humidity_2m": 82.0,
                "rainfall_mm": 40.0,
                "precipitation_sum": 40.0,
                "precipitation_probability_max": 90.0,
                "wind_speed_10m_max": 34.0,
                "weather_code": 65,
            },
        }
        response = self.client.post("/api/v1/warnings/evaluate", json=custom_payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(data["high_count"], 0)
        self.assertEqual(data["warnings"][0]["field_name"], "Test Field Alpha")


if __name__ == "__main__":
    unittest.main()
