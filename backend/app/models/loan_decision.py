"""Loan Underwriting Decision Model.

Records loan decisions (APPROVED, DECLINED, REFERRED) against a credit passport_id
for compliance audit trails and future machine learning model feedback loops.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Numeric, Integer, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class LoanDecisionRecord(Base):
    __tablename__ = "loan_decision_records"

    decision_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    lender_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    passport_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    farmer_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    # Decision outcome: 'APPROVED', 'DECLINED', 'REFERRED'
    decision = Column(String(50), nullable=False, index=True)
    approved_amount = Column(Numeric(14, 2), nullable=True)
    tenure_months = Column(Integer, nullable=True)
    interest_rate_pct = Column(Numeric(5, 2), nullable=True)
    covenants = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    underwriter_id = Column(String(100), nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    __table_args__ = (
        Index("ix_loan_decision_lender_time", "lender_id", "created_at"),
        Index("ix_loan_decision_passport", "passport_id"),
    )

    def __repr__(self):
        return (
            f"<LoanDecisionRecord(id={self.decision_id}, decision='{self.decision}', "
            f"amount={self.approved_amount}, passport={self.passport_id})>"
        )
