"""FPO ERP Ingestor for Farmgate Sales, Mandi Dispatches, & Input Transactions."""

from datetime import date, datetime
from decimal import Decimal
import logging
import uuid
from typing import Any, Dict, List, Optional, Union
from sqlalchemy import select
from app.ingestion.base import BaseIngestor, IngestionResult
from app.models.farmer import Farmer
from app.models.market_transaction import MarketTransaction

logger = logging.getLogger("kisancred.ingestion.fpo_erp")


class FPOERPIngestor(BaseIngestor):
    """
    Ingests real-time or batch transactional records directly from
    FPO Management Information Systems (MIS) / ERP backends.
    All ingested records are automatically verified by the FPO (`verified_by_fpo = True`).
    """
    source_name = "FPO_ERP"

    def ingest(
        self,
        result: IngestionResult,
        transactions_data: Optional[List[Dict[str, Any]]] = None,
        fpo_id: Optional[Union[str, uuid.UUID]] = None,
        default_mandi_name: Optional[str] = "FPO Procurement Hub",
        **kwargs,
    ) -> None:
        if not transactions_data:
            transactions_data = [
                {
                    "farmer_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
                    "crop_name": "Onion",
                    "quantity_qtl": 45.0,
                    "price_per_qtl": 2450.0,
                    "total_amount": 110250.0,
                    "transaction_date": "2025-10-15",
                    "weighing_slip_id": "SLIP-FPO-991",
                }
            ]

        result.details["fpo_id"] = str(fpo_id) if fpo_id else None
        result.details["batch_size"] = len(transactions_data)

        session = self._get_sync_session()

        for idx, item in enumerate(transactions_data):
            try:
                # 1. Resolve Farmer
                farmer_uuid = None
                if item.get("farmer_id"):
                    farmer_uuid = uuid.UUID(str(item["farmer_id"]))
                elif session:
                    if item.get("mobile_number"):
                        stmt = select(Farmer.farmer_id).where(Farmer.mobile_number == str(item["mobile_number"]).strip())
                        farmer_uuid = session.execute(stmt).scalar_one_or_none()

                    if not farmer_uuid and item.get("aadhaar"):
                        a_clean = str(item["aadhaar"]).strip()
                        a_hash = Farmer.hash_aadhaar(a_clean) if len(a_clean) == 12 else a_clean
                        stmt = select(Farmer.farmer_id).where(Farmer.aadhaar_hash == a_hash)
                        farmer_uuid = session.execute(stmt).scalar_one_or_none()

                if not farmer_uuid:
                    result.rows_skipped += 1
                    result.errors.append(f"Transaction {idx}: Farmer could not be resolved.")
                    continue

                crop_name = str(item.get("crop_name") or item.get("commodity", "")).strip().title()
                if not crop_name:
                    result.rows_skipped += 1
                    result.errors.append(f"Transaction {idx}: Missing crop_name.")
                    continue

                qty = Decimal(str(item.get("quantity_sold") or item.get("quantity", 0.0)))
                price = Decimal(str(item.get("realization_price") or item.get("price_per_unit") or item.get("unit_price", 0.0)))
                mandi = str(item.get("mandi_name") or default_mandi_name).strip()

                tx_date = item.get("transaction_date") or date.today()
                if isinstance(tx_date, str):
                    tx_date = datetime.strptime(tx_date, "%Y-%m-%d").date()

                if session:
                    # Idempotency check: match on farmer_id, crop_name, mandi_name, transaction_date, quantity
                    stmt = select(MarketTransaction).where(
                        MarketTransaction.farmer_id == farmer_uuid,
                        MarketTransaction.crop_name == crop_name,
                        MarketTransaction.mandi_name == mandi,
                        MarketTransaction.transaction_date == tx_date,
                        MarketTransaction.quantity_sold == qty,
                    )
                    existing = session.execute(stmt).scalars().first()

                    if existing:
                        existing.realization_price = price
                        # Always ensure verified_by_fpo is True
                        existing.verified_by_fpo = True
                        result.rows_skipped += 1
                        self.logger.debug(f"Updated existing transaction {existing.transaction_id}")
                    else:
                        new_tx = MarketTransaction(
                            transaction_id=uuid.uuid4(),
                            farmer_id=farmer_uuid,
                            crop_name=crop_name,
                            quantity_sold=qty,
                            realization_price=price,
                            mandi_name=mandi,
                            transaction_date=tx_date,
                            verified_by_fpo=True,  # Mandatory requirement
                        )
                        session.add(new_tx)
                        result.rows_ingested += 1
                        self.logger.debug(f"Inserted FPO-verified transaction for farmer {farmer_uuid}")

                    session.commit()
                else:
                    # Session-free / dry-run
                    result.rows_ingested += 1

            except Exception as e:
                self.logger.warning(f"Error ingesting FPO ERP transaction {idx}: {e}")
                result.rows_failed += 1
                result.errors.append(f"Transaction {idx}: {str(e)}")
                if session:
                    session.rollback()

        if self.db_session is None and session:
            session.close()
