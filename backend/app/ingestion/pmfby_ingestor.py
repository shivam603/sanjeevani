"""PMFBY (Pradhan Mantri Fasal Bima Yojana) Seasonal Crop Insurance Ingestor."""

from decimal import Decimal
import logging
import uuid
from typing import Any, Dict, List, Optional, Union
from sqlalchemy import select
from app.ingestion.base import BaseIngestor, IngestionResult
from app.models.farmer import Farmer
from app.models.insurance_record import InsuranceRecord

logger = logging.getLogger("kisancred.ingestion.pmfby")


class PMFBYIngestor(BaseIngestor):
    """
    Seasonal ingestor for PMFBY crop insurance policies, premium payments,
    and indemnity claim settlements. Idempotently upserts into `insurance_records`.
    """
    source_name = "PMFBY"

    def ingest(
        self,
        result: IngestionResult,
        insurance_records_data: Optional[List[Dict[str, Any]]] = None,
        season: Optional[str] = "Kharif 2025",
        scheme_name: Optional[str] = "PM Fasal Bima Yojana (PMFBY)",
        **kwargs,
    ) -> None:
        """
        Process a batch of seasonal insurance records.
        """
        if not insurance_records_data:
            insurance_records_data = [
                {
                    "farmer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "policy_number": "PMFBY-2025-MH-90214",
                    "crop_name": "Onion",
                    "sum_insured": 120000.0,
                    "premium_farmer": 2400.0,
                    "premium_gov": 9600.0,
                    "claim_status": "NONE",
                    "claim_amount": 0.0,
                }
            ]

        result.details["season"] = season
        result.details["scheme_name"] = scheme_name
        result.details["batch_size"] = len(insurance_records_data)

        session = self._get_sync_session()

        for idx, rec in enumerate(insurance_records_data):
            try:
                # 1. Resolve Farmer ID
                farmer_uuid = None
                if rec.get("farmer_id"):
                    farmer_uuid = uuid.UUID(str(rec["farmer_id"]))
                elif session:
                    # Lookup by mobile number
                    if rec.get("mobile_number"):
                        stmt = select(Farmer.farmer_id).where(Farmer.mobile_number == str(rec["mobile_number"]).strip())
                        farmer_uuid = session.execute(stmt).scalar_one_or_none()

                    # Lookup by Aadhaar hash / raw Aadhaar
                    if not farmer_uuid and rec.get("aadhaar"):
                        a_clean = str(rec["aadhaar"]).strip()
                        a_hash = Farmer.hash_aadhaar(a_clean) if len(a_clean) == 12 else a_clean
                        stmt = select(Farmer.farmer_id).where(Farmer.aadhaar_hash == a_hash)
                        farmer_uuid = session.execute(stmt).scalar_one_or_none()

                if not farmer_uuid:
                    result.rows_skipped += 1
                    result.errors.append(f"Record {idx}: Farmer could not be identified.")
                    continue

                rec_scheme = str(rec.get("scheme_name") or scheme_name).strip()
                rec_season = str(rec.get("season") or season).strip()
                premium = Decimal(str(rec.get("premium_paid", 0.0)))
                claim_amt = Decimal(str(rec.get("claim_amount", 0.0)))
                claim_stat = str(rec.get("claim_status", "ACTIVE")).strip().upper()

                if session:
                    # Idempotency check on (farmer_id, scheme_name, season)
                    stmt = select(InsuranceRecord).where(
                        InsuranceRecord.farmer_id == farmer_uuid,
                        InsuranceRecord.scheme_name == rec_scheme,
                        InsuranceRecord.season == rec_season,
                    )
                    existing = session.execute(stmt).scalars().first()

                    if existing:
                        existing.premium_paid = premium
                        existing.claim_amount = claim_amt
                        existing.claim_status = claim_stat
                        result.rows_skipped += 1
                        self.logger.debug(f"Updated insurance record {existing.insurance_id} for farmer {farmer_uuid}")
                    else:
                        new_record = InsuranceRecord(
                            insurance_id=uuid.uuid4(),
                            farmer_id=farmer_uuid,
                            scheme_name=rec_scheme,
                            season=rec_season,
                            premium_paid=premium,
                            claim_amount=claim_amt,
                            claim_status=claim_stat,
                        )
                        session.add(new_record)
                        result.rows_ingested += 1
                        self.logger.debug(f"Inserted insurance record for farmer {farmer_uuid}")

                    session.commit()
                else:
                    # Session-free / dry run
                    result.rows_ingested += 1

            except Exception as e:
                self.logger.warning(f"Error processing insurance record {idx}: {e}")
                result.rows_failed += 1
                result.errors.append(f"Record {idx}: {str(e)}")
                if session:
                    session.rollback()

        if self.db_session is None and session:
            session.close()
