"""Explanation service bridge for FastAPI API layer (Stage 5).

Exposes explain_passport for consumption by REST API endpoints.
"""

import sys
from pathlib import Path
from typing import Any, Dict, Optional, Union
import uuid

# Ensure ml-engine and backend directories on sys.path
_root_dir = Path(__file__).resolve().parent.parent.parent.parent
_backend_dir = _root_dir / "backend"
_ml_engine_dir = _root_dir / "ml-engine"

for _p in [str(_backend_dir), str(_ml_engine_dir), str(_root_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from explanation.engine import explain_passport, ExplanationEngine
from explanation.providers import get_llm_provider, BaseLLMProvider

__all__ = [
    "explain_passport",
    "ExplanationEngine",
    "get_llm_provider",
    "BaseLLMProvider",
]
