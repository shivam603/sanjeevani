"""Loan History and Repayment Behavior Model."""

import uuid
from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class LoanHistory(Base, TimestampMixin):
    """
    Stores institutional and informal loan facilities and historical repayments.
    Key feature provider for Model A creditworthiness scoring.
    """
    __tablename__ = "loan_history"

    loan_id = Column(
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
    lender_name = Column(String(150), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)  # Loan principal in INR
    disbursed_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date, nullable=False)
    repaid_date = Column(Date, nullable=True)
    # Status: 'REPAID', 'ACTIVE', 'OVERDUE', 'DEFAULTED'
    status = Column(String(50), default="ACTIVE", nullable=False, index=True)

    # Relationship
    farmer = relationship("Farmer", backref="loans")

    __table_args__ = (
        Index("ix_loan_history_farmer_status", "farmer_id", "status"),
    )

    def __repr__(self):
        return f"<LoanHistory(id={self.loan_id}, farmer={self.farmer_id}, amount={self.amount}, status='{self.status}')>"
