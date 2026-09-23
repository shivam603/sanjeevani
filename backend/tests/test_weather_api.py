"""
Unit tests for Weather-to-Action API endpoint (/api/v1/weather).
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestWeatherActionAPI(unittest.TestCase):
    def test_get_weather_default_flow(self):
        """Verify that /api/v1/weather returns 200 with valid weather telemetry and farm action."""
        response = client.get("/api/v1/weather?lat=30.65&lon=76.28&crop=Wheat&crop_stage=Grain%20Filling&village=Village%20Bhadson")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Location and crop metadata
        self.assertIn("location", data)
        self.assertEqual(data["crop"], "Wheat")
        self.assertEqual(data["crop_stage"], "Grain Filling")

        # Current weather telemetry
        current = data["current"]
        self.assertIn("temperature", current)
        self.assertIn("humidity", current)
        self.assertIn("rain_probability", current)
        self.assertIn("rainfall_mm", current)
        self.assertIn("wind_speed_kmh", current)
        self.assertIn("condition", current)
        self.assertIn("icon", current)

        # Weather Action outputs
        self.assertIn("timing", data)
        self.assertIn("weather_impact", data)
        self.assertIn("recommended_action", data)
        self.assertTrue(len(data["weather_impact"]) > 0)
        self.assertTrue(len(data["recommended_action"]) > 0)

        # Forecast
        self.assertIn("forecast", data)
        self.assertTrue(len(data["forecast"]) >= 5)
        first_day = data["forecast"][0]
        self.assertIn("day_name", first_day)
        self.assertIn("temp_min", first_day)
        self.assertIn("temp_max", first_day)
        self.assertIn("rain_probability", first_day)
        self.assertIn("rainfall_mm", first_day)
        self.assertIn("condition", first_day)
        self.assertIn("agricultural_impact", first_day)

        # Timestamps & disclaimer
        self.assertIn("last_updated", data)
        self.assertIn("disclaimer", data)

    def test_weather_action_rules(self):
        """Test rule evaluation functions directly for critical agronomic thresholds."""
        from app.api.v1.endpoints.weather import evaluate_weather_actions

        # 1. High rain test
        res_rain = evaluate_weather_actions(
            temp=24.0, humidity=70, rain_prob=80, rainfall_mm=18.0, wind_speed=10.0,
            crop="Wheat", crop_stage="Grain Filling", forecast_days=[]
        )
        self.assertIn("Heavy rainfall", res_rain["impact"])
        self.assertIn("delaying irrigation", res_rain["action"].lower())

        # 2. High wind test
        res_wind = evaluate_weather_actions(
            temp=26.0, humidity=50, rain_prob=10, rainfall_mm=0.0, wind_speed=24.0,
            crop="Wheat", crop_stage="Vegetative", forecast_days=[]
        )
        self.assertIn("Strong winds", res_wind["impact"])
        self.assertIn("postponing spraying", res_wind["action"].lower())

        # 3. High humidity disease test
        res_hum = evaluate_weather_actions(
            temp=22.0, humidity=88, rain_prob=15, rainfall_mm=0.0, wind_speed=8.0,
            crop="Wheat", crop_stage="Tillering", forecast_days=[]
        )
        self.assertIn("Yellow Rust", res_hum["impact"])
        self.assertIn("disease risk", res_hum["action"].lower())

        # 4. High temperature heat stress test
        res_temp = evaluate_weather_actions(
            temp=36.5, humidity=40, rain_prob=5, rainfall_mm=0.0, wind_speed=9.0,
            crop="Wheat", crop_stage="Grain Filling", forecast_days=[]
        )
        self.assertIn("forced terminal maturity", res_temp["impact"])
        self.assertIn("heat stress", res_temp["action"].lower())


if __name__ == "__main__":
    unittest.main()
