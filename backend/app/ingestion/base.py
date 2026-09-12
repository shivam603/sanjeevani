"""Base Ingestor Class and Audit Trail Logging for KisanCred."""

import logging
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.data_ingestion_log import DataIngestionLog

logger = logging.getLogger("kisancred.ingestion")


@dataclass
class IngestionResult:
    """Standardized result schema returned by all ingestors."""
    source: str
    status: str  # 'SUCCESS', 'PARTIAL', 'FAILED'
    rows_ingested: int = 0
    rows_skipped: int = 0
    rows_failed: int = 0
    errors: List[str] = field(default_factory=list)
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    duration_ms: int = 0
    log_id: Optional[str] = None
    details: Dict[str, Any] = field(default_factory=dict)

    @property
    def is_success(self) -> bool:
        return self.status == "SUCCESS"


class BaseIngestor(ABC):
    """
    Abstract Base Class for all KisanCred ingestion connectors.
    Enforces idempotency, metrics aggregation, error containment,
    and automatic logging into the `data_ingestion_log` table.
    """

    source_name: str = "BASE_INGESTOR"

    def __init__(self, db_session=None):
        self.db_session = db_session
        self.logger = logging.getLogger(f"kisancred.ingestion.{self.source_name.lower()}")

    def _get_sync_session(self):
        """Obtain a synchronous SQLAlchemy session if not provided."""
        if self.db_session is not None:
            return self.db_session
        try:
            engine = create_engine(settings.SYNC_DATABASE_URL, pool_pre_ping=True)
            with engine.connect() as conn:
                pass
            SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
            return SessionLocal()
        except Exception as e:
            self.logger.debug(f"Database not reachable for {self.source_name}: {e}")
            return None

    def execute(self, **kwargs) -> IngestionResult:
        """
        Template method executing the ingestion lifecycle:
        1. Timing & status tracking
        2. Subclass ingest() execution
        3. Exception handling & metric aggregation
        4. Audit record written to data_ingestion_log
        """
        started_at = datetime.now(timezone.utc)
        start_clock = time.perf_counter()
        
        result = IngestionResult(
            source=self.source_name,
            status="SUCCESS",
            started_at=started_at,
        )

        try:
            self.logger.info(f"Starting ingestion: {self.source_name} with params={list(kwargs.keys())}")
            # Delegate to specialized ingestor
            self.ingest(result=result, **kwargs)

            # Determine status from metrics
            if result.rows_failed > 0 and result.rows_ingested > 0:
                result.status = "PARTIAL"
            elif result.rows_failed > 0 and result.rows_ingested == 0:
                result.status = "FAILED"
            else:
                result.status = "SUCCESS"

        except Exception as exc:
            self.logger.exception(f"Unhandled error during {self.source_name} ingestion: {exc}")
            result.status = "FAILED"
            result.errors.append(str(exc))
            result.rows_failed += 1

        finally:
            end_clock = time.perf_counter()
            result.completed_at = datetime.now(timezone.utc)
            result.duration_ms = int((end_clock - start_clock) * 1000)

            # Persist audit record in data_ingestion_log
            self._write_audit_log(result)

        self.logger.info(
            f"Finished {self.source_name}: status={result.status}, "
            f"ingested={result.rows_ingested}, skipped={result.rows_skipped}, "
            f"failed={result.rows_failed}, time={result.duration_ms}ms"
        )
        return result

    @abstractmethod
    def ingest(self, result: IngestionResult, **kwargs) -> None:
        """Core ingestion logic implemented by child connectors."""
        raise NotImplementedError

    def _write_audit_log(self, result: IngestionResult) -> None:
        """Write audit row to data_ingestion_log table."""
        session = self._get_sync_session()
        if session is None:
            result.log_id = str(uuid.uuid4())
            return

        try:
            log_entry = DataIngestionLog(
                log_id=uuid.uuid4(),
                source=result.source,
                status=result.status,
                rows_ingested=result.rows_ingested,
                rows_skipped=result.rows_skipped,
                rows_failed=result.rows_failed,
                error_message="\n".join(result.errors) if result.errors else None,
                started_at=result.started_at,
                completed_at=result.completed_at,
                duration_ms=result.duration_ms,
                metadata_json=result.details if result.details else None,
            )
            session.add(log_entry)
            session.commit()
            result.log_id = str(log_entry.log_id)
        except Exception as e:
            self.logger.warning(f"Failed to persist audit log into data_ingestion_log: {e}")
            session.rollback()
            result.log_id = str(uuid.uuid4())
        finally:
            if self.db_session is None and session:
                session.close()
