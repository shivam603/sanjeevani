"""Lender (Financial Institution / Bank / MFI) Model."""

import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class Lender(Base, TimestampMixin):
    __tablename__ = "lenders"

    lender_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    institution_name = Column(String(255), nullable=False, index=True)
    api_key_hash = Column(String(255), nullable=False)
    tier = Column(String(50), nullable=False)  # e.g., 'Tier-1 Public Bank', 'NBFC', 'MFI'

    # Relationships
    consents = relationship("DataConsent", back_populates="lender", cascade="save-update, merge")

    def __repr__(self):
        return f"<Lender(id={self.lender_id}, name='{self.institution_name}', tier='{self.tier}')>"
