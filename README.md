# Sanjeevani

> **Agricultural Credit Intelligence Platform** connecting smallholder farmers, Farmer Producer Organizations (FPOs), and institutional agricultural lenders via remote sensing, alternative agronomic data, and cryptographic consent.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16_+_PostGIS-336791.svg?logo=postgresql&logoColor=white)](https://postgis.net/)
[![Redis](https://img.shields.io/badge/Queue-Redis_7-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![React](https://img.shields.io/badge/Frontend-React_PWA_+_Vite-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![ML](https://img.shields.io/badge/ML-XGBoost_|_LightGBM_|_RF_|_ARIMA-FF6F00.svg)](https://xgboost.readthedocs.io/)
[![MLflow](https://img.shields.io/badge/Tracking-MLflow-0194E2.svg?logo=mlflow&logoColor=white)](https://mlflow.org/)

---

## 1. High-Level Architecture Flow

The Sanjeevani platform operates across a synchronized 5-tier pipeline:

```
[ 1. Data Ingestion ] ──────► [ 2. Data Lake & PostGIS ] ──────► [ 3. ML Scoring Engine ]
   • Sentinel-2 Multispectral      • PostgreSQL 16 + PostGIS          • Random Forest Baseline
   • IMD Rainfall & Weather        • 4326 Polygon Boundaries         • XGBoost & LightGBM Trees
   • Mandi APMC Price Feeds        • Redis Feature Cache             • Statsmodels ARIMA Yield
   • FPO Harvest Weigh Logs                                          • MLflow Run Tracking
                                                                              │
                                                                              ▼
[ 5. Frontends & Client Apps ] ◄──────────────────────────────── [ 4. Consent API Layer ]
   • Farmer PWA (Offline-First)                                       • FastAPI Backend
   • FPO Portal (Cluster Admin)                                       • OAuth2 / JWT Auth
   • Lender Dashboard (Underwriting)                                  • Stage 5 Consent Tokens
```

### Pipeline Progression:
1. **Data Ingestion**: Ingests Sentinel-2 satellite imagery, local weather telemetry, and FPO daily harvest logs.
2. **Data Lake & Spatial Store**: PostGIS stores precise spatial plot polygons (`GEOMETRY(Polygon, 4326)`) alongside tabular history.
3. **ML Scoring Engine**: Extracted agronomic vectors (NDVI vegetation index, NDWI soil moisture, yield variance) are processed by an ensemble of Random Forest, XGBoost, and LightGBM models, with statsmodels ARIMA projecting future seasonal harvest yields.
4. **Consent API Layer (FastAPI)**: Implements our **Stage 5 Cryptographic Consent Token Architecture**. Farmers retain complete sovereignty over their data: lenders can only access credit intelligence if the farmer grants a signed, scoped token.
5. **Frontends**:
   - **Farmer PWA**: Mobile-first, installable Progressive Web App with offline service worker caching.
   - **FPO Portal**: Web dashboard for aggregating farmer clusters, managing harvest receipts, and tracking group loan eligibility.
   - **Lender Dashboard**: Institutional underwriting terminal for Banks (e.g. SBI) to verify consent tokens, inspect PostGIS plot boundary overlays, and approve credit applications.

---

## 2. Monorepo Structure

```
.
├── backend/                        # FastAPI REST API Layer
│   ├── app/
│   │   ├── api/v1/                 # Endpoints: /health, /auth, /consent
│   │   ├── core/                   # Config & security (JWT, HMAC consent)
│   │   ├── db/                     # SQLAlchemy session & PostGIS probe
│   │   └── main.py                 # FastAPI application entrypoint
│   ├── tests/                      # Automated test suite (health, consent)
│   ├── requirements.txt            # Python dependencies
│   └── Dockerfile                  # GDAL/GEOS-enabled container
│
├── ml-engine/                      # Machine Learning & Time-Series Engine
│   ├── pipelines/
│   │   ├── feature_store.py        # Agronomic feature schemas (NDVI/NDWI)
│   │   ├── credit_scoring.py       # RF, XGBoost, LightGBM ensemble
│   │   └── yield_forecasting.py    # statsmodels ARIMA time-series
│   ├── tracking/                   # MLflow tracking configuration
│   ├── worker.py                   # Async job runner daemon & smoke test
│   ├── requirements.txt            # ML dependencies
│   └── Dockerfile                  # ML worker container
│
├── packages/
│   └── shared-ui/                  # Shared Component & Design System
│       ├── src/
│       │   ├── components/         # Button, Card, Badge, StatWidget, ConsentBadge, Header
│       │   └── styles/tokens.css   # Agritech Emerald & Fintech Slate theme
│       └── package.json
│
├── frontend-farmer-pwa/            # React PWA (Installable, Mobile-First, Offline-Ready)
│   ├── public/                     # manifest.json, sw.js (Service Worker)
│   ├── src/App.jsx                 # Mobile credit score gauge, farm passbook, consent grant
│   └── package.json                # Runs on :3000
│
├── frontend-fpo-portal/            # FPO Cluster Management Portal
│   ├── src/App.jsx                 # Member aggregation, credit roster, batch analytics
│   └── package.json                # Runs on :3001
│
├── frontend-lender-dashboard/      # Bank Underwriting & Risk Terminal
│   ├── src/App.jsx                 # PostGIS polygon visualizer, Stage 5 consent verifier
│   └── package.json                # Runs on :3002
│
├── infra/                          # Infrastructure & Initialization
│   ├── docker/
│   │   ├── init-postgis.sql        # PostGIS extension & spatial schema
│   │   └── redis.conf              # Redis configuration
│   └── .env.docker
│
├── docs/                           # Technical Specifications
│   ├── ARCHITECTURE.md             # In-depth architectural design
│   ├── CONSENT_MECHANISM.md        # Stage 5 Consent Token Protocol
│   └── API_SPEC.md                 # REST API reference
│
├── docker-compose.yml              # Local multi-container dev stack
├── package.json                    # Monorepo npm workspaces configuration
└── README.md                       # Project overview & quickstart
```

---

## 3. Quickstart Guide

### Option A: Docker Compose (Full Stack)

Ensure Docker Desktop is running, then execute:

```bash
# Spin up PostgreSQL+PostGIS, Redis, and FastAPI backend
docker compose up --build
```

- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL + PostGIS**: `localhost:5432` (`kisancred_db`)
- **Redis Broker**: `localhost:6379`

---

### Option B: Local Development (Without Docker)

#### 1. Backend API
```bash
# In project root or /backend:
.\venv\Scripts\activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Run backend automated tests:
```bash
$env:PYTHONPATH="backend"
python -m unittest backend/tests/test_health.py
```

#### 2. ML Scoring Engine
```bash
$env:PYTHONPATH="ml-engine"
python ml-engine/worker.py --test
```

#### 3. Frontend Applications
Install all workspace dependencies once:
```bash
npm install
```

Launch applications:
```bash
# 1. Farmer PWA (port 3000)
npm run dev:farmer

# 2. FPO Portal (port 3001)
npm run dev:fpo

# 3. Lender Dashboard (port 3002)
npm run dev:lender
```

Or build all frontends simultaneously:
```bash
npm run build
```

---

## 4. Health Check & Core Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | `GET` | Overall platform health, DB & Redis connectivity |
| `/api/v1/health` | `GET` | Detailed component health and platform version |
| `/api/v1/auth/login` | `POST` | Multi-tenant authentication token (Farmer, FPO, Lender) |
| `/api/v1/auth/me` | `GET` | Current user profile |
| `/api/v1/consent/grant` | `POST` | Farmer issues cryptographically signed consent token |
| `/api/v1/consent/verify` | `POST` | Lender verifies token authenticity and granted scopes |

---

## 5. Stage 5 Consent Architecture

KisanCred introduces cryptographically signed, farmer-issued consent grants. When an underwriter attempts to view a farmer's credit telemetry or satellite NDVI data, the backend enforces signature verification:

```json
{
  "consent_token": "cns_fe508e5cb8eb.a8486d84f15382f9",
  "requested_scope": "credit_score"
}
```

If the farmer has not granted that scope or if the token has expired/been revoked, access is blocked at the gateway. See [docs/CONSENT_MECHANISM.md](docs/CONSENT_MECHANISM.md) for details.
