"""Pydantic schemas for Stage 5 Consent-Token architecture."""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class ConsentGrantRequest(BaseModel):
    farmer_id: str
    lender_entity_id: str
    scope: List[str] = Field(
        ...,
        description="Allowed scopes, e.g.: ['credit_score', 'satellite_ndvi', 'harvest_history', 'bank_statement']",
    )
    purpose: str = Field(..., description="e.g. 'KCC Loan Underwriting Assessment'")
    validity_days: int = Field(30, ge=1, le=365)


class ConsentTokenResponse(BaseModel):
    consent_id: str
    farmer_id: str
    lender_entity_id: str
    scope: List[str]
    purpose: str
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    signature: str
    consent_token: str


class ConsentVerificationRequest(BaseModel):
    consent_token: str
    requested_scope: str


class ConsentVerificationResponse(BaseModel):
    is_valid: bool
    farmer_id: Optional[str] = None
    lender_entity_id: Optional[str] = None
    scope_permitted: bool = False
    message: str
