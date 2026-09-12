"""Data Consent Model (Stage 5 Sovereign Farmer Consent)."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
from app.models.base import Base


class DataConsent(Base):
    __tablename__ = "data_consents"

    consent_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    farmer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("farmers.farmer_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    lender_id = Column(
        UUID(as_uuid=True),
        ForeignKey("lenders.lender_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    
    # Array of authorized permission scopes (e.g. ['credit_score', 'satellite_ndvi', 'harvest_history'])
    shared_attributes = Column(ARRAY(String), nullable=False)
    
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    granted_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    farmer = relationship("Farmer", back_populates="consents")
    lender = relationship("Lender", back_populates="consents")

    def revoke(self) -> None:
        """Revoke consent grant immediately."""
        self.is_active = False
        self.revoked_at = datetime.now(timezone.utc)

    def __repr__(self):
        return f"<DataConsent(id={self.consent_id}, farmer={self.farmer_id}, lender={self.lender_id}, active={self.is_active})>"
