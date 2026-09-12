"""Land Parcel Model with PostGIS GEOMETRY(Polygon, 4326) and GIST Spatial Index."""

import uuid
from sqlalchemy import Column, String, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.models.base import Base, TimestampMixin


class LandParcel(Base, TimestampMixin):
    __tablename__ = "land_parcels"

    parcel_id = Column(
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
    survey_number = Column(String(100), nullable=False, index=True)
    acreage = Column(Numeric(10, 2), nullable=False)
    soil_type = Column(String(100), nullable=True)
    irrigation_source = Column(String(100), nullable=True)

    # PostGIS Polygon geometry with WGS84 coordinate reference system (SRID 4326)
    boundary_polygon = Column(
        Geometry(
            geometry_type="POLYGON",
            srid=4326,
            spatial_index=True,  # Automatically creates PostGIS GIST spatial index
        ),
        nullable=False,
    )

    # Relationships
    farmer = relationship("Farmer", back_populates="parcels")
    crop_cycles = relationship("CropCycle", back_populates="parcel", passive_deletes=False)

    __table_args__ = (
        # Explicit PostGIS GIST Spatial Index on the boundary polygon
        Index("idx_land_parcels_boundary_polygon_gist", "boundary_polygon", postgresql_using="gist"),
    )

    def __repr__(self):
        return f"<LandParcel(id={self.parcel_id}, survey='{self.survey_number}', acreage={self.acreage})>"
