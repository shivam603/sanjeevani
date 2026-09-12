-- =============================================================================
-- KisanCred / AgriTrust — PostGIS & Relational Database Initialization
-- =============================================================================

-- Enable PostGIS geospatial extension & UUID generator
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log PostGIS version
DO $$
BEGIN
    RAISE NOTICE 'PostGIS Extension initialized. Version: %', postgis_full_version();
END $$;

-- -----------------------------------------------------------------------------
-- 1. FPOs (Farmer Producer Organizations)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fpos (
    fpo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fpo_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    region VARCHAR(150) NOT NULL,
    member_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_fpos_fpo_id ON fpos (fpo_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_fpos_registration_number ON fpos (registration_number);

-- -----------------------------------------------------------------------------
-- 2. Lenders (Financial Institutions / Banks / MFIs / NBFCs)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lenders (
    lender_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name VARCHAR(255) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_lenders_lender_id ON lenders (lender_id);
CREATE INDEX IF NOT EXISTS ix_lenders_institution_name ON lenders (institution_name);

-- -----------------------------------------------------------------------------
-- 3. Farmers Table (With One-Way Aadhaar Hash & Soft-Delete)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farmers (
    farmer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aadhaar_hash VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    fpo_id UUID REFERENCES fpos(fpo_id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_farmers_farmer_id ON farmers (farmer_id);
CREATE UNIQUE INDEX IF NOT EXISTS ix_farmers_aadhaar_hash ON farmers (aadhaar_hash);
CREATE UNIQUE INDEX IF NOT EXISTS ix_farmers_mobile_number ON farmers (mobile_number);
CREATE INDEX IF NOT EXISTS ix_farmers_fpo_id ON farmers (fpo_id);
CREATE INDEX IF NOT EXISTS ix_farmers_is_active ON farmers (is_active);

-- -----------------------------------------------------------------------------
-- 4. Land Parcels (PostGIS Polygon 4326 + GIST Spatial Index)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS land_parcels (
    parcel_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE RESTRICT,
    survey_number VARCHAR(100) NOT NULL,
    acreage NUMERIC(10, 2) NOT NULL,
    soil_type VARCHAR(100),
    irrigation_source VARCHAR(100),
    boundary_polygon GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_land_parcels_parcel_id ON land_parcels (parcel_id);
CREATE INDEX IF NOT EXISTS ix_land_parcels_farmer_id ON land_parcels (farmer_id);
CREATE INDEX IF NOT EXISTS ix_land_parcels_survey_number ON land_parcels (survey_number);
CREATE INDEX IF NOT EXISTS idx_land_parcels_boundary_polygon_gist ON land_parcels USING GIST (boundary_polygon);

-- -----------------------------------------------------------------------------
-- 5. Crop Cycles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_cycles (
    cycle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE RESTRICT,
    parcel_id UUID NOT NULL REFERENCES land_parcels(parcel_id) ON DELETE RESTRICT,
    crop_name VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL,
    expected_yield NUMERIC(10, 2) NOT NULL,
    actual_yield NUMERIC(10, 2),
    sown_date DATE NOT NULL,
    harvest_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_crop_cycles_cycle_id ON crop_cycles (cycle_id);
CREATE INDEX IF NOT EXISTS ix_crop_cycles_farmer_id ON crop_cycles (farmer_id);
CREATE INDEX IF NOT EXISTS ix_crop_cycles_parcel_id ON crop_cycles (parcel_id);
CREATE INDEX IF NOT EXISTS ix_crop_cycles_crop_name ON crop_cycles (crop_name);

-- -----------------------------------------------------------------------------
-- 6. Market Transactions (Mandi APMC Sales Records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE RESTRICT,
    crop_name VARCHAR(100) NOT NULL,
    quantity_sold NUMERIC(10, 2) NOT NULL,
    realization_price NUMERIC(12, 2) NOT NULL,
    mandi_name VARCHAR(150) NOT NULL,
    transaction_date DATE NOT NULL,
    verified_by_fpo BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_market_transactions_transaction_id ON market_transactions (transaction_id);
CREATE INDEX IF NOT EXISTS ix_market_transactions_farmer_id ON market_transactions (farmer_id);
CREATE INDEX IF NOT EXISTS ix_market_transactions_crop_name ON market_transactions (crop_name);
CREATE INDEX IF NOT EXISTS ix_market_transactions_mandi_name ON market_transactions (mandi_name);
CREATE INDEX IF NOT EXISTS ix_market_transactions_transaction_date ON market_transactions (transaction_date);

-- -----------------------------------------------------------------------------
-- 7. Credit Passports (AgriTrust Credit Intelligence)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS credit_passports (
    passport_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE RESTRICT,
    agritrust_score INTEGER NOT NULL,
    data_confidence NUMERIC(5, 4) NOT NULL,
    safe_credit_min NUMERIC(12, 2) NOT NULL,
    safe_credit_max NUMERIC(12, 2) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    CONSTRAINT chk_agritrust_score_range CHECK (agritrust_score >= 300 AND agritrust_score <= 900),
    CONSTRAINT chk_credit_limit_range CHECK (safe_credit_min <= safe_credit_max)
);

CREATE INDEX IF NOT EXISTS ix_credit_passports_passport_id ON credit_passports (passport_id);
CREATE INDEX IF NOT EXISTS ix_credit_passports_farmer_id ON credit_passports (farmer_id);
CREATE INDEX IF NOT EXISTS ix_credit_passports_agritrust_score ON credit_passports (agritrust_score);

-- -----------------------------------------------------------------------------
-- 8. Data Consents (Stage 5 Sovereign Farmer Consent)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_consents (
    consent_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE RESTRICT,
    lender_id UUID NOT NULL REFERENCES lenders(lender_id) ON DELETE RESTRICT,
    shared_attributes VARCHAR[] NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS ix_data_consents_consent_id ON data_consents (consent_id);
CREATE INDEX IF NOT EXISTS ix_data_consents_farmer_id ON data_consents (farmer_id);
CREATE INDEX IF NOT EXISTS ix_data_consents_lender_id ON data_consents (lender_id);
CREATE INDEX IF NOT EXISTS ix_data_consents_is_active ON data_consents (is_active);

-- -----------------------------------------------------------------------------
-- 9. Insurance Records (PM Fasal Bima Yojana / PMFBY)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS insurance_records (
    insurance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES farmers(farmer_id) ON DELETE RESTRICT,
    scheme_name VARCHAR(255) NOT NULL,
    season VARCHAR(50) NOT NULL,
    premium_paid NUMERIC(10, 2) NOT NULL,
    claim_amount NUMERIC(10, 2) DEFAULT 0.0 NOT NULL,
    claim_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_insurance_records_insurance_id ON insurance_records (insurance_id);
CREATE INDEX IF NOT EXISTS ix_insurance_records_farmer_id ON insurance_records (farmer_id);
CREATE INDEX IF NOT EXISTS ix_insurance_records_scheme_name ON insurance_records (scheme_name);
CREATE INDEX IF NOT EXISTS ix_insurance_records_claim_status ON insurance_records (claim_status);

-- Mark migration in alembic_version table
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL PRIMARY KEY
);
INSERT INTO alembic_version (version_num)
VALUES ('001_initial_schema')
ON CONFLICT (version_num) DO NOTHING;
