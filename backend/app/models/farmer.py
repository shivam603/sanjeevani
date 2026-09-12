"""Farmer Model with mandatory model-level one-way Aadhaar hashing and soft-delete/archival."""

import uuid
import re
import hashlib
from sqlalchemy import Column, String, Boolean, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, validates
from app.models.base import Base, TimestampMixin

# Regex patterns for Aadhaar validation
RAW_AADHAAR_REGEX = re.compile(r"^\d{12}$")
HASH_AADHAAR_REGEX = re.compile(r"^[a-fA-F0-9]{64}$")


class Farmer(Base, TimestampMixin):
    __tablename__ = "farmers"

    farmer_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    
    # Strictly store the one-way cryptographic SHA-256 hash. Never raw 12-digit Aadhaar.
    aadhaar_hash = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    mobile_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # FPO Association (nullable if farmer is independent)
    fpo_id = Column(
        UUID(as_uuid=True),
        ForeignKey("fpos.fpo_id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Soft-delete / Archival flag to protect audit trails
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    is_archived = Column(Boolean, default=False, nullable=False)

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("is_active", True)
        kwargs.setdefault("is_archived", False)
        super().__init__(*args, **kwargs)

    # Relationships
    fpo = relationship("FPO", back_populates="farmers")
    
    # Financial, spatial, and agronomic histories protected against silent deletion
    parcels = relationship("LandParcel", back_populates="farmer", passive_deletes=False)
    crop_cycles = relationship("CropCycle", back_populates="farmer", passive_deletes=False)
    transactions = relationship("MarketTransaction", back_populates="farmer", passive_deletes=False)
    credit_passports = relationship("CreditPassport", back_populates="farmer", passive_deletes=False)
    consents = relationship("DataConsent", back_populates="farmer", passive_deletes=False)
    insurance_records = relationship("InsuranceRecord", back_populates="farmer", passive_deletes=False)

    @staticmethod
    def hash_aadhaar(raw_aadhaar: str) -> str:
        """Compute one-way SHA-256 digest of clean 12-digit Aadhaar."""
        clean_aadhaar = str(raw_aadhaar).replace(" ", "").replace("-", "").strip()
        if not RAW_AADHAAR_REGEX.match(clean_aadhaar):
            raise ValueError("Raw Aadhaar must be exactly 12 numeric digits.")
        return hashlib.sha256(clean_aadhaar.encode("utf-8")).hexdigest()

    @validates("aadhaar_hash")
    def validate_and_enforce_aadhaar_hash(self, key, value) -> str:
        """
        Enforce at the model layer that raw Aadhaar is NEVER stored in plaintext.
        If a 12-digit raw Aadhaar is supplied, automatically hash it via SHA-256.
        If a valid 64-char SHA-256 hex string is supplied, accept it.
        Otherwise, reject immediately.
        """
        if not value:
            raise ValueError("Aadhaar hash cannot be null or empty.")

        clean_val = str(value).replace(" ", "").replace("-", "").strip()

        # If user passed raw 12 digits, convert immediately to one-way hash
        if RAW_AADHAAR_REGEX.match(clean_val):
            return hashlib.sha256(clean_val.encode("utf-8")).hexdigest()

        # If user passed already-hashed 64-char hex string
        if HASH_AADHAAR_REGEX.match(clean_val):
            return clean_val.lower()

        raise ValueError(
            "Invalid Aadhaar format: Must be either a 12-digit raw number (which will be auto-hashed) "
            "or a pre-computed 64-character SHA-256 hexadecimal hash. Plaintext non-numeric values are prohibited."
        )

    def set_aadhaar(self, raw_aadhaar: str) -> None:
        """Explicit setter to guarantee one-way hashing."""
        self.aadhaar_hash = self.hash_aadhaar(raw_aadhaar)

    def archive(self) -> None:
        """Soft-delete / archive farmer profile while preserving audit history."""
        self.is_active = False
        self.is_archived = True

    def __repr__(self):
        return f"<Farmer(id={self.farmer_id}, name='{self.full_name}', active={self.is_active})>"
