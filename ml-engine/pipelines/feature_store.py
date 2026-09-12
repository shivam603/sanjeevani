"""ML Feature Store contracts and schema extraction for KisanCred."""

from typing import Dict, Any, List
from dataclasses import dataclass, asdict


@dataclass
class AgronomicFeatures:
    plot_id: str
    ndvi_mean: float           # Sentinel-2 vegetation index (0.0 to 1.0)
    ndvi_variance: float       # Vegetation stability over crop cycle
    ndwi_moisture: float       # Water index / drought resilience
    soil_organic_carbon: float # % organic carbon in topsoil
    rainfall_deviation_pct: float # Deviation from 10-year historical mean (-100% to +100%)
    historical_yield_avg_tons: float
    mandi_price_volatility: float
    fpo_delivery_reliability: float # 0.0 to 1.0 score from FPO logs


def extract_mock_features(plot_id: str) -> AgronomicFeatures:
    """Generate mock feature vector for pipeline testing and verification."""
    return AgronomicFeatures(
        plot_id=plot_id,
        ndvi_mean=0.74,
        ndvi_variance=0.03,
        ndwi_moisture=0.45,
        soil_organic_carbon=0.82,
        rainfall_deviation_pct=4.5,
        historical_yield_avg_tons=3.8,
        mandi_price_volatility=0.12,
        fpo_delivery_reliability=0.92,
    )
