"""Kisan Call Centre (KCC) Query & Agro-Advisory Logs Ingestor."""

import logging
from typing import Any, Dict, List, Optional
from app.ingestion.base import BaseIngestor, IngestionResult

logger = logging.getLogger("kisancred.ingestion.kcc_advisory")


class KCCAdvisoryIngestor(BaseIngestor):
    """
    Ingestor for Kisan Call Centre (KCC) query logs, categorized agro-advisories,
    and regional pest/weather distress signals.
    """
    source_name = "KCC_ADVISORY"

    def ingest(
        self,
        result: IngestionResult,
        query_records: Optional[List[Dict[str, Any]]] = None,
        state: str = "Punjab",
        season: str = "Rabi",
        **kwargs,
    ) -> None:
        """Process KCC farmer advisory logs."""
        if not query_records:
            query_records = [
                {
                    "query_id": "KCC-PB-2025-0091",
                    "state": state,
                    "district": "Ludhiana",
                    "crop": "Wheat",
                    "query_type": "Pest & Disease Control",
                    "query_text": "Yellow Rust symptoms spotted on lower leaves of PBW-725 variety.",
                    "advisory_text": "Apply Propiconazole 25% EC (Tilt) @ 200 ml in 200 liters of water per acre immediately.",
                    "urgency": "HIGH",
                },
                {
                    "query_id": "KCC-PB-2025-0092",
                    "state": state,
                    "district": "Bathinda",
                    "crop": "Cotton",
                    "query_type": "Fertilizer Application",
                    "query_text": "Top dressing recommendation for secondary vegetative stage.",
                    "advisory_text": "Apply 25 kg Urea per acre along with Micronutrient spray.",
                    "urgency": "LOW",
                },
                {
                    "query_id": "KCC-PB-2025-0093",
                    "state": state,
                    "district": "Patiala",
                    "crop": "Mustard",
                    "query_type": "Aphid Infestation",
                    "query_text": "Aphids observed on flowering twigs.",
                    "advisory_text": "Spray Rogor (Dimethoate 30 EC) @ 250 ml/acre in cloudy weather.",
                    "urgency": "MEDIUM",
                },
            ]

        result.details["state"] = state
        result.details["season"] = season
        result.details["total_queries"] = len(query_records)

        for rec in query_records:
            try:
                qid = rec.get("query_id")
                if not qid:
                    result.rows_skipped += 1
                    continue
                result.rows_ingested += 1
            except Exception as e:
                result.rows_failed += 1
                result.errors.append(f"KCC advisory error for {rec.get('query_id')}: {str(e)}")

        result.status = "SUCCESS" if result.rows_failed == 0 else "PARTIAL"
