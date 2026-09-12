# 🚀 Deploying Sanjeevani on Render (Render.com Guide)

This guide provides step-by-step instructions for deploying both the **FastAPI backend** and all **three React frontends** (Farmer PWA, FPO Portal, Lender Terminal) on [Render](https://render.com).

---

## 🏗️ Deployment Architecture Options

You can choose either of two deployment methods:

| Method | Best For | Services Created | Cost on Render |
|---|---|---|---|
| **Option A: Render Blueprint (`render.yaml`)** ⭐ *Recommended* | Production microservices & global CDN delivery | 1 Web Service + 3 Static Sites | Free (Static Sites are 100% free; Web Service on free tier) |
| **Option B: Unified Single Web Service** | Simple single-URL evaluation on free tier | 1 Web Service (Serves API + all 3 frontends) | 100% Free Tier friendly (Uses only 1 service slot) |

---

## 🌟 Option A: 1-Click Render Blueprint (Recommended)

The repository includes a pre-configured [`render.yaml`](./render.yaml) file. Render automatically parses this file to configure and link all 4 services.

### Step 1: Push Repository to GitHub
Ensure your latest changes are pushed to your GitHub repository:
```bash
git push origin main
```
Repository: `https://github.com/shivam603/sanjeevani`

### Step 2: Create Blueprint Instance on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. In the top navigation, click **"Blueprints"** (or click **"New +"** &rarr; **"Blueprint"**).
3. Connect your GitHub account and select your repository: **`shivam603/sanjeevani`**.
4. Render will detect `render.yaml` and display the 4 services:
   - ⚙️ **`sanjeevani-backend`** (Python Web Service)
   - 🌱 **`sanjeevani-farmer-pwa`** (Static Site & PWA)
   - 🌾 **`sanjeevani-fpo-portal`** (Static Site)
   - 🏛️ **`sanjeevani-lender-dashboard`** (Static Site)
5. Click **"Apply"**.
6. Render will automatically build and deploy all services in parallel.

### Step 3: Access Your Live Apps
Once deployed, you will receive individual global URLs:
- **FastAPI Core & Swagger Docs**: `https://sanjeevani-backend.onrender.com/docs`
- **Master Demonstration Hub**: `https://sanjeevani-backend.onrender.com/demo`
- **Farmer Sovereign Passbook**: `https://sanjeevani-farmer-pwa.onrender.com`
- **FPO Cooperative Hub**: `https://sanjeevani-fpo-portal.onrender.com`
- **Lender Underwriting Terminal**: `https://sanjeevani-lender-dashboard.onrender.com`

---

## ⚡ Option B: Unified Single Web Service (Single URL)

If you prefer to deploy everything under **one single Render Web Service** to conserve your free-tier service quota:

### Step 1: Create a New Web Service
1. In the Render Dashboard, click **"New +"** &rarr; **"Web Service"**.
2. Connect the **`shivam603/sanjeevani`** repository.
3. Configure the following settings:

| Setting | Value |
|---|---|
| **Name** | `sanjeevani` |
| **Language / Runtime** | `Python 3` |
| **Region** | Oregon (US West) or Frankfurt |
| **Branch** | `main` |
| **Root Directory** | *(Leave blank - root of repo)* |
| **Build Command** | `chmod +x ./render_build.sh && ./render_build.sh` |
| **Start Command** | `python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` |

### Step 2: Set Environment Variables
Under the **"Environment Variables"** tab, add:
- `PYTHON_VERSION`: `3.11.9`
- `ENVIRONMENT`: `production`
- `DEBUG`: `false`
- `DATABASE_URL`: `sqlite:///./sanjeevani.db`

### Step 3: Click "Create Web Service"
The unified build script (`./render_build.sh`) will:
1. Install backend dependencies.
2. Compile the Farmer PWA (`/dist`), FPO Portal (`/dist`), and Lender Dashboard (`/dist`).
3. Start FastAPI, which automatically mounts the static frontends.

### Unified Service Routes:
- `https://your-service.onrender.com/` &rarr; Master Demonstration Showcase
- `https://your-service.onrender.com/farmer` &rarr; Farmer Sovereign Passbook
- `https://your-service.onrender.com/fpo` &rarr; FPO Cooperative Hub
- `https://your-service.onrender.com/lender` &rarr; Lender Underwriting Terminal
- `https://your-service.onrender.com/docs` &rarr; Interactive Swagger OpenAPI Documentation
- `https://your-service.onrender.com/health` &rarr; Service Liveness Probe

---

## 🔧 Environment Variables Reference

| Variable | Required | Description | Default |
|---|---|---|---|
| `PORT` | Auto | Assigned automatically by Render's routing proxy | `10000` |
| `PYTHON_VERSION` | Yes | Python runtime version | `3.11.9` |
| `ENVIRONMENT` | Optional | Deployment stage (`production`, `staging`, `development`) | `production` |
| `DATABASE_URL` | Optional | SQLite or Render PostgreSQL database connection string | `sqlite:///./sanjeevani.db` |
| `VITE_API_BASE_URL` | Optional | Backend URL passed to frontend builds | Auto-linked in `render.yaml` |

---

## 💡 Key Features of this Setup

1. **Zero CORS Issues**: Backend automatically handles origin regex matching any `*.onrender.com` domain with credential support.
2. **Instant PWA Support**: The Farmer PWA service worker and manifest work out of the box on Render's HTTPS CDN.
3. **Multi-Language Persistence**: English, Hindi, Marathi, and Tamil language selections persist in local storage across browser refreshes.
4. **Resilient Local Fallbacks**: Even if the backend free-tier service takes a few seconds to spin up from sleep, all 3 frontends include built-in fallback data so the demo never crashes.
