# Sanjeevani — Single-FPO Pilot Deployment Guide

This guide details the operational procedure for deploying and running a single-FPO pilot of the **Sanjeevani** Agricultural Credit Intelligence Platform.

---

## 1. Pilot Architecture Topology

For the single-FPO pilot scale (1 FPO, 100–500 farmers, ~2,500 monitored cropland acres), the platform runs on a unified container stack using **Docker Compose**:

```
                                  [ Internet / Mobile Field ]
                                               │
                                               ▼
                         ┌───────────────────────────────────────────┐
                         │         REVERSE PROXY / INGRESS           │
                         └──────┬─────────────┬─────────────┬────────┘
                                │             │             │
                    Port 3000   │  Port 3001  │  Port 3002  │  Port 8000
                                ▼             ▼             ▼             ▼
                        ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
                        │Farmer PWA │ │FPO Portal │ │  Lender   │ │FastAPI API│
                        │(Offline)  │ │(Admin MIS)│ │ Terminal  │ │Backend    │
                        └───────────┘ └───────────┘ └───────────┘ └─────┬─────┘
                                                                        │
                                       ┌────────────────────────────────┤
                                       ▼                                ▼
                         ┌───────────────────────────┐    ┌───────────────────────────┐
                         │   PostgreSQL 16 + PostGIS │    │          Redis 7          │
                         │    (Cadastral Boundaries) │    │      (Queue & Cache)      │
                         └───────────────────────────┘    └─────────────┬─────────────┘
                                                                        │
                                                                        ▼
                                                          ┌───────────────────────────┐
                                                          │   ML Scoring Worker       │
                                                          │   (XGBoost / LightGBM)    │
                                                          └───────────────────────────┘
```

---

## 2. Host Requirements & Prerequisites

- **Host Machine / Cloud VM**:
  - Recommended instance: AWS `t3.xlarge` (4 vCPU, 16 GB RAM) or GCP `e2-standard-4`.
  - Operating System: Ubuntu 22.04 LTS / Debian 12 / Windows Server 2022.
  - Storage: 100 GB SSD (NVMe preferred for PostGIS spatial indexing).
- **Software Dependencies**:
  - Docker Engine >= 24.0.0
  - Docker Compose v2 >= 2.20.0
  - Python >= 3.11 (for running offline pilot onboarding CLI)

---

## 3. Environment Configuration (`.env`)

Create `.env` in the repository root:

```ini
# Platform Environment
ENVIRONMENT=production
DEBUG=false
PROJECT_NAME="Sanjeevani API"
VERSION=0.1.0

# Database (PostgreSQL 16 + PostGIS 3.4)
POSTGRES_USER=sanjeevani
POSTGRES_PASSWORD=sanjeevani_secure_pilot_password_2026
POSTGRES_DB=sanjeevani_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://sanjeevani:sanjeevani_secure_pilot_password_2026@postgres:5432/sanjeevani_db
SYNC_DATABASE_URL=postgresql://sanjeevani:sanjeevani_secure_pilot_password_2026@postgres:5432/sanjeevani_db

# Message Broker & Feature Cache
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

# Security & Sovereign Consent Secrets
JWT_SECRET_KEY=generate_with_openssl_rand_hex_32
CONSENT_SECRET_KEY=generate_master_hmac_sha256_key_for_consent_fabric
CONSENT_TOKEN_EXPIRY_DAYS=30

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002

# External Telemetry & LLM APIs (Optional overrides)
LLM_PROVIDER=mock
OPENAI_API_KEY=
WATSONX_API_KEY=
```

---

## 4. Step-by-Step Pilot Deployment

### Step 1: Start Container Services
```bash
docker compose up -d --build
```
Verify all containers are up and healthy:
```bash
docker compose ps
```

### Step 2: Apply Database Schema & Migrations
```bash
docker compose exec api alembic upgrade head
```

