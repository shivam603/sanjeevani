"""Regional Pest and Disease Incidence Index Model."""

import uuid
from sqlalchemy import Column, String, Numeric, Date, Index
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base, TimestampMixin


class PestDiseaseIndex(Base, TimestampMixin):
    """
    Biological pest and disease susceptibility data per crop and district/region.
    Supplies features to Model C (Crop & Region Risk Engine).
    """
    __tablename__ = "pest_disease_index"

    index_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    crop_name = Column(String(100), nullable=False, index=True)
    region = Column(String(100), nullable=False, index=True)
    # Risk categorization: 'LOW', 'MODERATE', 'HIGH'
    risk_level = Column(String(50), nullable=False, index=True)
    # Incidence rate: percentage (0.00% to 100.00%)
    incidence_rate = Column(Numeric(5, 2), nullable=False)
    recorded_date = Column(Date, nullable=False, index=True)

    __table_args__ = (
        Index("ix_pest_disease_lookup", "crop_name", "region", "recorded_date"),
    )

    def __repr__(self):
        return f"<PestDiseaseIndex(crop='{self.crop_name}', region='{self.region}', level='{self.risk_level}', rate={self.incidence_rate}%)>"
