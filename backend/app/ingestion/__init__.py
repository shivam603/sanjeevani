"""Data Ingestion Layer for KisanCred / AgriTrust."""

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
from app.ingestion.nhb_ingestor import NHBIngestor
from app.ingestion.pmkisan_ingestor import PMKisanIngestor
from app.ingestion.kcc_advisory_ingestor import KCCAdvisoryIngestor
from app.ingestion.icar_disease_ingestor import ICARDiseaseIngestor
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
    "NHBIngestor",
    "PMKisanIngestor",
    "KCCAdvisoryIngestor",
    "ICARDiseaseIngestor",
    "celery_app",
    "run_ingestion_now",
]
