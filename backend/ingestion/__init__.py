"""Package proxy exposing all ingestion connectors under /backend/ingestion."""

import sys
import os

# Ensure backend root is on sys.path
_backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.ingestion.base import BaseIngestor, IngestionResult
from app.ingestion.land_gis_ingestor import LandGISIngestor
from app.ingestion.remote_sensing_ingestor import (
    RemoteSensingIngestor,
    SatelliteDataProvider,
    MockSentinel2Provider,
)
from app.ingestion.agmarknet_ingestor import AgmarknetIngestor
from app.ingestion.pmfby_ingestor import PMFBYIngestor
from app.ingestion.fpo_erp_ingestor import FPOERPIngestor
from app.ingestion.celery_app import celery_app
from app.ingestion.tasks import run_ingestion_now

__all__ = [
    "BaseIngestor",
    "IngestionResult",
    "LandGISIngestor",
    "RemoteSensingIngestor",
    "SatelliteDataProvider",
    "MockSentinel2Provider",
    "AgmarknetIngestor",
    "PMFBYIngestor",
    "FPOERPIngestor",
    "celery_app",
    "run_ingestion_now",
]
