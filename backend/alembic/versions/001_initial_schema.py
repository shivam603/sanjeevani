"""Initial Schema: 9 core tables for KisanCred with PostGIS geospatial support.

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-12 10:55:00.000000 UTC

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 0. Ensure PostGIS and UUID extensions exist
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

    # 1. fpos
    op.create_table(
        "fpos",
        sa.Column("fpo_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("fpo_name", sa.String(length=255), nullable=False),
        sa.Column("registration_number", sa.String(length=100), nullable=False, unique=True),
        sa.Column("region", sa.String(length=150), nullable=False),
        sa.Column("member_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_fpos_fpo_id", "fpos", ["fpo_id"])
    op.create_index("ix_fpos_registration_number", "fpos", ["registration_number"], unique=True)

    # 2. lenders
    op.create_table(
        "lenders",
        sa.Column("lender_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("institution_name", sa.String(length=255), nullable=False),
        sa.Column("api_key_hash", sa.String(length=255), nullable=False),
        sa.Column("tier", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_lenders_lender_id", "lenders", ["lender_id"])
    op.create_index("ix_lenders_institution_name", "lenders", ["institution_name"])

    # 3. farmers
    op.create_table(
        "farmers",
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("aadhaar_hash", sa.String(length=64), nullable=False, unique=True),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("mobile_number", sa.String(length=20), nullable=False, unique=True),
        sa.Column("fpo_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("fpos.fpo_id", ondelete="SET NULL"), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("is_archived", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_farmers_farmer_id", "farmers", ["farmer_id"])
    op.create_index("ix_farmers_aadhaar_hash", "farmers", ["aadhaar_hash"], unique=True)
    op.create_index("ix_farmers_mobile_number", "farmers", ["mobile_number"], unique=True)
    op.create_index("ix_farmers_fpo_id", "farmers", ["fpo_id"])
    op.create_index("ix_farmers_is_active", "farmers", ["is_active"])

    # 4. land_parcels
    op.create_table(
        "land_parcels",
        sa.Column("parcel_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("survey_number", sa.String(length=100), nullable=False),
        sa.Column("acreage", sa.Numeric(10, 2), nullable=False),
        sa.Column("soil_type", sa.String(length=100), nullable=True),
        sa.Column("irrigation_source", sa.String(length=100), nullable=True),
        sa.Column("boundary_polygon", Geometry(geometry_type="POLYGON", srid=4326), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_land_parcels_parcel_id", "land_parcels", ["parcel_id"])
    op.create_index("ix_land_parcels_farmer_id", "land_parcels", ["farmer_id"])
    op.create_index("ix_land_parcels_survey_number", "land_parcels", ["survey_number"])
    # GIST Spatial Index on boundary polygon
    op.create_index("idx_land_parcels_boundary_polygon_gist", "land_parcels", ["boundary_polygon"], postgresql_using="gist")

    # 5. crop_cycles
    op.create_table(
        "crop_cycles",
        sa.Column("cycle_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("parcel_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("land_parcels.parcel_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("crop_name", sa.String(length=100), nullable=False),
        sa.Column("season", sa.String(length=50), nullable=False),
        sa.Column("expected_yield", sa.Numeric(10, 2), nullable=False),
        sa.Column("actual_yield", sa.Numeric(10, 2), nullable=True),
        sa.Column("sown_date", sa.Date(), nullable=False),
        sa.Column("harvest_date", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_crop_cycles_cycle_id", "crop_cycles", ["cycle_id"])
    op.create_index("ix_crop_cycles_farmer_id", "crop_cycles", ["farmer_id"])
    op.create_index("ix_crop_cycles_parcel_id", "crop_cycles", ["parcel_id"])
    op.create_index("ix_crop_cycles_crop_name", "crop_cycles", ["crop_name"])

    # 6. market_transactions
    op.create_table(
        "market_transactions",
        sa.Column("transaction_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("crop_name", sa.String(length=100), nullable=False),
        sa.Column("quantity_sold", sa.Numeric(10, 2), nullable=False),
        sa.Column("realization_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("mandi_name", sa.String(length=150), nullable=False),
        sa.Column("transaction_date", sa.Date(), nullable=False),
        sa.Column("verified_by_fpo", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_market_transactions_transaction_id", "market_transactions", ["transaction_id"])
    op.create_index("ix_market_transactions_farmer_id", "market_transactions", ["farmer_id"])
    op.create_index("ix_market_transactions_crop_name", "market_transactions", ["crop_name"])
    op.create_index("ix_market_transactions_mandi_name", "market_transactions", ["mandi_name"])
    op.create_index("ix_market_transactions_transaction_date", "market_transactions", ["transaction_date"])

    # 7. credit_passports
    op.create_table(
        "credit_passports",
        sa.Column("passport_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("agritrust_score", sa.Integer(), nullable=False),
        sa.Column("data_confidence", sa.Numeric(5, 4), nullable=False),
        sa.Column("safe_credit_min", sa.Numeric(12, 2), nullable=False),
        sa.Column("safe_credit_max", sa.Numeric(12, 2), nullable=False),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("model_version", sa.String(length=50), nullable=False),
        sa.CheckConstraint("agritrust_score >= 300 AND agritrust_score <= 900", name="chk_agritrust_score_range"),
        sa.CheckConstraint("safe_credit_min <= safe_credit_max", name="chk_credit_limit_range"),
    )
    op.create_index("ix_credit_passports_passport_id", "credit_passports", ["passport_id"])
    op.create_index("ix_credit_passports_farmer_id", "credit_passports", ["farmer_id"])
    op.create_index("ix_credit_passports_agritrust_score", "credit_passports", ["agritrust_score"])

    # 8. data_consents
    op.create_table(
        "data_consents",
        sa.Column("consent_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("lender_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("lenders.lender_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("shared_attributes", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("granted_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_data_consents_consent_id", "data_consents", ["consent_id"])
    op.create_index("ix_data_consents_farmer_id", "data_consents", ["farmer_id"])
    op.create_index("ix_data_consents_lender_id", "data_consents", ["lender_id"])
    op.create_index("ix_data_consents_is_active", "data_consents", ["is_active"])

    # 9. insurance_records
    op.create_table(
        "insurance_records",
        sa.Column("insurance_id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("uuid_generate_v4()")),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("farmers.farmer_id", ondelete="RESTRICT"), nullable=False),
        sa.Column("scheme_name", sa.String(length=255), nullable=False),
        sa.Column("season", sa.String(length=50), nullable=False),
        sa.Column("premium_paid", sa.Numeric(10, 2), nullable=False),
        sa.Column("claim_amount", sa.Numeric(10, 2), server_default="0.0", nullable=False),
        sa.Column("claim_status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=True),
    )
    op.create_index("ix_insurance_records_insurance_id", "insurance_records", ["insurance_id"])
    op.create_index("ix_insurance_records_farmer_id", "insurance_records", ["farmer_id"])
    op.create_index("ix_insurance_records_scheme_name", "insurance_records", ["scheme_name"])
    op.create_index("ix_insurance_records_claim_status", "insurance_records", ["claim_status"])


def downgrade() -> None:
    op.drop_table("insurance_records")
    op.drop_table("data_consents")
    op.drop_table("credit_passports")
    op.drop_table("market_transactions")
    op.drop_table("crop_cycles")
    op.drop_index("idx_land_parcels_boundary_polygon_gist", table_name="land_parcels")
    op.drop_table("land_parcels")
    op.drop_table("farmers")
    op.drop_table("lenders")
    op.drop_table("fpos")
