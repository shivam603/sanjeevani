"""Market Transaction Model (Mandi APMC Sales Records)."""

import uuid
from sqlalchemy import Column, String, Numeric, Date, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class MarketTransaction(Base, TimestampMixin):
    __tablename__ = "market_transactions"

    transaction_id = Column(
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
    crop_name = Column(String(100), nullable=False, index=True)
    quantity_sold = Column(Numeric(10, 2), nullable=False)  # in Quintals
    realization_price = Column(Numeric(12, 2), nullable=False)  # INR per quintal
    mandi_name = Column(String(150), nullable=False, index=True)
    transaction_date = Column(Date, nullable=False, index=True)
    verified_by_fpo = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    farmer = relationship("Farmer", back_populates="transactions")

    def __repr__(self):
        return f"<MarketTransaction(id={self.transaction_id}, mandi='{self.mandi_name}', crop='{self.crop_name}', amount={self.realization_price})>"
