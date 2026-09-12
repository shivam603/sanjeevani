"""ML Feature Tables: loan_history, input_costs, pest_disease_index.

Revision ID: 003_ml_feature_tables
Revises: 002_ingestion_tables
Create Date: 2026-09-12 11:35:00.000000 UTC

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "003_ml_feature_tables"
down_revision: Union[str, None] = "002_ingestion_tables"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. loan_history
    op.create_table(
        "loan_history",
        sa.Column("loan_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("lender_name", sa.String(length=150), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("disbursed_date", sa.Date(), nullable=False),
        sa.Column("due_date", sa.Date(), nullable=False),
        sa.Column("repaid_date", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), server_default="ACTIVE", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_loan_history_loan_id", "loan_history", ["loan_id"])
    op.create_index("ix_loan_history_farmer_id", "loan_history", ["farmer_id"])
    op.create_index("ix_loan_history_status", "loan_history", ["status"])
    op.create_index("ix_loan_history_farmer_status", "loan_history", ["farmer_id", "status"])

    # 2. input_costs
    op.create_table(
        "input_costs",
        sa.Column("cost_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("crop_name", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=100), nullable=False),
        sa.Column("season", sa.String(length=50), nullable=False),
        sa.Column("cost_per_acre", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.UniqueConstraint("crop_name", "region", "season", name="uq_input_cost_crop_region_season"),
    )
    op.create_index("ix_input_costs_cost_id", "input_costs", ["cost_id"])
    op.create_index("ix_input_costs_crop_name", "input_costs", ["crop_name"])
    op.create_index("ix_input_costs_region", "input_costs", ["region"])
    op.create_index("ix_input_costs_lookup", "input_costs", ["crop_name", "region", "season"])

    # 3. pest_disease_index
    op.create_table(
        "pest_disease_index",
        sa.Column("index_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("crop_name", sa.String(length=100), nullable=False),
        sa.Column("region", sa.String(length=100), nullable=False),
        sa.Column("risk_level", sa.String(length=50), nullable=False),
        sa.Column("incidence_rate", sa.Numeric(5, 2), nullable=False),
        sa.Column("recorded_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_pest_disease_index_id", "pest_disease_index", ["index_id"])
    op.create_index("ix_pest_disease_crop_name", "pest_disease_index", ["crop_name"])
    op.create_index("ix_pest_disease_region", "pest_disease_index", ["region"])
    op.create_index("ix_pest_disease_lookup", "pest_disease_index", ["crop_name", "region", "recorded_date"])


def downgrade() -> None:
    op.drop_table("pest_disease_index")
    op.drop_table("input_costs")
    op.drop_table("loan_history")
