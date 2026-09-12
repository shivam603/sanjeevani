"""Comprehensive Unit Tests for KisanCred ML Scoring Models & Orchestrator."""

import os
import sys
import unittest
import uuid
from decimal import Decimal
from pathlib import Path

# Ensure root, backend, and ml-engine are on sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = root_dir / "backend"
ml_engine_dir = root_dir / "ml-engine"

for p in [str(root_dir), str(backend_dir), str(ml_engine_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from pipelines.base_model import ScoringModel
from pipelines.model_a_creditworthiness import CreditworthinessEngine
from pipelines.model_b_repayment_capacity import RepaymentCapacityCalculator
from pipelines.model_c_crop_risk import CropRegionRiskEngine
from pipelines.model_d_price_predictor import MarketPricePredictor
from pipelines.passport_orchestrator import (
    CreditPassportOrchestrator,
    generate_credit_passport,
)


class TestModelACreditworthiness(unittest.TestCase):
    """Test Model A — Creditworthiness Engine (XGBoost/LightGBM + SHAP)."""

    def setUp(self):
        self.engine = CreditworthinessEngine()

    def test_numeric_scoring_bounds(self):
        """Verify score is strictly numeric and within expected boundaries."""
        features = {
            "yield_variance": 0.08,
            "transaction_count_12m": 8,
            "transaction_volume_inr": 250000.0,
            "fpo_membership_months": 36.0,
            "pmfby_claim_ratio": 0.05,
            "loan_repayment_rate": 0.98,
            "ndvi_mean": 0.72,
            "ndvi_variance": 0.02,
        }
        res = self.engine.predict(features)
        
        # 0-100 score
        self.assertGreaterEqual(res["agritrust_score"], 0.0)
        self.assertLessEqual(res["agritrust_score"], 100.0)
        
        # 300-900 scaled score for DB constraint
        self.assertGreaterEqual(res["agritrust_score_scaled"], 300)
        self.assertLessEqual(res["agritrust_score_scaled"], 900)
        
        # Probability of default
        self.assertGreaterEqual(res["probability_of_default"], 0.0)
        self.assertLessEqual(res["probability_of_default"], 1.0)
        
        self.assertIn("AAA", res["rating_tier"])

    def test_shap_explainability_payload(self):
        """Verify SHAP feature attributions are computed for all feature dimensions."""
        features = {
            "yield_variance": 0.12,
            "transaction_count_12m": 5,
            "transaction_volume_inr": 180000.0,
            "fpo_membership_months": 18.0,
            "pmfby_claim_ratio": 0.10,
            "loan_repayment_rate": 0.90,
            "ndvi_mean": 0.60,
            "ndvi_variance": 0.04,
        }
        res = self.engine.predict(features)
        shap_dict = res["shap_feature_importance"]
        
        self.assertIsInstance(shap_dict, dict)
        for fname in self.engine.FEATURE_NAMES:
            self.assertIn(fname, shap_dict)
            self.assertIsInstance(shap_dict[fname], float)

    def test_risk_monotonicity(self):
        """Verify that default rate increases when borrower repayment deteriorates."""
        good_features = {"loan_repayment_rate": 0.99, "yield_variance": 0.05}
        bad_features = {"loan_repayment_rate": 0.40, "yield_variance": 0.45}
        
        good_res = self.engine.predict(good_features)
        bad_res = self.engine.predict(bad_features)
        
        self.assertGreater(good_res["agritrust_score"], bad_res["agritrust_score"])
        self.assertLess(good_res["probability_of_default"], bad_res["probability_of_default"])


class TestModelBRepaymentCapacity(unittest.TestCase):
    """Test Model B — Repayment Capacity Calculator (Deterministic Cashflow)."""

    def setUp(self):
        self.calc = RepaymentCapacityCalculator()

    def test_cashflow_formula_accuracy(self):
        """
        Verify: Net Cashflow = (Yield * Price) - (Input Costs + Existing Debt)
        Example:
          Yield = 20 qtl, Price = INR 4000/qtl -> Gross = 80,000
          Costs = 2 acres * 15,000 = 30,000
          Existing Debt = 10,000
          Net Cashflow = 80,000 - (30,000 + 10,000) = 40,000
        """
        features = {
            "crop_cycles": [{
                "crop_name": "Soybean",
                "expected_yield": 20.0,
                "acreage": 2.0,
            }],
            "realization_prices": {"Soybean": 4000.0},
            "input_costs_per_acre": {"Soybean": 15000.0},
            "existing_debt_obligations": 10000.0,
            "total_acreage": 2.0,
        }
        res = self.calc.predict(features)
        
        self.assertEqual(res["gross_revenue"], 80000.0)
        self.assertEqual(res["input_costs"], 30000.0)
        self.assertEqual(res["existing_debt_obligations"], 10000.0)
        self.assertEqual(res["total_obligations"], 40000.0)
        self.assertEqual(res["net_cashflow"], 40000.0)
        
        # Safe credit min: ~35% of surplus (14,000)
        # Safe credit max: ~70% of surplus (28,000)
        self.assertEqual(res["safe_credit_min"], 14000.0)
        self.assertEqual(res["safe_credit_max"], 28000.0)
        self.assertLessEqual(res["safe_credit_min"], res["safe_credit_max"])

    def test_non_negative_credit_limit(self):
        """Ensure heavy debt never results in negative borrowing limit."""
        features = {
            "crop_cycles": [{"crop_name": "Maize", "expected_yield": 10.0, "acreage": 1.0}],
            "realization_prices": {"Maize": 2000.0},
            "input_costs_per_acre": {"Maize": 15000.0},
            "existing_debt_obligations": 50000.0,  # Negative cashflow
            "total_acreage": 1.0,
        }
        res = self.calc.predict(features)
        self.assertLess(res["net_cashflow"], 0.0)
        self.assertGreaterEqual(res["safe_credit_min"], 0.0)
        self.assertGreaterEqual(res["safe_credit_max"], res["safe_credit_min"])


class TestModelCCropRegionRisk(unittest.TestCase):
    """Test Model C — Crop & Region Risk Engine (Random Forest)."""

    def setUp(self):
        self.engine = CropRegionRiskEngine()

    def test_risk_score_and_categories(self):
        """Verify numeric risk score is bounded [0, 100] and maps to valid category."""
        low_risk_features = {
            "crop_name": "Wheat",
            "weather_anomaly_index": 0.05,
            "pest_disease_incidence_pct": 3.0,
            "pmfby_claim_rate": 0.05,
            "irrigation_source": "Canal Drip",
        }
        res_low = self.engine.predict(low_risk_features)
        self.assertGreaterEqual(res_low["risk_score"], 0.0)
        self.assertLessEqual(res_low["risk_score"], 100.0)
        self.assertEqual(res_low["risk_category"], "Low")

        high_risk_features = {
            "crop_name": "Pomegranate",
            "weather_anomaly_index": 0.75,
            "pest_disease_incidence_pct": 38.0,
            "pmfby_claim_rate": 0.65,
            "irrigation_source": "Rainfed",
        }
        res_high = self.engine.predict(high_risk_features)
        self.assertGreater(res_high["risk_score"], res_low["risk_score"])
        self.assertIn(res_high["risk_category"], ["Moderate", "High"])


class TestModelDMarketPricePredictor(unittest.TestCase):
    """Test Model D — Market Price Predictor (ARIMA Time-Series)."""

    def setUp(self):
        self.predictor = MarketPricePredictor()

    def test_scenario_horizons_ordering(self):
        """Verify Downside <= Base <= Optimistic scenario price ordering."""
        features = {
            "crop_name": "Grapes",
            "mandi_name": "Pimpalgaon",
            "historical_prices": [4200.0, 4350.0, 4500.0, 4600.0, 4750.0],
            "forecast_steps": 4,
        }
        res = self.predictor.predict(features)
        
        downside = res["downside_price"]
        base = res["base_realization_price"]
        optimistic = res["optimistic_price"]
        
        self.assertLessEqual(downside, base)
        self.assertLessEqual(base, optimistic)
        self.assertEqual(len(res["forecast_series"]), 4)


class TestCreditPassportOrchestrator(unittest.TestCase):
    """Test full Credit Passport orchestration pipeline."""

    def test_orchestration_flow(self):
        """Verify orchestrator runs all 4 models and generates valid passport."""
        test_farmer = uuid.uuid4()
        passport = generate_credit_passport(
            farmer_id=test_farmer,
            features_override={
                "crop_name": "Soybean",
                "expected_yield": 18.0,
                "weather_anomaly": 0.08,
                "pmfby_claim_rate": 0.12,
                "loan_repayment_rate": 0.95,
            },
        )
        
        self.assertEqual(passport["farmer_id"], str(test_farmer))
        self.assertIn("agritrust_score", passport)
        self.assertGreaterEqual(passport["agritrust_score"], 300)
        self.assertLessEqual(passport["agritrust_score"], 900)
        
        self.assertGreaterEqual(passport["data_confidence"], 0.0)
        self.assertLessEqual(passport["data_confidence"], 1.0)
        
        self.assertIn("repayment_capacity", passport)
        self.assertIn("crop_risk", passport)
        self.assertIn("market_prices_scenario", passport)
        self.assertIn("shap_explainability", passport)
        self.assertIn("model_version", passport)

    def test_purely_numeric_no_llm_guarantee(self):
        """Verify scoring models contain no LLM invocations or prompt templates."""
        from pipelines import (
            CreditworthinessEngine,
            RepaymentCapacityCalculator,
            CropRegionRiskEngine,
            MarketPricePredictor,
        )
        for model_cls in [CreditworthinessEngine, RepaymentCapacityCalculator, CropRegionRiskEngine, MarketPricePredictor]:
            m = model_cls()
            meta = m.get_metadata()
            self.assertFalse(meta["llm_dependency"])
            self.assertEqual(meta["type"], "NumericDeterministicOrML")


if __name__ == "__main__":
    unittest.main()
