# KisanCred / AgriTrust — API Specification (v1)

Base URL: `http://localhost:8000/api/v1`  
OpenAPI / Swagger: `http://localhost:8000/docs`

---

## 1. System Health

### `GET /health`
Top-level platform health check for load balancers and container probes.

**Response:** `200 OK`
```json
{
  "status": "operational",
  "platform": "KisanCred / AgriTrust API",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-09-12T10:38:27.928414Z",
  "services": {
    "api": { "status": "operational", "debug": true },
    "database": { "status": "connected", "postgis_enabled": true, "postgis_version": "3.4 USE_GEOS=1..." },
    "redis": { "status": "connected", "ping": true }
  }
}
```

---

## 2. Authentication

### `POST /api/v1/auth/login`
Issue access token for Farmer, FPO admin, or Bank underwriter.

**Request:**
```json
{
  "phone_or_email": "+91-9876543210",
  "password_or_otp": "492019",
  "role": "farmer"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user_id": "usr_001928",
  "roles": ["farmer"]
}
```

---

## 3. Stage 5 Consent Architecture

### `POST /api/v1/consent/grant`
Farmer authorizes a lending institution to view scoped agronomic & credit telemetry.

**Request:**
```json
{
  "farmer_id": "farmer_mh_9021",
  "lender_entity_id": "bank_sbi_nashik_agri",
  "scope": ["credit_score", "satellite_ndvi", "yield_forecast"],
  "purpose": "Kisan Credit Card Loan Underwriting",
  "validity_days": 30
}
```

**Response:** `200 OK`
```json
{
  "consent_id": "cns_fe508e5cb8eb",
  "farmer_id": "farmer_mh_9021",
  "lender_entity_id": "bank_sbi_nashik_agri",
  "scope": ["credit_score", "satellite_ndvi", "yield_forecast"],
  "purpose": "Kisan Credit Card Loan Underwriting",
  "valid_from": "2026-09-12T10:38:27.941670Z",
  "valid_until": "2026-10-12T10:38:27.941670Z",
  "is_active": true,
  "signature": "a8486d84f15382f91a7743208c83188087a0d7d16477d120d936a80ff9abb737",
  "consent_token": "cns_fe508e5cb8eb.a8486d84f15382f9"
}
```

### `POST /api/v1/consent/verify`
Lender presents token to verify permission before pulling sensitive farmer data.

**Request:**
```json
{
  "consent_token": "cns_fe508e5cb8eb.a8486d84f15382f9",
  "requested_scope": "credit_score"
}
```

**Response:** `200 OK`
```json
{
  "is_valid": true,
  "farmer_id": "farmer_mh_9021",
  "lender_entity_id": "bank_sbi_nashik_agri",
  "scope_permitted": true,
  "message": "Consent verified successfully"
}
```
