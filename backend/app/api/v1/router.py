"""API v1 master router."""

from fastapi import APIRouter
from app.api.v1.endpoints import (
    health, auth, consent, ingestion, credit, fpo, lender, demo,
    weather, mandi, warnings, crop_calendar, notifications, crop_doctor
)

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["System Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(consent.router, prefix="/consent", tags=["Stage 5 Consent Management"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["Data Ingestion Connectors"])
api_router.include_router(credit.router, tags=["Credit Intelligence & Passports"])
api_router.include_router(fpo.router, tags=["FPO Cooperative Intelligence"])
api_router.include_router(lender.router)
api_router.include_router(demo.router, prefix="/demo", tags=["Demonstration Showcase"])
api_router.include_router(weather.router, prefix="/weather", tags=["Weather Intelligence & Actions"])
api_router.include_router(mandi.router, prefix="/mandi", tags=["Mandi Price Intelligence"])
api_router.include_router(warnings.router, prefix="/warnings", tags=["Predictive Early-Warning System"])
api_router.include_router(crop_calendar.router, prefix="/crop-calendar", tags=["Personalized Crop Calendar"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Smart Notification Engine"])
api_router.include_router(crop_doctor.router, prefix="/crop-doctor", tags=["Crop Doctor AI Pathology"])
