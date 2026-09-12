"""Pydantic schemas for Stage 5 Credit Profile and Consent API endpoints."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# -----------------------------------------------------------------------------
# Consent Request & Response Schemas
# -----------------------------------------------------------------------------

class ConsentCreateRequest(BaseModel):
    farmer_id: str = Field(..., description="UUID or identifier of granting farmer")
    lender_id: str = Field(..., description="UUID or identifier of recipient lending institution")
    shared_attributes: List[str] = Field(
        default=[
            "agritrust_score",
            "data_confidence",
            "safe_limit",
            "recommended_tenure_months",
            "loan_purpose",
            "expected_repayment_capacity",
            "crop_risk",
            "market_volatility",
        ],
        description="Explicitly authorized telemetry and underwriting attributes",
    )
    validity_days: int = Field(default=30, ge=1, le=365, description="Token lifetime in days")
    purpose: Optional[str] = Field(default="KCC / Agricultural Loan Underwriting", description="Reason for access")

    model_config = ConfigDict(extra="ignore")


class ConsentResponse(BaseModel):
    consent_id: str
    farmer_id: str
    lender_id: str
    shared_attributes: List[str]
    expires_at: datetime
    is_active: bool
    granted_at: datetime
    consent_token: str

    model_config = ConfigDict(extra="ignore")


class ConsentRevokeResponse(BaseModel):
    status: str = "revoked"
    consent_id: str
    is_active: bool = False
    revoked_at: datetime

    model_config = ConfigDict(extra="ignore")


# -----------------------------------------------------------------------------
# Lender Credit Profile Schemas (Strict Zero-PII)
# -----------------------------------------------------------------------------

class LenderRecommendations(BaseModel):
    safe_limit: Optional[float] = None
    recommended_tenure_months: Optional[int] = None
    loan_purpose: Optional[str] = None
    expected_repayment_capacity: Optional[float] = None

    model_config = ConfigDict(extra="ignore")


class LenderRiskProfile(BaseModel):
    crop_risk: Optional[str] = None
    market_volatility: Optional[str] = None

    model_config = ConfigDict(extra="ignore")


class LenderCreditProfileResponse(BaseModel):
    """
    Strict response shape for lender-facing credit profile endpoint:
    {
       "farmer_id": ..., "agritrust_score": ..., "data_confidence": ...,
       "recommendations": { "safe_limit": ..., "recommended_tenure_months": ...,
                             "loan_purpose": ..., "expected_repayment_capacity": ... },
       "risk_profile": { "crop_risk": "...", "market_volatility": "..." }
    }
    NOTE: Zero personal identification (aadhaar_hash, mobile_number, full_name)
    is ever included in this schema.
    """
    farmer_id: str
    agritrust_score: Optional[int] = None
    data_confidence: Optional[float] = None
    recommendations: Dict[str, Any] = Field(default_factory=dict)
    risk_profile: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(extra="forbid")


# -----------------------------------------------------------------------------
# Farmer-Facing Passport & Background Refresh Schemas
# -----------------------------------------------------------------------------

class FarmerPassportResponse(BaseModel):
    passport_id: str
    farmer_id: str
    agritrust_score: int
    rating_tier: str
    data_confidence: float
    safe_credit_min: float
    safe_credit_max: float
    repayment_capacity: Optional[Dict[str, Any]] = None
    crop_risk: Optional[Dict[str, Any]] = None
    market_prices_scenario: Optional[Dict[str, Any]] = None
    shap_explainability: Optional[Dict[str, Any]] = None
    explanation: Dict[str, Any]
    generated_at: str
    model_version: str

    model_config = ConfigDict(extra="ignore")


class RefreshPassportResponse(BaseModel):
    status: str = "queued"
    farmer_id: str
    message: str = "Credit passport regeneration initiated in background"

    model_config = ConfigDict(extra="ignore")
