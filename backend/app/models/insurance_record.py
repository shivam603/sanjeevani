"""Insurance Record Model (Crop Insurance & PMFBY Claims)."""

import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class InsuranceRecord(Base, TimestampMixin):
    __tablename__ = "insurance_records"

    insurance_id = Column(
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
    scheme_name = Column(String(255), nullable=False, index=True)  # e.g., 'PM Fasal Bima Yojana (PMFBY)'
    season = Column(String(50), nullable=False)  # e.g., 'Kharif 2025'
    premium_paid = Column(Numeric(10, 2), nullable=False)
    claim_amount = Column(Numeric(10, 2), default=0.0, nullable=False)
    claim_status = Column(String(50), nullable=False, index=True)  # 'APPROVED', 'SETTLED', 'PENDING', 'REJECTED'

    # Relationships
    farmer = relationship("Farmer", back_populates="insurance_records")

    def __repr__(self):
        return f"<InsuranceRecord(id={self.insurance_id}, scheme='{self.scheme_name}', status='{self.claim_status}')>"
