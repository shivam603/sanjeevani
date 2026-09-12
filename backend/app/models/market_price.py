"""Market Price Model (AGMARKNET Mandi Wholesale Daily Prices)."""

import uuid
from sqlalchemy import Column, String, Numeric, Date, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin


class MarketPrice(Base, TimestampMixin):
    """
    Stores daily wholesale APMC mandi prices and arrival volumes from AGMARKNET.
    Provides benchmark pricing for credit valuation, revenue estimation, and crop liquidation.
    """
    __tablename__ = "market_prices"

    price_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    crop_name = Column(String(100), nullable=False, index=True)
    mandi_name = Column(String(150), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    modal_price = Column(Numeric(12, 2), nullable=False)  # INR per Quintal
    min_price = Column(Numeric(12, 2), nullable=True)     # INR per Quintal
    max_price = Column(Numeric(12, 2), nullable=True)     # INR per Quintal
    arrival_volume = Column(Numeric(12, 2), default=0.0, nullable=False)  # Quintals / Tonnes
    price_date = Column(Date, nullable=False, index=True)

    __table_args__ = (
        # Idempotency: One entry per crop, mandi, and date
        UniqueConstraint("crop_name", "mandi_name", "price_date", name="uq_crop_mandi_date"),
        Index("ix_market_prices_query", "crop_name", "mandi_name", "price_date"),
    )

    def __repr__(self):
        return f"<MarketPrice(crop='{self.crop_name}', mandi='{self.mandi_name}', date={self.price_date}, modal={self.modal_price})>"
