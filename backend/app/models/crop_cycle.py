"""Crop Cycle Model."""

import uuid
from sqlalchemy import Column, String, Numeric, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class CropCycle(Base, TimestampMixin):
    __tablename__ = "crop_cycles"

    cycle_id = Column(
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
    parcel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("land_parcels.parcel_id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    crop_name = Column(String(100), nullable=False, index=True)
    season = Column(String(50), nullable=False)  # e.g., 'Kharif 2025', 'Rabi 2025-26'
    expected_yield = Column(Numeric(10, 2), nullable=False)  # Metric tons / quintals
    actual_yield = Column(Numeric(10, 2), nullable=True)
    sown_date = Column(Date, nullable=False)
    harvest_date = Column(Date, nullable=True)

    # Relationships
    farmer = relationship("Farmer", back_populates="crop_cycles")
    parcel = relationship("LandParcel", back_populates="crop_cycles")

    def __repr__(self):
        return f"<CropCycle(id={self.cycle_id}, crop='{self.crop_name}', season='{self.season}')>"
