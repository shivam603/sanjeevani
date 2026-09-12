"""Input Cost Benchmark Reference Model."""

import uuid
from sqlalchemy import Column, String, Numeric, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin


class InputCost(Base, TimestampMixin):
    """
    Standardized benchmark of agricultural cultivation expenses per acre.
    Categorized by crop commodity, agricultural region, and agro-climatic season.
    Utilized by Model B (Repayment Capacity Calculator) to deduce net cashflow.
    """
    __tablename__ = "input_costs"

    cost_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    crop_name = Column(String(100), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    season = Column(String(50), nullable=False)  # e.g., 'Kharif', 'Rabi', 'Summer'
    cost_per_acre = Column(Numeric(10, 2), nullable=False)  # INR per acre

    __table_args__ = (
        UniqueConstraint("crop_name", "region", "season", name="uq_input_cost_crop_region_season"),
        Index("ix_input_costs_lookup", "crop_name", "region", "season"),
    )

    def __repr__(self):
        return f"<InputCost(crop='{self.crop_name}', region='{self.region}', cost_per_acre={self.cost_per_acre})>"
