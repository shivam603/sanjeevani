"""Credit Passport Orchestrator for KisanCred / AgriTrust.

Coordinates Model A, B, C, and D into a unified credit decision,
computes dynamic data confidence from the ingestion audit trail,
and persists credit passports to the database.
"""

from datetime import datetime, timezone
from decimal import Decimal
import logging
import os
import sys
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

# Ensure backend and ml-engine directories are in sys.path
_root_dir = Path(__file__).resolve().parent.parent.parent
_backend_dir = _root_dir / "backend"
_ml_engine_dir = _root_dir / "ml-engine"

for _p in [str(_backend_dir), str(_ml_engine_dir), str(_root_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from sqlalchemy import create_engine, desc, select
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.credit_passport import CreditPassport
from app.models.crop_cycle import CropCycle
from app.models.data_ingestion_log import DataIngestionLog
from app.models.farmer import Farmer
from app.models.insurance_record import InsuranceRecord
from app.models.land_parcel import LandParcel
from app.models.loan_history import LoanHistory
from app.models.market_price import MarketPrice
from app.models.market_transaction import MarketTransaction
from app.models.ndvi_reading import NDVIReading
from pipelines.model_a_creditworthiness import CreditworthinessEngine
from pipelines.model_b_repayment_capacity import RepaymentCapacityCalculator
from pipelines.model_c_crop_risk import CropRegionRiskEngine
from pipelines.model_d_price_predictor import MarketPricePredictor

logger = logging.getLogger("kisancred.ml.orchestrator")


class CreditPassportOrchestrator:
    """
    Unified Orchestrator:
    1. Extracts multi-table features for a given farmer.
    2. Measures data ingestion completeness (`data_confidence`).
    3. Runs Model D (Prices) -> Model C (Risk) -> Model B (Cashflow) -> Model A (Credit).
    4. Writes final output to `credit_passports`.
    """

    def __init__(self, db_session=None):
        self.db_session = db_session
        self.model_a = CreditworthinessEngine()
        self.model_b = RepaymentCapacityCalculator()
        self.model_c = CropRegionRiskEngine()
        self.model_d = MarketPricePredictor()

    def _get_sync_session(self):
        if self.db_session:
            return self.db_session
        try:
            engine = create_engine(settings.SYNC_DATABASE_URL, pool_pre_ping=True)
            with engine.connect():
                pass
            SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
            return SessionLocal()
        except Exception as e:
            logger.debug(f"DB offline for passport orchestrator: {e}")
            return None

    def compute_data_confidence(self, farmer_id: uuid.UUID, session) -> float:
        """
        Calculate data_confidence score (0.0 to 1.0) based on ingestion
        source completeness and log audit trail health.
        """
        if not session:
            return 0.8500  # Default mock baseline for offline simulation

        confidence_score = 0.0

        # 1. Parcel geometry exists (+0.20)
        parcels = session.execute(
            select(LandParcel).where(LandParcel.farmer_id == farmer_id)
        ).scalars().all()
        if parcels:
            confidence_score += 0.20

            # 2. Satellite NDVI readings exist for those parcels (+0.20)
            parcel_ids = [p.parcel_id for p in parcels]
            readings = session.execute(
                select(NDVIReading).where(NDVIReading.parcel_id.in_(parcel_ids))
            ).scalars().all()
            if len(readings) >= 2:
                confidence_score += 0.20
            elif len(readings) == 1:
                confidence_score += 0.10

        # 3. Crop cycle history (+0.20)
        cycles = session.execute(
            select(CropCycle).where(CropCycle.farmer_id == farmer_id)
        ).scalars().all()
        if len(cycles) >= 2:
            confidence_score += 0.20
        elif len(cycles) == 1:
            confidence_score += 0.10

        # 4. Verified mandi transactions (+0.20)
        txs = session.execute(
            select(MarketTransaction).where(
                MarketTransaction.farmer_id == farmer_id,
                MarketTransaction.verified_by_fpo == True,
            )
        ).scalars().all()
        if len(txs) >= 3:
            confidence_score += 0.20
        elif len(txs) >= 1:
            confidence_score += 0.12

        # 5. Loan or Insurance records (+0.20)
        loans = session.execute(
            select(LoanHistory).where(LoanHistory.farmer_id == farmer_id)
        ).scalars().all()
        insurances = session.execute(
            select(InsuranceRecord).where(InsuranceRecord.farmer_id == farmer_id)
        ).scalars().all()
        if loans or insurances:
            confidence_score += 0.20

        # Check ingestion log health (penalty if recent failures in system)
        recent_failed = session.execute(
            select(DataIngestionLog)
            .where(DataIngestionLog.status == "FAILED")
            .order_by(desc(DataIngestionLog.started_at))
            .limit(5)
        ).scalars().all()
        if len(recent_failed) >= 3:
            confidence_score = max(0.1, confidence_score - 0.05)

        return round(float(min(1.0, max(0.2, confidence_score))), 4)

    def orchestrate(
        self,
        farmer_id: Union[str, uuid.UUID],
        features_override: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Run all 4 models and produce a unified credit passport."""
        f_uuid = uuid.UUID(str(farmer_id))
        session = self._get_sync_session()

        raw_features = features_override or {}

        # 1. Compute Data Confidence Score
        confidence = self.compute_data_confidence(f_uuid, session)

        # 2. Extract Farmer Data & Active Crops
        crop_cycles_data = []
        total_acreage = 3.0
        primary_crop = "Soybean"
        mandi_name = "Nashik APMC"
        existing_debt = 0.0

        if session:
            # Query parcels
            parcels = session.execute(
                select(LandParcel).where(LandParcel.farmer_id == f_uuid)
            ).scalars().all()
            if parcels:
                total_acreage = float(sum(p.acreage for p in parcels))

            # Query crop cycles
            cycles = session.execute(
                select(CropCycle).where(CropCycle.farmer_id == f_uuid)
            ).scalars().all()
            if cycles:
                primary_crop = cycles[0].crop_name
                for c in cycles:
                    crop_cycles_data.append({
                        "crop_name": c.crop_name,
                        "expected_yield": float(c.expected_yield or 15.0),
                        "acreage": total_acreage,
                    })

            # Query loans
            active_loans = session.execute(
                select(LoanHistory).where(
                    LoanHistory.farmer_id == f_uuid,
                    LoanHistory.status == "ACTIVE",
                )
            ).scalars().all()
            existing_debt = float(sum(l.amount for l in active_loans))

        if not crop_cycles_data:
            crop_cycles_data = [{
                "crop_name": raw_features.get("crop_name", primary_crop),
                "expected_yield": float(raw_features.get("expected_yield", 16.0)),
                "acreage": total_acreage,
            }]

        # 3. Model D: Market Price Forecasting
        price_forecast = self.model_d.predict({
            "crop_name": primary_crop,
            "mandi_name": mandi_name,
            "forecast_steps": 4,
        })
        base_realization_price = price_forecast["base_realization_price"]

        # 4. Model C: Crop & Region Risk Engine
        risk_result = self.model_c.predict({
            "crop_name": primary_crop,
            "weather_anomaly_index": raw_features.get("weather_anomaly", 0.10),
            "pest_disease_incidence_pct": raw_features.get("pest_incidence", 10.0),
            "pmfby_claim_rate": raw_features.get("pmfby_claim_rate", 0.15),
            "irrigation_source": raw_features.get("irrigation_source", "Canal & Borewell"),
        })

        # 5. Model B: Repayment Capacity Calculator
        capacity_result = self.model_b.predict({
            "crop_cycles": crop_cycles_data,
            "realization_prices": {primary_crop: base_realization_price},
            "existing_debt_obligations": existing_debt,
            "total_acreage": total_acreage,
        })

        # 6. Model A: Creditworthiness Engine
        credit_result = self.model_a.predict({
            "yield_variance": raw_features.get("yield_variance", 0.12),
            "transaction_count_12m": raw_features.get("transaction_count", 6),
            "transaction_volume_inr": capacity_result["gross_revenue"],
            "fpo_membership_months": raw_features.get("fpo_membership_months", 24.0),
            "pmfby_claim_ratio": raw_features.get("pmfby_claim_ratio", 0.12),
            "loan_repayment_rate": raw_features.get("loan_repayment_rate", 0.95),
            "ndvi_mean": raw_features.get("ndvi_mean", 0.65),
            "ndvi_variance": raw_features.get("ndvi_variance", 0.03),
        })

        # Final unified agritrust score (300 to 900 scale)
        agritrust_score_scaled = credit_result["agritrust_score_scaled"]
        safe_credit_min = capacity_result["safe_credit_min"]
        safe_credit_max = capacity_result["safe_credit_max"]
        model_ver = f"{self.model_a.version}+{self.model_b.version}+{self.model_c.version}+{self.model_d.version}"

        # 7. Persist to credit_passports table
        passport_id = uuid.uuid4()
        now = datetime.now(timezone.utc)

        if session:
            try:
                passport_record = CreditPassport(
                    passport_id=passport_id,
                    farmer_id=f_uuid,
                    agritrust_score=agritrust_score_scaled,
                    data_confidence=Decimal(str(confidence)),
                    safe_credit_min=Decimal(str(safe_credit_min)),
                    safe_credit_max=Decimal(str(safe_credit_max)),
                    generated_at=now,
                    model_version=model_ver,
                )
                session.add(passport_record)
                session.commit()
                logger.info(f"Persisted credit passport {passport_id} for farmer {f_uuid}")
            except Exception as e:
                logger.warning(f"Could not persist credit passport to DB: {e}")
                session.rollback()
            finally:
                if self.db_session is None:
                    session.close()

        return {
            "passport_id": str(passport_id),
            "farmer_id": str(f_uuid),
            "agritrust_score": agritrust_score_scaled,  # 300-900 standard
            "agritrust_score_100": credit_result["agritrust_score"],
            "rating_tier": credit_result["rating_tier"],
            "data_confidence": confidence,
            "safe_credit_min": safe_credit_min,
            "safe_credit_max": safe_credit_max,
            "probability_of_default": credit_result["probability_of_default"],
            "repayment_capacity": capacity_result,
            "crop_risk": risk_result,
            "market_prices_scenario": price_forecast,
            "shap_explainability": credit_result["shap_feature_importance"],
            "generated_at": now.isoformat(),
            "model_version": model_ver,
        }


def generate_credit_passport(
    farmer_id: Union[str, uuid.UUID],
    db_session=None,
    features_override: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Convenience functional interface for credit passport generation."""
    orchestrator = CreditPassportOrchestrator(db_session=db_session)
    return orchestrator.orchestrate(farmer_id=farmer_id, features_override=features_override)
