"""Common ScoringModel Interface for KisanCred ML Engine.

NOTE ON ARCHITECTURAL SEPARATION:
All models implementing this interface MUST ONLY produce strictly numeric scores,
probability distributions, classifications, and explainability feature attributions (SHAP).
LLMs are strictly forbidden from the mathematical credit and risk scoring engine.
Generative AI / LLMs (e.g. IBM Granite) are reserved strictly for the Stage 4
human-readable explanation, dialogue, and natural language narrative layer.
"""

from abc import ABC, abstractmethod
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("kisancred.ml.base_model")


class ScoringModel(ABC):
    """
    Abstract Base Class for all versioned, swappable credit and risk scoring models.
    Enforces unified fit/predict contracts so model retraining, hyperparameter sweeps,
    and algorithm upgrades never break the upstream API and orchestrator layers.
    """

    model_name: str = "GenericScoringModel"
    version: str = "v1.0.0"

    def __init__(self, version: Optional[str] = None):
        if version:
            self.version = version
        self.logger = logging.getLogger(f"kisancred.ml.{self.model_name.lower()}")

    @abstractmethod
    def fit(self, X: Any, y: Optional[Any] = None, **kwargs) -> "ScoringModel":
        """Train or calibrate model on provided dataset."""
        raise NotImplementedError

    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Produce purely numeric scoring, classifications, or scenario bounds.
        Returns dictionary of numeric metrics and explainability components.
        """
        raise NotImplementedError

    def get_metadata(self) -> Dict[str, Any]:
        """Return model metadata for audit and MLflow tracking."""
        return {
            "model_name": self.model_name,
            "version": self.version,
            "type": "NumericDeterministicOrML",
            "llm_dependency": False,
        }
