"""Test fixtures and path configuration for KisanCred ML Engine tests."""

import sys
from pathlib import Path

# Ensure root, backend, and ml-engine are on sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
backend_dir = root_dir / "backend"
ml_engine_dir = root_dir / "ml-engine"

for p in [str(root_dir), str(backend_dir), str(ml_engine_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)
