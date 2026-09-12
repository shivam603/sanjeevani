"""Credit Passport Model (Alternative AgriTrust Credit Intelligence)."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Numeric, String, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base


class CreditPassport(Base):
    __tablename__ = "credit_passports"

    passport_id = Column(
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
    agritrust_score = Column(Integer, nullable=False, index=True)
    data_confidence = Column(Numeric(5, 4), nullable=False)  # 0.0000 to 1.0000
    safe_credit_min = Column(Numeric(12, 2), nullable=False)  # in INR
    safe_credit_max = Column(Numeric(12, 2), nullable=False)  # in INR
    generated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    model_version = Column(String(50), nullable=False)

    # Relationships
    farmer = relationship("Farmer", back_populates="credit_passports")

    __table_args__ = (
        CheckConstraint("agritrust_score >= 300 AND agritrust_score <= 900", name="chk_agritrust_score_range"),
        CheckConstraint("safe_credit_min <= safe_credit_max", name="chk_credit_limit_range"),
    )

    def __repr__(self):
        return f"<CreditPassport(id={self.passport_id}, score={self.agritrust_score}, version='{self.model_version}')>"