### Step 3: Run Pilot Onboarding Script (100–500 Farmers)
Run the pilot onboarding CLI to register the pilot FPO and smallholder farmer cohort:
```bash
docker compose exec api python scripts/pilot_onboard.py \
  --fpo-name "Sahyadri Farmers Cooperative Ltd." \
  --fpo-code "NSK-SAHYADRI-01" \
  --district "Nashik" \
  --state "Maharashtra" \
  --num-farmers 250
```

### Step 4: Run Multi-Source Ingestion Batch
Execute the 5 core ingestion pipelines:
```bash
docker compose exec api python -c "
from app.ingestion.tasks import run_ingestion_now
for src in ['LAND_GIS', 'REMOTE_SENSING', 'AGMARKNET', 'PMFBY', 'FPO_ERP']:
    res = run_ingestion_now(src)
    print(f'Connector [{src}]: Status={res[\"status\"]}, Rows={res[\"rows_ingested\"]}')
"
```

### Step 5: Verify Service Probes & Dashboards
- **Liveness Probe**: `curl http://localhost:8000/health` (Expect `status: healthy`)
- **Readiness Probe**: `curl http://localhost:8000/ready` (Expect `status: ready`)
- **Ingestion Freshness**: `curl http://localhost:8000/api/v1/health/ingestion-freshness`
- **Ingestion Admin Dashboard**: Open `http://localhost:8000/api/v1/health/ingestion-dashboard` in browser.
- **Farmer PWA**: `http://localhost:3000`
- **FPO Management Portal**: `http://localhost:3001`
- **Lender Underwriting Terminal**: `http://localhost:3002`

---

## 5. Enterprise Scaling Roadmap (Transitioning from Pilot)

When expanding from a single-FPO pilot to regional or national scale (100+ FPOs, 100,000+ farmers), the architecture must transition from Docker Compose to managed cloud infrastructure:

### A. Managed Database Transition
- **From**: Local PostgreSQL 16 container with local Docker volume.
- **To**: **AWS Aurora PostgreSQL / GCP Cloud SQL for PostgreSQL** with PostGIS extension:
  - Multi-AZ synchronous replication with automatic failover.
  - Read-replicas for analytical GIS spatial queries (`ST_Contains`, `ST_Intersects`).
  - Automated point-in-time recovery (PITR) and daily snapshot encryption.

### B. Container Orchestration (Kubernetes)
- **From**: Docker Compose on single VM.
- **To**: **AWS EKS / GCP GKE**:
  - Deploy FastAPI backend as a Kubernetes Deployment with **Horizontal Pod Autoscaling (HPA)** based on CPU/Memory and HTTP request rates.
  - Deploy Celery / Ingestion workers as independent worker pods with KEDA (Kubernetes Event-driven Autoscaling) triggered by Redis queue length.
  - Ingress Controller with SSL termination (cert-manager / Let's Encrypt) and AWS ALB / GCP Cloud Armor for DDoS and WAF protection.

### C. Sovereign Consent Key Management (HSM / KMS)
- **From**: Environment variable `CONSENT_SECRET_KEY`.
- **To**: **AWS KMS / Google Cloud KMS / HashiCorp Vault**:
  - Asymmetric key pairs (RSA 4096 / Ed25519) stored inside hardware security modules (FIPS 140-2 Level 3).
  - Time-bound consent signatures signed inside the HSM so private keys are never exposed in memory.

### D. Object Storage for Satellite Rasters
- **From**: Local `/data` directory.
- **To**: **Amazon S3 / Google Cloud Storage** with CloudFront/Cloud CDN for serving pre-rendered Sentinel-2 false-color NDVI tiles and drone orthomosaics.

---

## 6. Backup, Recovery & Rollback Runbook

### Database Backup
```bash
docker compose exec postgres pg_dump -U sanjeevani -d sanjeevani_db -Fc > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Database Restore
```bash
docker compose exec -T postgres pg_restore -U sanjeevani -d sanjeevani_db --clean < backup_filename.dump
```

### Application Rollback
To roll back to a previous container release:
```bash
git checkout <PREVIOUS_STABLE_TAG>
docker compose up -d --build
```
