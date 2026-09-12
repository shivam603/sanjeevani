"""FPO (Farmer Producer Organization) Model."""

import uuid
from sqlalchemy import Column, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import Base, TimestampMixin


class FPO(Base, TimestampMixin):
    __tablename__ = "fpos"

    fpo_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    fpo_name = Column(String(255), nullable=False)
    registration_number = Column(String(100), unique=True, nullable=False, index=True)
    region = Column(String(150), nullable=False)
    member_count = Column(Integer, default=0, nullable=False)

    # Relationships
    farmers = relationship("Farmer", back_populates="fpo", cascade="save-update, merge")

    def __repr__(self):
        return f"<FPO(id={self.fpo_id}, name='{self.fpo_name}', reg='{self.registration_number}')>"
