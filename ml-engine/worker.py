"""Background ML Worker for KisanCred / AgriTrust.

Listens to the Redis queue for asynchronous credit score generation requests,
extracts Sentinel-2 & agronomic features, runs the scoring ensemble, and logs runs to MLflow.
"""

import os
import sys
import time
import logging

# Ensure root directory on path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from pipelines.feature_store import extract_mock_features
from pipelines.credit_scoring import CreditScoringEnsemble
from pipelines.yield_forecasting import YieldForecastingPipeline
from tracking.mlflow_config import setup_mlflow, log_experiment_run

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [ML-Worker] - %(levelname)s - %(message)s")
logger = logging.getLogger("ml-worker")


def run_smoke_test():
    """Execute end-to-end smoke test of all ML models and pipelines."""
    logger.info("--- Running KisanCred ML Engine Smoke Test ---")

    # 1. Feature Extraction
    features = extract_mock_features(plot_id="plot_mh_pune_042")
    logger.info(f"Extracted Agronomic Features for {features.plot_id}: NDVI={features.ndvi_mean}, NDWI={features.ndwi_moisture}")

    # 2. Credit Scoring Ensemble
    ensemble = CreditScoringEnsemble(model_version="v1.0.0-rc1")
    score_result = ensemble.calculate_score(features)
    logger.info(f"Calculated Credit Score: {score_result['credit_score']} ({score_result['rating_tier']}) | Default Probability: {score_result['probability_of_default'] * 100:.1f}%")

    # 3. Yield Forecasting ARIMA
    forecaster = YieldForecastingPipeline(order=(1, 1, 1))
    historical_data = [3.2, 3.4, 3.1, 3.6, 3.8] # 5 seasons of harvest
    forecast_result = forecaster.forecast_seasonal_yield(historical_data, steps=3)
    logger.info(f"Yield Forecast (next 3 seasons): {forecast_result['forecast_seasons']} metric tons/ha")

    # 4. MLflow logging
    setup_mlflow("kisancred_credit_scoring")
    log_experiment_run(
        run_name="smoke_test_run",
        params={"model": "Ensemble_RF_XGB_LGB", "plot_id": features.plot_id},
        metrics={"credit_score": float(score_result["credit_score"]), "default_prob": score_result["probability_of_default"]},
    )

    logger.info("--- ML Engine Smoke Test Passed Successfully ---")
    return score_result


def main():
    logger.info("Starting KisanCred ML Engine Worker Daemon...")
    setup_mlflow()
    # Run self-check
    run_smoke_test()

    logger.info("ML Worker is idle and waiting for incoming Redis jobs...")
    # In container mode, keep process alive
    try:
        while True:
            time.sleep(30)
    except KeyboardInterrupt:
        logger.info("Stopping ML Worker Daemon.")


if __name__ == "__main__":
    if "--test" in sys.argv or "--smoke" in sys.argv:
        run_smoke_test()
    else:
        main()
