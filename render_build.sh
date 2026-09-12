#!/usr/bin/env bash
# ==============================================================================
# Render Unified Fullstack Build Script
# Builds all 3 frontends & installs backend dependencies for a single Web Service
# ==============================================================================

set -o errexit

echo "📦 1. Upgrading pip and installing Python backend dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "🌱 2. Building Farmer Sovereign Passbook PWA..."
npm --prefix frontend-farmer-pwa install
npm --prefix frontend-farmer-pwa run build

echo "🌾 3. Building FPO Cooperative Hub Portal..."
npm --prefix frontend-fpo-portal install
npm --prefix frontend-fpo-portal run build

echo "🏛️ 4. Building Institutional Lender Terminal..."
npm --prefix frontend-lender-dashboard install
npm --prefix frontend-lender-dashboard run build

echo "✅ All frontends built into dist/ and backend ready for launch!"
