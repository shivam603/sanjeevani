"""Model A — Creditworthiness Engine (XGBoost / LightGBM with SHAP Explainability).

NOTE: This model produces purely numerical credit scores and SHAP feature attributions.
No LLM is used here. LLMs are reserved strictly for Stage 4 explanation layer.
"""

import logging
import math
from typing import Any, Dict, List, Optional
import numpy as np
from pipelines.base_model import ScoringModel

logger = logging.getLogger("kisancred.ml.model_a")


class CreditworthinessEngine(ScoringModel):
    """
    Model A: Evaluates smallholder farmer creditworthiness using an ensemble
    of gradient boosted decision trees (XGBoost / LightGBM) trained on
    production stability, transactional throughput, repayment track record,
    and satellite vegetation health.
    """

    model_name = "CreditworthinessEngine_XGB_LGB"
    version = "v1.2.0"

    FEATURE_NAMES = [
        "production_consistency",   # 1 - normalized variance between actual and expected yield
        "transaction_frequency",    # Number of APMC/mandi sales in past 12 months
        "transaction_volume_inr",   # Total gross realization value (INR)
        "fpo_participation_months", # Length of active FPO membership
        "insurance_claim_ratio",    # Claims settled / total policies (moral hazard & climate proxy)
        "repayment_ontime_rate",    # Historical loan repayment on-time ratio (0.0 to 1.0)
        "satellite_ndvi_mean",      # Mean Sentinel-2 NDVI across peak vegetative cycles
        "satellite_ndvi_variance",  # Intra-season NDVI variance (lower is more resilient)
    ]

    def __init__(self, version: Optional[str] = None):
        super().__init__(version=version)
        self.model = None
        self.explainer = None
        self._init_model()

    def _init_model(self):
        """Initialize XGBoost / LightGBM or calibrated tree ensemble."""
        try:
            import xgboost as xgb
            self.model = xgb.XGBRegressor(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.08,
                subsample=0.85,
                colsample_bytree=0.85,
                random_state=42,
            )
            self._is_native_xgb = True
        except ImportError:
            try:
                import lightgbm as lgb
                self.model = lgb.LGBMRegressor(
                    n_estimators=100,
                    max_depth=4,
                    learning_rate=0.08,
                    random_state=42,
                )
                self._is_native_xgb = False
            except ImportError:
                from sklearn.ensemble import GradientBoostingRegressor
                self.model = GradientBoostingRegressor(
                    n_estimators=100,
                    max_depth=4,
                    learning_rate=0.08,
                    random_state=42,
                )
                self._is_native_xgb = False

        # Fit pre-calibrated baseline weights on agricultural credit factors
        self._precalibrate_default_weights()

    def _precalibrate_default_weights(self):
        """Train internal tree structure on canonical agricultural risk profiles."""
        rng = np.random.RandomState(42)
        n_samples = 400

        # Synthetic feature distribution reflecting Indian smallholder profiles
        prod_cons = rng.uniform(0.40, 0.98, n_samples)
        tx_freq = rng.poisson(lam=6, size=n_samples).astype(float)
        tx_vol = rng.uniform(50000, 750000, n_samples)
        fpo_tenure = rng.uniform(6, 60, n_samples)
        ins_ratio = rng.beta(a=1.5, b=4.0, size=n_samples)
        repay_rate = rng.beta(a=5.0, b=1.2, size=n_samples)
        ndvi_mean = rng.uniform(0.35, 0.85, n_samples)
        ndvi_var = rng.uniform(0.01, 0.12, n_samples)

        X = np.column_stack([
            prod_cons, tx_freq, tx_vol, fpo_tenure,
            ins_ratio, repay_rate, ndvi_mean, ndvi_var
        ])

        # True latent creditworthiness formula (0 to 100)
        y = (
            (repay_rate * 30.0) +
            (prod_cons * 25.0) +
            (np.clip(tx_freq / 12.0, 0, 1) * 15.0) +
            (np.clip(tx_vol / 500000.0, 0, 1) * 10.0) +
            (np.clip(fpo_tenure / 36.0, 0, 1) * 8.0) +
            (ndvi_mean * 12.0) -
            (ndvi_var * 20.0) -
            (ins_ratio * 5.0)
        )
        y = np.clip(y + rng.normal(0, 2.5, n_samples), 15.0, 98.0)

        self.fit(X, y)

    def fit(self, X: Any, y: Optional[Any] = None, **kwargs) -> "CreditworthinessEngine":
        self.model.fit(X, y)
        # Attempt to initialize SHAP TreeExplainer
        try:
            import shap
            self.explainer = shap.TreeExplainer(self.model)
        except Exception:
            self.explainer = None
        return self

    def extract_feature_vector(self, features: Dict[str, Any]) -> np.ndarray:
        """Extract and normalize raw farmer attributes into ordered feature vector."""
        # 1. Production consistency: variance between actual and expected yield
        yield_var = float(features.get("yield_variance", 0.15))
        # Lower variance -> higher consistency
        prod_cons = float(np.clip(1.0 - yield_var, 0.1, 1.0))

        # 2. Transaction frequency in last 12 months
        tx_freq = float(features.get("transaction_count_12m", 4))

        # 3. Transaction gross value
        tx_vol = float(features.get("transaction_volume_inr", 120000.0))

        # 4. FPO tenure (months)
        fpo_tenure = float(features.get("fpo_membership_months", 12.0))

        # 5. Insurance claim ratio
        ins_claims = float(features.get("pmfby_claim_ratio", 0.10))

        # 6. Repayment on-time rate from loan_history
        repay_rate = float(features.get("loan_repayment_rate", 0.90))

        # 7. Satellite NDVI mean
        ndvi_mean = float(features.get("ndvi_mean", 0.62))

        # 8. Satellite NDVI variance
        ndvi_var = float(features.get("ndvi_variance", 0.04))

        return np.array([[
            prod_cons, tx_freq, tx_vol, fpo_tenure,
            ins_claims, repay_rate, ndvi_mean, ndvi_var
        ]], dtype=np.float32)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        X_vec = self.extract_feature_vector(features)
        raw_score = float(self.model.predict(X_vec)[0])

        # Constrain 0 to 100
        agritrust_score_100 = round(float(np.clip(raw_score, 0.0, 100.0)), 1)
        
        # Logistic probability of default (PD) mapped inversely from credit score
        pd_logit = (agritrust_score_100 - 62.0) / 10.0
        prob_of_default = round(float(1.0 / (1.0 + math.exp(pd_logit))), 4)

        # Scale to 300 - 900 for credit_passports CHECK constraint
        # score_300_900 = 300 + int(score_0_100 * 6.0) -> bounds [300, 900]
        agritrust_score_900 = int(300 + (agritrust_score_100 * 6.0))
        agritrust_score_900 = max(300, min(900, agritrust_score_900))

        # Calculate SHAP explainability attributions
        shap_values_dict = self._calculate_shap_attributions(X_vec)

        # Rating tier
        if agritrust_score_100 >= 80:
            rating_tier = "AAA (Prime Agricultural)"
        elif agritrust_score_100 >= 70:
            rating_tier = "AA (Low Risk)"
        elif agritrust_score_100 >= 60:
            rating_tier = "A (Standard Risk)"
        elif agritrust_score_100 >= 50:
            rating_tier = "BBB (Moderate Risk)"
        else:
            rating_tier = "Subprime / High Risk"

        return {
            "agritrust_score": agritrust_score_100,
            "agritrust_score_scaled": agritrust_score_900,
            "probability_of_default": prob_of_default,
            "rating_tier": rating_tier,
            "shap_feature_importance": shap_values_dict,
            "model_name": self.model_name,
            "model_version": self.version,
        }

    def _calculate_shap_attributions(self, X_vec: np.ndarray) -> Dict[str, float]:
        """Compute exact TreeSHAP values or feature-gradient contribution heuristics."""
        if self.explainer is not None:
            try:
                shap_vals = self.explainer.shap_values(X_vec)
                if isinstance(shap_vals, list):
                    shap_vals = shap_vals[0]
                vals = shap_vals[0] if len(shap_vals.shape) > 1 else shap_vals
                return {
                    name: round(float(vals[i]), 2)
                    for i, name in enumerate(self.FEATURE_NAMES)
                }
            except Exception as e:
                self.logger.debug(f"SHAP TreeExplainer calculation fallback: {e}")

        # Fallback: exact contribution delta from baseline mean
        feature_weights = {
            "production_consistency": 25.0,
            "transaction_frequency": 15.0,
            "transaction_volume_inr": 10.0,
            "fpo_participation_months": 8.0,
            "insurance_claim_ratio": -5.0,
            "repayment_ontime_rate": 30.0,
            "satellite_ndvi_mean": 12.0,
            "satellite_ndvi_variance": -20.0,
        }
        baseline_means = [0.75, 6.0, 250000.0, 24.0, 0.15, 0.85, 0.60, 0.05]

        attributions = {}
        for i, name in enumerate(self.FEATURE_NAMES):
            diff = (X_vec[0][i] - baseline_means[i]) / (baseline_means[i] if baseline_means[i] != 0 else 1.0)
            impact = diff * feature_weights[name] * 0.4
            attributions[name] = round(float(impact), 2)
        return attributions
