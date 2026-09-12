"""
Comprehensive test suite for the Hackathon Engine.
"""
import unittest
import sys
from pathlib import Path

# Ensure root directory is on Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from engine.models import EngineInput
from engine.pipeline import default_engine
from data.data_loader import default_loader
from gateway.adapters import get_adapter
from gateway.adapters.web import WebAdapter
from gateway.adapters.whatsapp import WhatsAppAdapter
from gateway.adapters.api import ApiAdapter


class TestHackathonEngine(unittest.TestCase):

    def test_verticals_loading(self):
        """Verify all domain vertical configurations load and parse correctly."""
        verticals = ["agriculture", "healthcare", "education", "business"]
        for v_id in verticals:
            cfg = default_engine.get_vertical_config(v_id)
            self.assertEqual(cfg.vertical_id, v_id)
            self.assertTrue(len(cfg.entities_to_extract) > 0)
            self.assertTrue(len(cfg.risk_rules) > 0)
            self.assertTrue(len(cfg.recommendation_types) > 0)

    def test_data_loader(self):
        """Verify sample.csv grounding records can be queried."""
        agri_records = default_loader.query(domain="agriculture")
        self.assertTrue(len(agri_records) > 0)
        self.assertEqual(agri_records[0]["domain"], "agriculture")

        summary = default_loader.get_summary(domain="agriculture")
        self.assertIn("Grounding Data Benchmarks", summary)

    def test_full_pipeline_execution_all_verticals(self):
        """Test the 6-stage pipeline across all verticals."""
        scenarios = [
            ("agriculture", "Tomato crop showing yellow leaves and high humidity"),
            ("healthcare", "Patient with severe chest pain and short breath"),
            ("education", "High school math student failing algebra quizzes"),
            ("business", "Main warehouse running out of critical stock in 10 days")
        ]

        for vertical, query in scenarios:
            inp = EngineInput(channel="web", text=query, vertical=vertical)
            out = default_engine.run_pipeline(inp)

            # Stage 1: Understand
            self.assertTrue(bool(out.understand.intent))
            self.assertIsNotNone(out.understand.extracted_entities)

            # Stage 2: Analyze
            self.assertTrue(bool(out.analyze.current_state_assessment))

            # Stage 3: Predict
            self.assertTrue(len(out.predict.projected_outcomes) > 0)
            self.assertGreaterEqual(out.predict.probability_score, 0.0)

            # Stage 4: Detect Risk
            self.assertIn(out.risk.overall_severity, ["LOW", "MEDIUM", "HIGH", "CRITICAL"])
            self.assertTrue(len(out.risk.identified_risks) > 0)

            # Stage 5: Recommend
            self.assertTrue(len(out.recommend.recommendations) > 0)
            self.assertTrue(bool(out.recommend.recommendations[0].action))

            # Stage 6: Explain
            self.assertTrue(bool(out.explain.rationale))
            self.assertTrue(bool(out.explain.disclaimer))

    def test_web_adapter(self):
        """Test WebAdapter normalization and presentation."""
        adapter = get_adapter("web")
        self.assertIsInstance(adapter, WebAdapter)

        inp = adapter.normalize_request({
            "channel": "web",
            "text": "Crop blight issue",
            "vertical": "agriculture"
        })
        self.assertEqual(inp.channel, "web")
        self.assertEqual(inp.vertical, "agriculture")

        out = default_engine.run_pipeline(inp)
        res = adapter.format_response(out)
        self.assertEqual(res["status"], "success")
        self.assertIn("pipeline", res)
        self.assertIn("understand", res["pipeline"])
        self.assertIn("recommend", res["pipeline"])

    def test_whatsapp_adapter(self):
        """Test WhatsAppAdapter parsing and mobile markdown generation."""
        adapter = get_adapter("whatsapp")
        self.assertIsInstance(adapter, WhatsAppAdapter)

        # Twilio payload style
        inp = adapter.normalize_request({
            "Body": "#agri Tomato leaves turn brown with white spots",
            "From": "whatsapp:+14155238886"
        })
        self.assertEqual(inp.channel, "whatsapp")
        self.assertEqual(inp.vertical, "agriculture")

        out = default_engine.run_pipeline(inp)
        res = adapter.format_response(out)
        self.assertEqual(res["channel"], "whatsapp")
        self.assertIn("ADVISORY", res["message"])
        self.assertIn("Recommended Actions", res["message"])

    def test_api_adapter(self):
        """Test ApiAdapter normalization and enterprise REST response envelope."""
        adapter = get_adapter("api")
        self.assertIsInstance(adapter, ApiAdapter)

        inp = adapter.normalize_request({
            "query": "Supplier shipment delayed by 2 weeks",
            "vertical": "business",
            "version": "v1"
        })
        self.assertEqual(inp.channel, "api")
        self.assertEqual(inp.vertical, "business")

        out = default_engine.run_pipeline(inp)
        res = adapter.format_response(out)
        self.assertEqual(res["status"], "success")
        self.assertIn("decision_id", res["data"])
        self.assertIn("risk_profile", res["data"])
        self.assertIn("audit_trail", res["data"])


if __name__ == "__main__":
    unittest.main()
