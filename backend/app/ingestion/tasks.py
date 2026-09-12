"""Celery Tasks and Programmatic Task Runners for KisanCred Ingestors."""

import logging
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from app.ingestion.celery_app import celery_app
from app.ingestion.land_gis_ingestor import LandGISIngestor
from app.ingestion.remote_sensing_ingestor import RemoteSensingIngestor
from app.ingestion.agmarknet_ingestor import AgmarknetIngestor
from app.ingestion.pmfby_ingestor import PMFBYIngestor
from app.ingestion.fpo_erp_ingestor import FPOERPIngestor

logger = logging.getLogger("kisancred.ingestion.tasks")


# -----------------------------------------------------------------------------
# Celery Periodic Tasks
# -----------------------------------------------------------------------------

@celery_app.task(name="app.ingestion.tasks.scheduled_weekly_remote_sensing", bind=True, max_retries=3)
def scheduled_weekly_remote_sensing(self, reading_date_str: Optional[str] = None) -> Dict[str, Any]:
    """Weekly scheduled job pulling NDVI & NDWI satellite indices."""
    try:
        t_date = datetime.strptime(reading_date_str, "%Y-%m-%d").date() if reading_date_str else date.today()
        ingestor = RemoteSensingIngestor()
        result = ingestor.execute(reading_date=t_date)
        return {
            "source": result.source,
            "status": result.status,
            "rows_ingested": result.rows_ingested,
            "rows_skipped": result.rows_skipped,
            "rows_failed": result.rows_failed,
            "duration_ms": result.duration_ms,
            "log_id": result.log_id,
        }
    except Exception as exc:
        logger.error(f"Error in scheduled_weekly_remote_sensing: {exc}")
        raise self.retry(exc=exc, countdown=300)


@celery_app.task(name="app.ingestion.tasks.scheduled_daily_agmarknet", bind=True, max_retries=3)
def scheduled_daily_agmarknet(self, price_date_str: Optional[str] = None, state: str = "Maharashtra") -> Dict[str, Any]:
    """Daily scheduled job pulling AGMARKNET wholesale prices."""
    try:
        t_date = datetime.strptime(price_date_str, "%Y-%m-%d").date() if price_date_str else date.today()
        ingestor = AgmarknetIngestor()
        result = ingestor.execute(price_date=t_date, state=state)
        return {
            "source": result.source,
            "status": result.status,
            "rows_ingested": result.rows_ingested,
            "rows_skipped": result.rows_skipped,
            "rows_failed": result.rows_failed,
            "duration_ms": result.duration_ms,
            "log_id": result.log_id,
        }
    except Exception as exc:
        logger.error(f"Error in scheduled_daily_agmarknet: {exc}")
        raise self.retry(exc=exc, countdown=300)


@celery_app.task(name="app.ingestion.tasks.scheduled_seasonal_pmfby", bind=True, max_retries=2)
def scheduled_seasonal_pmfby(self, season: str = "Kharif 2025", records: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """Seasonal PMFBY insurance claims and premium ingestion."""
    try:
        ingestor = PMFBYIngestor()
        result = ingestor.execute(season=season, insurance_records_data=records or [])
        return {
            "source": result.source,
            "status": result.status,
            "rows_ingested": result.rows_ingested,
            "rows_skipped": result.rows_skipped,
            "rows_failed": result.rows_failed,
            "duration_ms": result.duration_ms,
            "log_id": result.log_id,
        }
    except Exception as exc:
        logger.error(f"Error in scheduled_seasonal_pmfby: {exc}")
        raise self.retry(exc=exc, countdown=600)


# -----------------------------------------------------------------------------
# Direct Synchronous Execution API (For Tests, Admin CLI, and Web Endpoints)
# -----------------------------------------------------------------------------

def run_ingestion_now(source: str, **kwargs) -> Dict[str, Any]:
    """
    Executes an ingestion connector synchronously without needing a running Celery worker.
    Ideal for direct HTTP endpoints, unit tests, and CLI batch runs.
    """
    source_upper = source.upper()

    if source_upper in ("LAND_GIS", "GIS", "PARCEL"):
        ingestor = LandGISIngestor()
    elif source_upper in ("REMOTE_SENSING", "NDVI", "SATELLITE"):
        ingestor = RemoteSensingIngestor()
    elif source_upper in ("AGMARKNET", "MANDI", "MARKET"):
        ingestor = AgmarknetIngestor()
    elif source_upper in ("PMFBY", "INSURANCE"):
        ingestor = PMFBYIngestor()
    elif source_upper in ("FPO_ERP", "ERP", "TRANSACTION"):
        ingestor = FPOERPIngestor()
    else:
        raise ValueError(f"Unknown ingestion source: '{source}'")

    result = ingestor.execute(**kwargs)
    return {
        "source": result.source,
        "status": result.status,
        "rows_ingested": result.rows_ingested,
        "rows_skipped": result.rows_skipped,
        "rows_failed": result.rows_failed,
        "errors": result.errors,
        "duration_ms": result.duration_ms,
        "log_id": result.log_id,
        "details": result.details,
    }
