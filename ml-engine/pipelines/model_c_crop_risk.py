"""Model C — Crop & Region Risk Engine (Random Forest).

NOTE: This model produces purely numerical risk scores and categorical labels.
No LLM is used here. LLMs are reserved strictly for Stage 4 explanation layer.
"""

import logging
from typing import Any, Dict, List, Optional
import numpy as np
from pipelines.base_model import ScoringModel

logger = logging.getLogger("kisancred.ml.model_c")

CROP_SENSITIVITY_INDEX = {
    "Pomegranate": 0.78,  # Highly susceptible to bacterial blight (oily spot)
    "Grapes": 0.72,       # Susceptible to unseasonal rains and downy mildew
    "Tomato": 0.68,       # Price volatility and leaf curl virus
    "Onion": 0.55,        # Post-harvest storage rot and price volatility
    "Cotton": 0.52,       # Pink bollworm risk
    "Soybean": 0.38,      # Moderately hardy
    "Maize": 0.32,        # Hardy
    "Wheat": 0.28,        # Low risk, guaranteed procurement
}


class CropRegionRiskEngine(ScoringModel):
    """
    Model C: Quantifies agronomic, environmental, and biological risk
    at the crop-district interface using Random Forest.
    """

    model_name = "CropRegionRiskEngine_RandomForest"
    version = "v1.1.0"

    FEATURE_NAMES = [
        "crop_sensitivity",           # Biological vulnerability (0.0 to 1.0)
        "weather_anomaly_index",      # Moisture/temperature departure (-1.0 to 1.0)
        "pest_disease_incidence_pct", # Regional pest incidence rate (0 to 100%)
        "historical_pmfby_claim_rate",# Claims/sum insured ratio for district (0 to 1.0)
        "irrigation_dependency",      # 1.0 for rainfed, 0.2 for canal/drip irrigated
    ]

    def __init__(self, version: Optional[str] = None):
        super().__init__(version=version)
        self.model = None
        self._init_model()

    def _init_model(self):
        """Initialize and calibrate Random Forest regressor."""
        from sklearn.ensemble import RandomForestRegressor
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=5,
            min_samples_split=4,
            random_state=42,
        )
        self._precalibrate_default_weights()

    def _precalibrate_default_weights(self):
        """Pre-calibrate on agronomic stress synthetic profiles."""
        rng = np.random.RandomState(42)
        n_samples = 300

        c_sens = rng.uniform(0.2, 0.85, n_samples)
        w_anom = rng.uniform(-0.8, 0.8, n_samples)
        pest_inc = rng.uniform(2.0, 45.0, n_samples)
        claim_rate = rng.beta(a=2.0, b=5.0, size=n_samples)
        irrig = rng.choice([0.2, 0.5, 0.8, 1.0], size=n_samples)

        X = np.column_stack([c_sens, w_anom, pest_inc, claim_rate, irrig])

        # Underlying latent risk score (0 to 100)
        # Higher score = HIGHER RISK
        y = (
            (c_sens * 28.0) +
            (np.abs(w_anom) * 22.0) +
            ((pest_inc / 50.0) * 20.0) +
            (claim_rate * 18.0) +
            (irrig * 12.0) +
            rng.normal(0, 2.0, n_samples)
        )
        y = np.clip(y, 8.0, 95.0)

        self.fit(X, y)

    def fit(self, X: Any, y: Optional[Any] = None, **kwargs) -> "CropRegionRiskEngine":
        self.model.fit(X, y)
        return self

    def extract_feature_vector(self, features: Dict[str, Any]) -> np.ndarray:
        crop_name = features.get("crop_name", "Soybean").title()
        crop_sens = float(CROP_SENSITIVITY_INDEX.get(crop_name, 0.45))

        weather_anom = float(features.get("weather_anomaly_index", 0.15))
        pest_rate = float(features.get("pest_disease_incidence_pct", 12.0))
        pmfby_claim_rate = float(features.get("pmfby_claim_rate", 0.18))

        irrigation = str(features.get("irrigation_source", "Borewell")).lower()
        if "drip" in irrigation or "canal" in irrigation:
            irrig_dep = 0.25
        elif "borewell" in irrigation or "well" in irrigation:
            irrig_dep = 0.50
        else:
            irrig_dep = 0.90  # Rainfed

        return np.array([[
            crop_sens, weather_anom, pest_rate, pmfby_claim_rate, irrig_dep
        ]], dtype=np.float32)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        X_vec = self.extract_feature_vector(features)
        raw_risk = float(self.model.predict(X_vec)[0])
        risk_score = round(float(np.clip(raw_risk, 0.0, 100.0)), 1)

        # Categorize
        if risk_score <= 35.0:
            risk_category = "Low"
        elif risk_score <= 65.0:
            risk_category = "Moderate"
        else:
            risk_category = "High"

        # Feature importances from Random Forest
        importances = {}
        if hasattr(self.model, "feature_importances_"):
            for i, name in enumerate(self.FEATURE_NAMES):
                importances[name] = round(float(self.model.feature_importances_[i]), 3)

        return {
            "risk_score": risk_score,
            "risk_category": risk_category,
            "feature_importances": importances,
            "model_name": self.model_name,
            "model_version": self.version,
        }
