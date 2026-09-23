"""
Smart Notification Engine API Endpoint
Provides centralized notifications for SANJEEVANI farmers.
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.engine.notification_engine import generate_smart_notifications

router = APIRouter()


@router.get("")
def get_notifications(
    farmer_name: str = Query("Ramesh Patel", description="Farmer name"),
    field_id: str = Query("field-184a", description="Field ID"),
    field_name: str = Query("Field A (Plot #184/A)", description="Field Name"),
    crop: str = Query("Wheat (HD 3086)", description="Crop name"),
    crop_stage: str = Query("Grain Filling", description="Crop Stage"),
    rain_forecast: bool = Query(True, description="Whether rain is forecasted"),
    category: Optional[str] = Query(None, description="Optional category filter (WEATHER, MARKET, RISK, CROP, SCHEME, CALENDAR)"),
    priority: Optional[str] = Query(None, description="Optional priority filter (HIGH, MEDIUM, LOW)"),
):
    """
    Returns prioritized, deduplicated notifications generated from actual farm context.
    """
    result = generate_smart_notifications(
        farmer_name=farmer_name,
        field_id=field_id,
        field_name=field_name,
        crop=crop,
        crop_stage=crop_stage,
        rain_forecast=rain_forecast,
    )

    notifications = result["notifications"]

    if category:
        notifications = [n for n in notifications if n["category"].upper() == category.upper()]

    if priority:
        notifications = [n for n in notifications if n["priority"].upper() == priority.upper()]

    result["notifications"] = notifications
    result["total_notifications"] = len(notifications)
    result["unread_count"] = sum(1 for n in notifications if not n["read"])
    result["high_priority_count"] = sum(1 for n in notifications if n["priority"] == "HIGH")

    return result
