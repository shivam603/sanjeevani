"""Comprehensive Unit & Integration Tests for KisanCred Explanation Layer (Stage 4)."""

from copy import deepcopy
import unittest
import uuid
from decimal import Decimal
import sys
from pathlib import Path

# Ensure paths
root_dir = Path(__file__).resolve().parent.parent.parent
for p in [str(root_dir / "backend"), str(root_dir / "ml-engine"), str(root_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from explanation.engine import ExplanationEngine, explain_passport
from explanation.prompts import (
    analyze_shap_drivers,
    build_farmer_prompt,
    build_lender_prompt,
)
from explanation.providers import (
    BaseLLMProvider,
    MockLocalLLMProvider,
    OpenAICompatibleProvider,
    WatsonxGraniteProvider,
    get_llm_provider,
)
from pipelines.passport_orchestrator import generate_credit_passport


class TestExplanationPromptsAndDrivers(unittest.TestCase):
    """Test SHAP verbalization and prompt construction."""

    def setUp(self):
        self.shap_dict = {
            "yield_variance": 0.15,
            "transaction_count_12m": 0.10,
            "transaction_volume_inr": 0.20,
            "fpo_membership_months": 0.08,
            "loan_repayment_rate": 0.25,
            "ndvi_mean": 0.05,
            "pmfby_claim_ratio": -0.06,
            "ndvi_variance": -0.03,
        }

    def test_shap_driver_sorting_and_categorization(self):
        """Verify positive and risk SHAP weights are partitioned and sorted by impact."""
        positives, risks = analyze_shap_drivers(self.shap_dict)
        
        self.assertGreater(len(positives), 0)
        self.assertGreater(len(risks), 0)
        
        # Verify positives are descending
        pos_weights = [p["impact_weight"] for p in positives]
        self.assertEqual(pos_weights, sorted(pos_weights, reverse=True))

        # Verify all positive entries have non-negative impact
        for p in positives:
            self.assertGreaterEqual(p["impact_weight"], 0.0)
            self.assertIn("feature_name", p)
            self.assertIn("farmer_action", p)

        # Verify risk entries have negative impact
        for r in risks:
            self.assertLess(r["impact_weight"], 0.0)
            self.assertIn("farmer_action", r)

    def test_farmer_prompt_tone_and_context(self):
        """Verify farmer prompt contains plain language and actionable directives."""
        passport = {
            "farmer_id": "test_farmer_001",
            "passport_id": "pass_001",
            "agritrust_score": 750,
            "rating_tier": "A (Standard Risk)",
            "safe_credit_min": 20000.0,
            "safe_credit_max": 40000.0,
            "repayment_capacity": {"net_cashflow": 45000.0},
            "crop_risk": {"risk_category": "Low"},
        }
        positives, risks = analyze_shap_drivers(self.shap_dict)
        prompt, sys_prompt = build_farmer_prompt(passport, positives, risks)

        self.assertIn("AUDIENCE: FARMER", prompt)
        self.assertIn("750", prompt)
        self.assertIn("20,000", prompt)
        self.assertIn("AgriTrust Sahayak", sys_prompt)
        self.assertIn("Do NOT use financial jargon", sys_prompt)

    def test_lender_prompt_institutional_framing(self):
        """Verify lender prompt contains underwriting metrics and risk-framing."""
        passport = {
            "farmer_id": "test_farmer_001",
            "passport_id": "pass_001",
            "agritrust_score": 750,
            "rating_tier": "A (Standard Risk)",
            "safe_credit_min": 20000.0,
            "safe_credit_max": 40000.0,
            "probability_of_default": 0.045,
            "data_confidence": 0.88,
            "repayment_capacity": {
                "gross_revenue": 100000.0,
                "input_costs": 35000.0,
                "existing_debt_obligations": 10000.0,
                "net_cashflow": 55000.0,
            },
            "market_prices_scenario": {
                "base_realization_price": 4200.0,
                "downside_price": 3800.0,
            },
            "crop_risk": {"risk_score": 28.0, "risk_category": "Low"},
        }
        positives, risks = analyze_shap_drivers(self.shap_dict)
        prompt, sys_prompt = build_lender_prompt(passport, positives, risks)

        self.assertIn("AUDIENCE: LENDER", prompt)
        self.assertIn("Probability of Default", prompt)
        self.assertIn("4.50%", prompt)
        self.assertIn("Credit Underwriting", sys_prompt)


class TestProviderSwappability(unittest.TestCase):
    """Test LLM provider resolution and custom injection."""

    def test_factory_provider_resolution(self):
        """Verify get_llm_provider correctly resolves configured instances."""
        mock_p = get_llm_provider("mock")
        self.assertIsInstance(mock_p, MockLocalLLMProvider)
        self.assertEqual(mock_p.provider_name, "mock")

        watsonx_p = get_llm_provider("watsonx")
        self.assertIsInstance(watsonx_p, WatsonxGraniteProvider)
        self.assertEqual(watsonx_p.provider_name, "watsonx")

        openai_p = get_llm_provider("openai")
        self.assertIsInstance(openai_p, OpenAICompatibleProvider)
        self.assertEqual(openai_p.provider_name, "openai")

    def test_custom_mock_provider_generation(self):
        """Verify MockLocalLLMProvider produces audience-appropriate outputs."""
        mock_p = MockLocalLLMProvider()
        
        farmer_out = mock_p.generate("AUDIENCE: FARMER\nAgriTrust Score: 720\nRating Tier: A\nSafe Credit Limit: ₹15,000 - ₹30,000")
        self.assertIn("Namaste!", farmer_out)
        self.assertIn("720", farmer_out)
        self.assertIn("Actionable steps", farmer_out)

        lender_out = mock_p.generate("AUDIENCE: LENDER\nAgriTrust Score: 720\nRating Tier: A\nSafe Credit Limit: ₹15,000 - ₹30,000")
        self.assertIn("CREDIT INTELLIGENCE ASSESSMENT", lender_out)
        self.assertIn("Underwriting & Risk Considerations", lender_out)


class TestExplanationEngineAndInvariants(unittest.TestCase):
    """Test ExplanationEngine, audience modes, and non-interference guarantees."""

    def setUp(self):
        self.passport = {
            "passport_id": str(uuid.uuid4()),
            "farmer_id": str(uuid.uuid4()),
            "agritrust_score": 715,
            "rating_tier": "A (Standard Risk)",
            "safe_credit_min": 16000.0,
            "safe_credit_max": 32000.0,
            "data_confidence": 0.8500,
            "probability_of_default": 0.052,
            "repayment_capacity": {
                "gross_revenue": 85000.0,
                "input_costs": 30000.0,
                "existing_debt_obligations": 8000.0,
                "net_cashflow": 47000.0,
            },
            "crop_risk": {
                "risk_score": 34.0,
                "risk_category": "Low",
            },
            "market_prices_scenario": {
                "base_realization_price": 4300.0,
                "downside_price": 3950.0,
                "optimistic_price": 4650.0,
            },
            "shap_explainability": {
                "yield_variance": 0.12,
                "transaction_count_12m": 0.08,
                "transaction_volume_inr": 0.14,
                "fpo_membership_months": 0.09,
                "loan_repayment_rate": 0.18,
                "ndvi_mean": 0.06,
                "pmfby_claim_ratio": -0.04,
                "ndvi_variance": -0.02,
            },
            "model_version": "v1.2.0+v1.1.0+v1.1.0+v1.2.0",
        }

    def test_strict_non_interference_invariant(self):
        """
        CRITICAL REQUIREMENT:
        Verify explain_passport NEVER alters agritrust_score, safe_credit_min/max,
        data_confidence, or any other numeric scoring metric.
        """
        passport_copy = deepcopy(self.passport)
        
        # Run explanation in farmer mode
        res_farmer = explain_passport(
            passport_id=self.passport["passport_id"],
            audience="farmer",
            passport_data=passport_copy,
            provider_name="mock",
        )
        
        # Run explanation in lender mode
        res_lender = explain_passport(
            passport_id=self.passport["passport_id"],
            audience="lender",
            passport_data=passport_copy,
            provider_name="mock",
        )

        # Assert zero mutation of input passport data
        self.assertEqual(passport_copy["agritrust_score"], self.passport["agritrust_score"])
        self.assertEqual(passport_copy["safe_credit_min"], self.passport["safe_credit_min"])
        self.assertEqual(passport_copy["safe_credit_max"], self.passport["safe_credit_max"])
        self.assertEqual(passport_copy["data_confidence"], self.passport["data_confidence"])
        self.assertEqual(passport_copy["probability_of_default"], self.passport["probability_of_default"])

    def test_farmer_audience_payload_structure(self):
        """Verify farmer-facing payload contains encouraging headline, drivers, and actions."""
        res = explain_passport(
            passport_id=self.passport["passport_id"],
            audience="farmer",
            passport_data=self.passport,
            provider_name="mock",
        )
        
        self.assertEqual(res["audience"], "farmer")
        self.assertIn("headline", res)
        self.assertIn("summary_narrative", res)
        self.assertIn("positive_drivers", res)
        self.assertIn("risk_drivers", res)
        self.assertIn("actionable_recommendations", res)
        self.assertGreater(len(res["actionable_recommendations"]), 0)
        self.assertIn("provider", res)
        self.assertIn("generated_at", res)

    def test_lender_audience_payload_structure(self):
        """Verify lender-facing payload contains institutional risk analysis and covenants."""
        res = explain_passport(
            passport_id=self.passport["passport_id"],
            audience="lender",
            passport_data=self.passport,
            provider_name="mock",
        )
        
        self.assertEqual(res["audience"], "lender")
        self.assertIn("Credit Memo", res["headline"])
        self.assertIn("summary_narrative", res)
        self.assertIn("positive_drivers", res)
        self.assertIn("risk_drivers", res)
        self.assertIn("actionable_recommendations", res)
        # Verify covenants in recommendations
        self.assertTrue(any("Covenant" in a or "Monitoring" in a for a in res["actionable_recommendations"]))

    def test_invalid_audience_rejected(self):
        """Verify invalid audience raises ValueError."""
        with self.assertRaises(ValueError):
            explain_passport(
                passport_id=self.passport["passport_id"],
                audience="unknown_audience",
                passport_data=self.passport,
            )

    def test_end_to_end_orchestrator_to_explanation(self):
        """Verify full pipeline: generate_credit_passport() -> explain_passport()."""
        test_farmer = uuid.uuid4()
        passport = generate_credit_passport(
            farmer_id=test_farmer,
            features_override={
                "crop_name": "Paddy",
                "expected_yield": 22.0,
                "weather_anomaly": 0.05,
                "pmfby_claim_rate": 0.08,
                "loan_repayment_rate": 0.98,
            },
        )
        
        # Explain for farmer
        farmer_exp = explain_passport(
            passport_id=passport["passport_id"],
            audience="farmer",
            passport_data=passport,
            provider_name="mock",
        )
        self.assertEqual(farmer_exp["farmer_id"], str(test_farmer))
        self.assertIn("summary_narrative", farmer_exp)

        # Explain for lender
        lender_exp = explain_passport(
            passport_id=passport["passport_id"],
            audience="lender",
            passport_data=passport,
            provider_name="mock",
        )
        self.assertEqual(lender_exp["farmer_id"], str(test_farmer))
        self.assertIn("summary_narrative", lender_exp)


class TestBackendServiceBridge(unittest.TestCase):
    """Test backend service bridge re-export for Stage 5 API layer."""

    def test_backend_service_import(self):
        """Verify app.services.explanation imports cleanly."""
        from app.services.explanation import explain_passport as bridge_explain, ExplanationEngine as BridgeEngine
        self.assertTrue(callable(bridge_explain))
        self.assertTrue(issubclass(BridgeEngine, object))


if __name__ == "__main__":
    unittest.main()
