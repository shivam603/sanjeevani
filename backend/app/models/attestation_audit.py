"""Production Attestation Audit Log Model.

Captures an immutable audit trail for every crop sale/delivery attestation by an FPO admin:
who attested what, for which member, and when.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class AttestationAuditLog(Base):
    __tablename__ = "attestation_audit_logs"

    audit_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    fpo_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    transaction_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    farmer_id = Column(
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    attested_by = Column(String(150), nullable=False)
    action = Column(String(50), default="VERIFIED_BY_FPO", nullable=False)
    notes = Column(String(500), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    __table_args__ = (
        Index("ix_attestation_audit_fpo_time", "fpo_id", "created_at"),
    )

    def __repr__(self):
        return (
            f"<AttestationAuditLog(id={self.audit_id}, fpo={self.fpo_id}, "
            f"tx={self.transaction_id}, by='{self.attested_by}', at={self.created_at})>"
        )
