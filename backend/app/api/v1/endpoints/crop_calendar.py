"""
Personalized Crop Calendar API Endpoint
Provides personalized crop lifecycle stages, upcoming farm activities,
and farmer task management.
"""

from typing import Optional
from fastapi import APIRouter, Query
from app.engine.calendar_engine import generate_crop_calendar

router = APIRouter()


@router.get("", summary="Get Personalized Crop Lifecycle Calendar")
def get_crop_calendar(
    crop: str = Query(default="Wheat (HD 3086)", description="Cultivated crop name"),
    sowing_date: Optional[str] = Query(default=None, description="Sowing date (YYYY-MM-DD)"),
    field_name: str = Query(default="Field A (Plot #184/A)", description="Field or parcel name"),
    current_stage: Optional[str] = Query(default="Grain Filling", description="Current phenological crop stage"),
):
    """
    Returns personalized crop lifecycle timeline with upcoming farmer activities.
    All dates are explicitly approximate/estimated.
    """
    return generate_crop_calendar(
        crop=crop,
        sowing_date_str=sowing_date,
        field_name=field_name,
        current_stage=current_stage,
    )
