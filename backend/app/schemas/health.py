"""Pydantic schemas for health-check endpoint."""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class ServiceComponentHealth(BaseModel):
    status: str
    details: Optional[Dict[str, Any]] = None


class HealthResponse(BaseModel):
    status: str = Field(..., description="Overall platform health: 'healthy', 'degraded', or 'unhealthy'")
    platform: str = "Sanjeevani API"
    version: str
    environment: str
    timestamp: datetime
    services: Dict[str, Any] = Field(default_factory=dict)
