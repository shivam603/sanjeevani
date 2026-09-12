"""MLflow Experiment Tracking and Model Registry configuration."""

import logging
import os
from typing import Optional, Dict, Any

logger = logging.getLogger("kisancred.ml.mlflow")

# Silence MLflow skill suggestion banner in terminal
os.environ.setdefault("MLFLOW_DISABLE_AGENT_HINT", "1")

try:
    import mlflow
    HAVE_MLFLOW = True
except ImportError:
    HAVE_MLFLOW = False


def setup_mlflow(
    experiment_name: str = "kisancred_credit_scoring",
    tracking_uri: Optional[str] = None,
) -> bool:
    """Initialize connection to central MLflow Tracking server."""
    if not HAVE_MLFLOW:
        logger.info("MLflow not installed in active environment; tracking operates in mock mode.")
        return False

    # Default to local SQLite backend (sqlite:///mlflow.db) for full modern MLflow features
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "mlflow.db")).replace(os.sep, "/")
    default_sqlite_uri = f"sqlite:///{db_path}"
    uri = tracking_uri or os.getenv("MLFLOW_TRACKING_URI") or default_sqlite_uri
    try:
        mlflow.set_tracking_uri(uri)
        mlflow.set_experiment(experiment_name)
        logger.info(f"Connected to MLflow tracking at: {uri} (Experiment: {experiment_name})")
        return True
    except Exception as e:
        logger.warning(f"Failed to connect to MLflow at {uri}: {e}. Falling back to SQLite backend.")
        try:
            mlflow.set_tracking_uri(default_sqlite_uri)
            mlflow.set_experiment(experiment_name)
            return True
        except Exception:
            return False


def log_experiment_run(run_name: str, params: Dict[str, Any], metrics: Dict[str, float]) -> Optional[str]:
    """Log parameters, hyperparameters, and evaluation metrics to MLflow."""
    if not HAVE_MLFLOW:
        logger.info(f"[Mock MLflow] Run: {run_name} | Params: {params} | Metrics: {metrics}")
        return "mock_run_id_001"

    try:
        with mlflow.start_run(run_name=run_name) as run:
            mlflow.log_params(params)
            mlflow.log_metrics(metrics)
            return run.info.run_id
    except Exception as e:
        logger.warning(f"Error logging to MLflow: {e}")
        return None
