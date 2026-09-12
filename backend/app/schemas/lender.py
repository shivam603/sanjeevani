"""Pydantic Schemas for Lender Dashboard & Underwriting Terminal."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ConsentedFarmerListItem(BaseModel):
    farmer_id: str
    farmer_code: str
    crop_name: str
    region: str
    agritrust_score: int
    score_grade: str
    risk_category: str
    safe_limit: float
    consent_status: str
    consent_expires_at: str
    consent_token: str


class ModelBCashFlowEngine(BaseModel):
    expected_yield_qtl: float
    realization_price_inr: float
    gross_revenue_inr: float
    input_costs_inr: float
    existing_obligations_inr: float
    net_cashflow_inr: float
    safe_credit_limit_inr: float
    dscr: float


class PriceHorizonScenario(BaseModel):
    horizon_days: int
    base_price: float
    optimistic_price: float
    downside_price: float


class ModelDRealizationProjections(BaseModel):
    crop_name: str
    benchmark_mandi: str
    current_modal_price: float
    scenarios: List[PriceHorizonScenario]


class ModelCCropRiskBreakdown(BaseModel):
    crop_name: str
    overall_risk_score: float
    risk_category: str
    climate_resilience_score: float
    pest_disease_index: float
    water_stress_score: float
    price_volatility_score: float


class LenderUnderwritingDossier(BaseModel):
    farmer_id: str
    farmer_code: str
    passport_id: str
    consent_info: Dict[str, Any]
    agritrust_score: int
    score_grade: str
    data_confidence: float
    cash_flow: ModelBCashFlowEngine
    price_projections: ModelDRealizationProjections
    crop_risk: ModelCCropRiskBreakdown
    lender_explanation: Dict[str, Any]


class ConsentRequestCreate(BaseModel):
    farmer_id: str
    requested_attributes: List[str] = Field(
        default=["agritrust_score", "safe_limit", "crop_risk", "satellite_ndvi"],
        description="Attributes requested from farmer",
    )
    loan_purpose: str = Field(..., description="E.g. Kisan Credit Card Renewal")
    requested_validity_days: int = Field(30, ge=1, le=365)


class ConsentRequestResponse(BaseModel):
    request_id: str
    lender_id: str
    farmer_id: str
    status: str
    loan_purpose: str
    requested_attributes: List[str]
    created_at: str


class LoanDecisionCreate(BaseModel):
    passport_id: str
    farmer_id: str
    decision: str = Field(..., description="'APPROVED', 'DECLINED', or 'REFERRED'")
    approved_amount: Optional[float] = Field(None, ge=0)
    tenure_months: Optional[int] = Field(None, ge=1, le=120)
    interest_rate_pct: Optional[float] = Field(None, ge=0, le=100)
    covenants: Optional[str] = None
    notes: Optional[str] = None


class LoanDecisionResponse(BaseModel):
    decision_id: str
    passport_id: str
    farmer_id: str
    decision: str
    approved_amount: Optional[float] = None
    tenure_months: Optional[int] = None
    interest_rate_pct: Optional[float] = None
    covenants: Optional[str] = None
    underwriter_id: str
    created_at: str
    message: Optional[str] = "Decision logged successfully."
