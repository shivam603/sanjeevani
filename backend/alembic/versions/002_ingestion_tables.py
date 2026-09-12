"""Ingestion Layer Tables: ndvi_readings, market_prices, data_ingestion_log.

Revision ID: 002_ingestion_tables
Revises: 001_initial_schema
Create Date: 2026-09-12 11:20:00.000000 UTC

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002_ingestion_tables"
down_revision: Union[str, None] = "001_initial_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. ndvi_readings
    op.create_table(
        "ndvi_readings",
        sa.Column("reading_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("parcel_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("land_parcels.parcel_id", ondelete="CASCADE"), nullable=False),
        sa.Column("ndvi_value", sa.Numeric(5, 4), nullable=False),
        sa.Column("moisture_index", sa.Numeric(5, 4), nullable=True),
        sa.Column("reading_date", sa.Date(), nullable=False),
        sa.Column("cloud_coverage_pct", sa.Numeric(5, 2), server_default="0.0", nullable=True),
        sa.Column("satellite_source", sa.String(length=50), server_default="Sentinel-2-L2A", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.UniqueConstraint("parcel_id", "reading_date", name="uq_parcel_reading_date"),
    )
    op.create_index("ix_ndvi_readings_reading_id", "ndvi_readings", ["reading_id"])
    op.create_index("ix_ndvi_readings_parcel_id", "ndvi_readings", ["parcel_id"])
    op.create_index("ix_ndvi_readings_reading_date", "ndvi_readings", ["reading_date"])
    op.create_index("ix_ndvi_readings_parcel_date", "ndvi_readings", ["parcel_id", "reading_date"])

    # 2. market_prices
    op.create_table(
        "market_prices",
        sa.Column("price_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("crop_name", sa.String(length=100), nullable=False),
        sa.Column("mandi_name", sa.String(length=150), nullable=False),
        sa.Column("state", sa.String(length=100), nullable=False),
        sa.Column("modal_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("min_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("max_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("arrival_volume", sa.Numeric(12, 2), server_default="0.0", nullable=False),
        sa.Column("price_date", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
        sa.UniqueConstraint("crop_name", "mandi_name", "price_date", name="uq_crop_mandi_date"),
    )
    op.create_index("ix_market_prices_price_id", "market_prices", ["price_id"])
    op.create_index("ix_market_prices_crop_name", "market_prices", ["crop_name"])
    op.create_index("ix_market_prices_mandi_name", "market_prices", ["mandi_name"])
    op.create_index("ix_market_prices_price_date", "market_prices", ["price_date"])
    op.create_index("ix_market_prices_query", "market_prices", ["crop_name", "mandi_name", "price_date"])

    # 3. data_ingestion_log
    op.create_table(
        "data_ingestion_log",
        sa.Column("log_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("source", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("rows_ingested", sa.Integer(), server_default="0", nullable=False),
        sa.Column("rows_skipped", sa.Integer(), server_default="0", nullable=False),
        sa.Column("rows_failed", sa.Integer(), server_default="0", nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
    )
    op.create_index("ix_data_ingestion_log_log_id", "data_ingestion_log", ["log_id"])
    op.create_index("ix_data_ingestion_log_source", "data_ingestion_log", ["source"])
    op.create_index("ix_data_ingestion_log_status", "data_ingestion_log", ["status"])
    op.create_index("ix_data_ingestion_log_source_status", "data_ingestion_log", ["source", "status"])
    op.create_index("ix_data_ingestion_log_started_at", "data_ingestion_log", ["started_at"])


def downgrade() -> None:
    op.drop_table("data_ingestion_log")
    op.drop_table("market_prices")
    op.drop_table("ndvi_readings")
