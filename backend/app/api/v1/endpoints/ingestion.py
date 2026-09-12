"""FastAPI endpoints for the KisanCred Data Ingestion Layer."""

from datetime import date
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, select
from app.ingestion.land_gis_ingestor import LandGISIngestor
from app.ingestion.fpo_erp_ingestor import FPOERPIngestor
from app.ingestion.tasks import run_ingestion_now
from app.models.data_ingestion_log import DataIngestionLog
from app.db.session import async_session_factory

router = APIRouter()


# -----------------------------------------------------------------------------
# Request & Response Schemas
# -----------------------------------------------------------------------------

class IngestionResponse(BaseModel):
    source: str
    status: str
    rows_ingested: int
    rows_skipped: int
    rows_failed: int
    duration_ms: int
    log_id: Optional[str] = None
    errors: List[str] = []
    details: Dict[str, Any] = {}


class FPOTransactionPayload(BaseModel):
    farmer_id: Optional[str] = None
    mobile_number: Optional[str] = None
    aadhaar: Optional[str] = None
    crop_name: str
    quantity_sold: float = Field(..., gt=0, description="Quantity in quintals")
    realization_price: float = Field(..., gt=0, description="Price in INR per quintal")
    mandi_name: Optional[str] = "FPO Procurement Center"
    transaction_date: Optional[str] = None


class FPOTxBatchRequest(BaseModel):
    fpo_id: Optional[str] = None
    transactions: List[FPOTransactionPayload]


class IngestionLogResponse(BaseModel):
    log_id: str
    source: str
    status: str
    rows_ingested: int
    rows_skipped: int
    rows_failed: int
    duration_ms: Optional[int]
    started_at: str
    completed_at: Optional[str]


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------

@router.post("/land-gis/upload", response_model=IngestionResponse)
async def upload_parcel_boundary(
    farmer_id: str = Form(..., description="Target Farmer UUID"),
    file: UploadFile = File(..., description="GeoJSON (.json, .geojson) or Shapefile (.zip)"),
) -> IngestionResponse:
    """
    Accepts GeoJSON or Shapefile ZIP archive for parcel boundaries.
    Validates polygon topology, cleans invalid self-intersections, and upserts into land_parcels.
    """
    content = await file.read()
    filename = file.filename.lower() if file.filename else ""

    ingestor = LandGISIngestor()

    if filename.endswith(".zip"):
        result = ingestor.execute(farmer_id=farmer_id, shapefile_bytes=content)
    elif filename.endswith((".json", ".geojson")) or "application/json" in (file.content_type or ""):
        result = ingestor.execute(farmer_id=farmer_id, geojson_data=content)
    else:
        # Try JSON first
        try:
            result = ingestor.execute(farmer_id=farmer_id, geojson_data=content)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Please upload a .geojson, .json, or .zip (Shapefile) archive.",
            )

    return IngestionResponse(
        source=result.source,
        status=result.status,
        rows_ingested=result.rows_ingested,
        rows_skipped=result.rows_skipped,
        rows_failed=result.rows_failed,
        duration_ms=result.duration_ms,
        log_id=result.log_id,
        errors=result.errors,
        details=result.details,
    )


@router.post("/fpo-erp/sync", response_model=IngestionResponse)
async def sync_fpo_transactions(payload: FPOTxBatchRequest) -> IngestionResponse:
    """
    Batch ingest transactions from FPO ERP systems.
    Automatically flags every transaction with verified_by_fpo = true.
    """
    ingestor = FPOERPIngestor()
    tx_dicts = [t.model_dump() for t in payload.transactions]
    result = ingestor.execute(transactions_data=tx_dicts, fpo_id=payload.fpo_id)

    return IngestionResponse(
        source=result.source,
        status=result.status,
        rows_ingested=result.rows_ingested,
        rows_skipped=result.rows_skipped,
        rows_failed=result.rows_failed,
        duration_ms=result.duration_ms,
        log_id=result.log_id,
        errors=result.errors,
        details=result.details,
    )


@router.post("/trigger/{source}", response_model=IngestionResponse)
async def trigger_ingestion(
    source: str,
    target_date: Optional[str] = Query(None, description="Target date in YYYY-MM-DD format"),
) -> IngestionResponse:
    """
    Manually trigger an ingestion job:
    - REMOTE_SENSING (pulls Sentinel-2 NDVI/NDWI)
    - AGMARKNET (pulls daily APMC mandi wholesale prices)
    - PMFBY (processes crop insurance records)
    """
    try:
        kwargs: Dict[str, Any] = {}
        if target_date:
            d = date.fromisoformat(target_date)
            if source.upper() in ("REMOTE_SENSING", "NDVI"):
                kwargs["reading_date"] = d
            elif source.upper() in ("AGMARKNET", "MANDI"):
                kwargs["price_date"] = d

        res = run_ingestion_now(source=source, **kwargs)
        return IngestionResponse(**res)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/logs", response_model=List[IngestionLogResponse])
async def list_ingestion_logs(limit: int = Query(20, ge=1, le=100)) -> List[IngestionLogResponse]:
    """
    Query recent execution logs from data_ingestion_log.
    Feeds audit verification and the platform data_confidence score.
    """
    if not async_session_factory:
        return []

    async with async_session_factory() as session:
        stmt = select(DataIngestionLog).order_by(desc(DataIngestionLog.started_at)).limit(limit)
        results = (await session.execute(stmt)).scalars().all()

        return [
            IngestionLogResponse(
                log_id=str(r.log_id),
                source=r.source,
                status=r.status,
                rows_ingested=r.rows_ingested,
                rows_skipped=r.rows_skipped,
                rows_failed=r.rows_failed,
                duration_ms=r.duration_ms,
                started_at=r.started_at.isoformat(),
                completed_at=r.completed_at.isoformat() if r.completed_at else None,
            )
            for r in results
        ]
