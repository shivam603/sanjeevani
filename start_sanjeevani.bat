@echo off
title Sanjeevani - Agricultural Credit Intelligence Platform
echo ============================================================================
echo   Starting Sanjeevani Platform (API + 3 Portals + Ingestion Telemetry)
echo ============================================================================

if exist %~dp0venv\Scripts\python.exe (
    %~dp0venv\Scripts\python.exe %~dp0scripts\start_all.py %*
) else (
    python %~dp0scripts\start_all.py %*
)
