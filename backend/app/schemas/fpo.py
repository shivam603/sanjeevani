"""Pydantic Schemas for FPO Portal & Aggregation Endpoints."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ScoreDistribution(BaseModel):
    tier_0_49: int = Field(0, description="Count of members with score < 50 (Fair/High Risk)")
    tier_50_69: int = Field(0, description="Count of members with score 50-69 (Good/Moderate Risk)")
    tier_70_79: int = Field(0, description="Count of members with score 70-79 (Prime/Low Risk)")
    tier_80_89: int = Field(0, description="Count of members with score 80-89 (Super Prime)")
    tier_90_100: int = Field(0, description="Count of members with score >= 90 (Elite Prime)")


class RiskMix(BaseModel):
    low: int = Field(0, description="Count of low-risk members")
    moderate: int = Field(0, description="Count of moderate-risk members")
    high: int = Field(0, description="Count of high-risk members")


class FPOPortfolioSummaryResponse(BaseModel):
    fpo_id: str
    fpo_name: str
    region: str
    total_members: int
    active_members: int
    mean_agritrust_score: float
    score_distribution: ScoreDistribution
    total_verified_volume_inr: float
    total_volume_quintals: float
    risk_mix: RiskMix
    total_mapped_hectares: float
    data_confidence_mean: float
    as_of: str


class FPOMemberListItem(BaseModel):
    farmer_id: str
    farmer_code: str
    full_name: str
    village: str
    primary_crop: str
    parcel_area_ha: float
    agritrust_score: int
    risk_category: str
    needs_data_update: bool
    missing_data_reasons: List[str] = []
    last_delivery_date: Optional[str] = None


class FPOMemberPassportResponse(BaseModel):
    farmer_id: str
    farmer_code: str
    fpo_id: str
    full_name: str
    village: str
    agritrust_score: int
    score_grade: str
    safe_limit: float
    data_confidence: float
    risk_profile: Dict[str, str]
    telemetry: Dict[str, Any]
    needs_data_update: bool
    missing_data_reasons: List[str] = []


class AttestationRequest(BaseModel):
    transaction_id: str
    attested_by: str = Field(..., description="Username or ID of FPO admin attesting")
    notes: Optional[str] = Field(None, description="Optional delivery or inspection notes")


class AttestationResponse(BaseModel):
    transaction_id: str
    verified_by_fpo: bool
    attested_by: str
    attested_at: str
    audit_id: str
    message: str


class PendingAttestationItem(BaseModel):
    transaction_id: str
    farmer_id: str
    farmer_name: str
    crop_name: str
    quantity_sold: float
    realization_price: float
    total_value_inr: float
    mandi_name: str
    transaction_date: str
    delivery_slip_ref: Optional[str] = None


class FPOBulkFinancingResponse(BaseModel):
    fpo_id: str
    fpo_name: str
    total_borrowers: int
    aggregate_safe_credit_limit: float
    aggregate_repayment_capacity: float
    mean_default_probability_pct: float
    dscr_mean: float
    risk_breakdown: RiskMix
    proposed_interest_subvention_pct: float
    covenants: List[str]
    generated_at: str
