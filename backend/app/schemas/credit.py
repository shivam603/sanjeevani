"""Credit Eligibility & Loan Application Schemas for KisanCred / AgriTrust."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CreditEligibilityRequest(BaseModel):
    """Request schema to compute credit eligibility and safe credit limits."""
    model_config = ConfigDict(from_attributes=True)

    farmer_id: str = Field(..., description="Unique farmer ID or phone number", examples=["FMR-PB-LDH-0042"])
    land_area_acres: float = Field(..., gt=0.0, description="Cultivated land area in acres", examples=[4.2])
    crop_type: str = Field(..., description="Crop type being cultivated", examples=["Wheat"])
    ndvi_crop_health_score: Optional[float] = Field(
        0.75,
        ge=0.0,
        le=1.0,
        description="Normalized NDVI satellite vegetation health score (0.0 to 1.0)",
        examples=[0.78]
    )
    annual_income_inr: Optional[float] = Field(
        None,
        ge=0.0,
        description="Declared or verified annual farming revenue in INR",
        examples=[320000.0]
    )
    existing_debt_inr: Optional[float] = Field(
        0.0,
        ge=0.0,
        description="Current outstanding formal/informal debt in INR",
        examples=[25000.0]
    )


class FactorBreakdown(BaseModel):
    """Individual explainability factor contributing to the credit eligibility calculation."""
    model_config = ConfigDict(from_attributes=True)

    factor_name: str = Field(..., description="Factor identifier or descriptive title")
    contribution_amount: float = Field(..., description="Positive or negative INR impact or multiplier")
    description: str = Field(..., description="Plain-language explanation of why this factor impacts loan limit")


class CreditEligibilityResponse(BaseModel):
    """Calculated credit eligibility and explainability response."""
    model_config = ConfigDict(from_attributes=True)

    farmer_id: str = Field(..., description="Unique farmer ID")
    eligible_loan_amount_inr: float = Field(..., ge=0.0, description="Recommended maximum eligible credit limit in INR")
    credit_score: int = Field(..., ge=300, le=900, description="AgriTrust dynamic credit score (300-900)")
    risk_category: str = Field(..., description="Risk tier: LOW, MEDIUM, HIGH, VERY_HIGH")
    scale_of_finance_per_acre: float = Field(..., description="Official district/state Scale of Finance (KCC) per acre in INR")
    basis_factors: List[FactorBreakdown] = Field(default_factory=list, description="List of factor contributions")
    approval_recommendation: str = Field(..., description="Instant underwriting guideline recommendation")


class LoanApplicationCreate(BaseModel):
    """Schema for submitting a loan application by the farmer."""
    model_config = ConfigDict(from_attributes=True)

    farmer_id: str = Field(..., description="Unique farmer ID")
    farmer_name: str = Field(..., description="Farmer full name")
    requested_amount_inr: float = Field(..., gt=0.0, description="Requested loan amount in INR")
    land_area_acres: float = Field(..., gt=0.0, description="Land acreage")
    crop_type: str = Field(..., description="Primary crop")
    purpose: str = Field(..., description="Purpose of agricultural loan (e.g. Seeds, Fertilizers, Machinery, Irrigation)")


class LoanApplicationResponse(BaseModel):
    """Schema for returning a loan application record."""
    model_config = ConfigDict(from_attributes=True)

    loan_id: str = Field(..., description="Unique loan application UUID")
    farmer_id: str = Field(..., description="Unique farmer ID")
    farmer_name: str = Field(..., description="Farmer full name")
    requested_amount_inr: float = Field(..., description="Requested loan amount in INR")
    eligible_amount_inr: float = Field(..., description="System-calculated or approved eligible amount in INR")
    status: str = Field(..., description="Application status: PENDING, APPROVED, REJECTED, DISBURSED")
    created_at: datetime = Field(..., description="Timestamp when application was submitted")
    basis_summary: str = Field(..., description="Underwriting basis summary")
    lender_comments: Optional[str] = Field(None, description="Lender comments or conditions")


class LoanActionRequest(BaseModel):
    """Schema for lender approval/rejection action."""
    model_config = ConfigDict(from_attributes=True)

    action: str = Field(..., description="Decision action: APPROVED or REJECTED")
    approved_amount_inr: Optional[float] = Field(None, ge=0.0, description="Final approved loan amount in INR if modified")
    comments: Optional[str] = Field(None, description="Review remarks and underwriting rationale")
