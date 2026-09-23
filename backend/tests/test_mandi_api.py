"""
Unit tests for Mandi Price Intelligence API endpoint (/api/v1/mandi).
"""

import unittest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestMandiPriceIntelligenceAPI(unittest.TestCase):
    def test_get_mandi_filters(self):
        """Verify that /api/v1/mandi/filters returns supported crops and state/district hierarchies."""
        res = client.get("/api/v1/mandi/filters")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("crops", data)
        self.assertIn("states", data)
        self.assertIn("Wheat", data["crops"])
        self.assertIn("Punjab", data["states"])
        self.assertIn("Ludhiana", data["states"]["Punjab"]["districts"])

    def test_get_mandi_prices_highest_sort(self):
        """Verify multi-mandi retrieval with highest price sort and market insight."""
        res = client.get("/api/v1/mandi/prices?crop=Wheat&state=Punjab&district=Ludhiana&sort_by=highest")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        self.assertEqual(data["crop"], "Wheat")
        self.assertEqual(data["state"], "Punjab")
        self.assertTrue(data["total_mandis"] >= 3)
        self.assertIn("market_insight", data)
        self.assertTrue(len(data["market_insight"]) > 0)
        self.assertEqual(data["data_source"], "Demo Market Data")

        # Verify sorted descending by modal_price
        prices = [m["modal_price"] for m in data["mandis"]]
        self.assertEqual(prices, sorted(prices, reverse=True))

        # Check required fields
        first = data["mandis"][0]
        self.assertIn("mandi_name", first)
        self.assertIn("min_price", first)
        self.assertIn("max_price", first)
        self.assertIn("modal_price", first)
        self.assertIn("unit", first)
        self.assertIn("distance_km", first)
        self.assertIn("price_date", first)
        self.assertIn("last_updated", first)

    def test_get_mandi_prices_nearest_sort(self):
        """Verify sorting by nearest distance."""
        res = client.get("/api/v1/mandi/prices?crop=Wheat&state=Punjab&sort_by=nearest")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        distances = [m["distance_km"] for m in data["mandis"] if m["distance_km"] is not None]
        self.assertEqual(distances, sorted(distances))

    def test_estimate_revenue(self):
        """Verify Estimated Revenue calculation (Quantity × Price)."""
        payload = {
            "crop": "Wheat",
            "quantity_quintals": 42.0,
            "mandi_name": "Khanna APMC Mandi",
            "modal_price": 2275.0,
        }
        res = client.post("/api/v1/mandi/estimate-revenue", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()

        expected_gross = 42.0 * 2275.0  # 95,550
        self.assertEqual(data["estimated_revenue"], expected_gross)
        self.assertIn("₹95,550", data["formatted_revenue"])
        self.assertIn("Estimated Gross Revenue", data["label"])
        self.assertTrue(len(data["comparison"]) > 0)


if __name__ == "__main__":
    unittest.main()
