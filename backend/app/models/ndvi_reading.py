"""NDVI and Satellite Vegetation/Moisture Reading Model."""

import uuid
from sqlalchemy import Column, String, Numeric, Date, ForeignKey, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class NDVIReading(Base, TimestampMixin):
    """
    Stores multi-spectral satellite remote sensing observations (Sentinel-2, Landsat).
    Includes Normalized Difference Vegetation Index (NDVI) and Normalized Difference Water Index (NDWI).
    """
    __tablename__ = "ndvi_readings"

    reading_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    parcel_id = Column(
        UUID(as_uuid=True),
        ForeignKey("land_parcels.parcel_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # NDVI typically ranges from -1.0 to +1.0. Healthy crops: 0.4 to 0.85
    ndvi_value = Column(Numeric(5, 4), nullable=False)
    # Moisture Index (NDWI) typically ranges from -1.0 to +1.0
    moisture_index = Column(Numeric(5, 4), nullable=True)
    reading_date = Column(Date, nullable=False, index=True)
    cloud_coverage_pct = Column(Numeric(5, 2), default=0.0, nullable=True)
    satellite_source = Column(String(50), default="Sentinel-2-L2A", nullable=False)

    # Relationships
    parcel = relationship("LandParcel", backref="ndvi_readings")

    __table_args__ = (
        # Idempotency: One reading per parcel per calendar date
        UniqueConstraint("parcel_id", "reading_date", name="uq_parcel_reading_date"),
        Index("ix_ndvi_readings_parcel_date", "parcel_id", "reading_date"),
    )

    def __repr__(self):
        return f"<NDVIReading(parcel={self.parcel_id}, date={self.reading_date}, ndvi={self.ndvi_value})>"
