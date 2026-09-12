"""Data Ingestion Run Audit Log Model."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.types import JSON
from app.models.base import Base


class DataIngestionLog(Base):
    """
    Audit log recording each execution of an ingestion pipeline.
    Captures row metrics (ingested, skipped, failed), status, duration, and error traces.
    Crucial input for calculating the platform 'data_confidence' score.
    """
    __tablename__ = "data_ingestion_log"

    log_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    # Connector identifier: 'LAND_GIS', 'REMOTE_SENSING', 'AGMARKNET', 'PMFBY', 'FPO_ERP'
    source = Column(String(100), nullable=False, index=True)
    # Execution status: 'SUCCESS', 'PARTIAL', 'FAILED'
    status = Column(String(50), nullable=False, index=True)
    
    rows_ingested = Column(Integer, default=0, nullable=False)
    rows_skipped = Column(Integer, default=0, nullable=False)
    rows_failed = Column(Integer, default=0, nullable=False)
    
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Store batch details (e.g. filename, mandi list, date range)
    metadata_json = Column(JSON, nullable=True)

    __table_args__ = (
        Index("ix_data_ingestion_log_source_status", "source", "status"),
        Index("ix_data_ingestion_log_started_at", "started_at"),
    )

    def __repr__(self):
        return f"<DataIngestionLog(id={self.log_id}, source='{self.source}', status='{self.status}', ingested={self.rows_ingested})>"
