"""Structured Logging Configuration for Sanjeevani.

Provides unified JSON and key-value structured log formatters across:
1. Core FastAPI backend (`sanjeevani-api`)
2. Background ingestion connectors (`sanjeevani-ingestion`)
3. ML scoring models & explanation pipelines (`sanjeevani-ml`)
"""

from datetime import datetime, timezone
import json
import logging
import sys
from typing import Any, Dict, Optional


class StructuredJSONFormatter(logging.Formatter):
    """Formats log records as structured JSON lines for ELK / CloudWatch / Datadog."""

    def __init__(self, service_name: str = "sanjeevani-api"):
        super().__init__()
        self.service_name = service_name

    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": self.service_name,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include request_id or trace_id if present on the record
        if hasattr(record, "request_id"):
            log_obj["request_id"] = record.request_id
        if hasattr(record, "farmer_id"):
            log_obj["farmer_id"] = record.farmer_id
        if hasattr(record, "source"):
            log_obj["source"] = record.source
        if hasattr(record, "duration_ms"):
            log_obj["duration_ms"] = record.duration_ms
        if hasattr(record, "status_code"):
            log_obj["status_code"] = record.status_code

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj)


def configure_structured_logging(
    service_name: str = "sanjeevani-api",
    level: int = logging.INFO,
    as_json: bool = False,
) -> None:
    """Configures root and sanjeevani loggers with structured formatting."""
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        if as_json:
            handler.setFormatter(StructuredJSONFormatter(service_name=service_name))
        else:
            fmt = "%(asctime)s [%(levelname)s] [service=" + service_name + "] %(name)s - %(message)s"
            handler.setFormatter(logging.Formatter(fmt))
        root_logger.addHandler(handler)
    else:
        for h in root_logger.handlers:
            if as_json:
                h.setFormatter(StructuredJSONFormatter(service_name=service_name))
            else:
                fmt = "%(asctime)s [%(levelname)s] [service=" + service_name + "] %(name)s - %(message)s"
                h.setFormatter(logging.Formatter(fmt))
