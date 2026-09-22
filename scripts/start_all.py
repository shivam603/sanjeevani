#!/usr/bin/env python3
"""
Sanjeevani — Unified All-in-One Local Demonstration Launcher.

Starts and monitors all 4 core services in a single process:
1. FastAPI Backend & Ingestion Telemetry Engine (Port 8000)
2. Farmer-Facing Progressive Web App (Port 3000)
3. FPO Cooperative Administration Portal (Port 3001)
4. Institutional Lender Terminal (Port 3002)

Automatically launches your default web browser to the Sanjeevani
Demonstration Showcase Hub (http://localhost:8000/demo).
"""

import os
import sys
import time
import urllib.request
import subprocess
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent

# Detect virtualenv python if present, else fallback to sys.executable
venv_py = (ROOT_DIR / "venv" / "Scripts" / "python.exe") if sys.platform == "win32" else (ROOT_DIR / "venv" / "bin" / "python")
PYTHON_BIN = str(venv_py) if venv_py.exists() else sys.executable

SERVICES = [
    {
        "name": "Sanjeevani Core API & Ingestion Telemetry",
        "port": 8000,
        "url": "http://127.0.0.1:8000/health",
        "cmd": [PYTHON_BIN, "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000"],
        "cwd": str(ROOT_DIR),
    },
    {
        "name": "Farmer PWA (Offline-First Passbook)",
        "port": 3000,
        "url": "http://127.0.0.1:3000/",
        "cmd": ["npm", "run", "preview", "--", "--port", "3000", "--host", "::"],
        "cwd": str(ROOT_DIR / "frontend-farmer-pwa"),
    },
    {
        "name": "FPO Cooperative Portal",
        "port": 3001,
        "url": "http://127.0.0.1:3001/",
        "cmd": ["npm", "run", "preview", "--", "--port", "3001", "--host", "::"],
        "cwd": str(ROOT_DIR / "frontend-fpo-portal"),
    },
    {
        "name": "Institutional Lender Terminal",
        "port": 3002,
        "url": "http://127.0.0.1:3002/",
        "cmd": ["npm", "run", "preview", "--", "--port", "3002", "--host", "::"],
        "cwd": str(ROOT_DIR / "frontend-lender-dashboard"),
    },
]


if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def check_port_live(url: str, timeout: float = 1.5) -> bool:
    """Check if a service URL responds with 200."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SanjeevaniLauncher/1.0"})
        with urllib.request.urlopen(req, timeout=timeout) as res:
            return res.status == 200
    except Exception:
        return False


def main():
    print("\n" + "=" * 76)
    print("   [SANJEEVANI] AGRICULTURAL CREDIT INTELLIGENCE PLATFORM")
    print("   All-in-One Unified Demonstration Launcher & Runtime Monitor")
    print("=" * 76 + "\n")

    spawned_processes = []

    for svc in SERVICES:
        name = svc["name"]
        port = svc["port"]
        url = svc["url"]

        if check_port_live(url):
            print(f"  [ALREADY RUNNING] {name} is active on port {port}")
        else:
            print(f"  [STARTING] Launching {name} on port {port}...")
            p = subprocess.Popen(
                svc["cmd"],
                cwd=svc["cwd"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                shell=(sys.platform == "win32" and svc["cmd"][0] == "npm"),
            )
            spawned_processes.append((svc, p))

    # Wait for all services to become healthy
    print("\n  [VERIFYING] Probing all 4 service endpoints...")
    all_ready = False
    start_wait = time.time()
    while time.time() - start_wait < 25:
        statuses = [check_port_live(s["url"]) for s in SERVICES]
        if all(statuses):
            all_ready = True
            break
        time.sleep(1)

    if not all_ready:
        print("  [WARN] Some services took longer than expected to report healthy.")
    else:
        print("  [HEALTHY] All 4 Sanjeevani services verified operational (HTTP 200)!\n")

    print("=" * 76)
    print("   SANJEEVANI LIVE INTERFACES DIRECTORY")
    print("=" * 76)
    print("   [*] Master Demonstration Hub:     http://localhost:8000/demo")
    print("   [1] Farmer Mobile Passbook (PWA): http://localhost:3000/")
    print("   [2] FPO Cooperative Portal:       http://localhost:3001/")
    print("   [3] Institutional Lender Terminal:http://localhost:3002/")
    print("   [4] Ingestion Freshness Admin:    http://localhost:8000/api/v1/health/ingestion-dashboard")
    print("   [5] FastAPI Swagger API Docs:     http://localhost:8000/docs")
    print("=" * 76 + "\n")

    # Launch browser automatically to the master showcase hub
    print("  [BROWSER] Launching Master Showcase Hub: http://localhost:8000/demo\n")
    try:
        webbrowser.open("http://localhost:8000/demo")
    except Exception:
        pass

    if "--no-wait" in sys.argv:
        return

    print("  Press Ctrl+C at any time to shut down the Sanjeevani platform.\n")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n  [SHUTDOWN] Terminating spawned services...")
        for _, p in spawned_processes:
            p.terminate()
        print("  [DONE] Sanjeevani runtime stopped gracefully.\n")


if __name__ == "__main__":
    main()
