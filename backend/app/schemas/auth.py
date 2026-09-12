"""Pydantic schemas for authentication and identity."""

from typing import Optional, List
from pydantic import BaseModel, Field


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    roles: List[str] = Field(default_factory=list)


class TokenData(BaseModel):
    user_id: Optional[str] = None
    roles: List[str] = Field(default_factory=list)


class LoginRequest(BaseModel):
    phone_or_email: str
    password_or_otp: str
    role: str = Field("farmer", description="One of: 'farmer', 'fpo_admin', 'lender_underwriter'")


class UserProfile(BaseModel):
    id: str
    name: str
    phone: str
    role: str
    organization_id: Optional[str] = None
