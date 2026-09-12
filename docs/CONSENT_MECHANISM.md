# Stage 5 Consent Architecture — Cryptographic Token Protocol

## 1. Design Motivation
Agricultural credit underwriting often involves sensitive multi-source farmer data:
- Land ownership & survey numbers
- High-resolution satellite crop health (NDVI/NDWI)
- FPO harvest delivery quantities and Mandi bank transactions

Under Stage 5 architecture, **farmers maintain sovereign control over their data footprint**. Lenders cannot query a farmer's credit intelligence without presenting a valid, unexpired, and farmer-authorized **Consent Token**.

---

## 2. Consent Token Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (PWA)
    participant API as FastAPI Consent Service
    actor Lender as Bank Underwriter (Lender Portal)
    participant PostGIS as PostGIS & Feature Store

    Farmer->>API: POST /api/v1/consent/grant<br/>(farmer_id, lender_id, scopes, validity)
    Note over API: Generates HMAC-SHA256 signature<br/>over canonical payload
    API-->>Farmer: Returns Consent Token (e.g. cns_fe508...a8486...)
    Farmer->>Lender: Shares Token via QR / SMS / Link
    Lender->>API: POST /api/v1/consent/verify<br/>(token, requested_scope: 'credit_score')
    Note over API: Validates signature, expiry & active flag
    API-->>Lender: Verification Success (Scope Permitted)
    Lender->>API: GET /api/v1/farmers/{id}/credit-report (with token)
    API->>PostGIS: Fetch PostGIS polygon & scores
    API-->>Lender: Return authorized intelligence payload
```

---

## 3. Scopes & Permissions

| Scope Identifier | Data Permitted |
|---|---|
| `credit_score` | Overall credit score (300-900), rating tier, and default risk probability |
| `satellite_ndvi` | Sentinel-2 NDVI canopy index, moisture index, and anomaly flags |
| `yield_forecast` | ARIMA seasonal yield forecast and harvest volume history |
| `land_boundaries` | Raw PostGIS Survey Polygon coordinates and centroid coordinates |
| `bank_statements` | Financial transaction logs from verified Mandi sales |

---

## 4. Cryptographic Signature Formulation

The consent signature is computed via:
```python
signature = HMAC_SHA256(
    key = CONSENT_SECRET_KEY,
    message = JSON_CANONICAL({
        "farmer_id": farmer_id,
        "lender_entity_id": lender_entity_id,
        "scope": sorted(scope),
        "valid_from": valid_from_iso,
        "valid_until": valid_until_iso
    })
)
```
This guarantees non-repudiation and tamper prevention.
