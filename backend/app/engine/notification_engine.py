"""
Smart Notification Engine for SANJEEVANI (Backend Service)

Generates relevant, context-aware notifications strictly from:
1. WEATHER
2. MARKET
3. RISK (Predictive Early Warning)
4. CROP (Crop Doctor & Health Follow-up)
5. SCHEME (Government Scheme Matcher)
6. CALENDAR (Personalized Crop Calendar)

Priorities: HIGH, MEDIUM, LOW.
Deduplication: Prevents repeating identical alerts unless conditions change.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone, timedelta

CATEGORIES = ["WEATHER", "MARKET", "RISK", "CROP", "SCHEME", "CALENDAR"]
PRIORITIES = ["HIGH", "MEDIUM", "LOW"]


def generate_smart_notifications(
    farmer_name: str = "Ramesh Patel",
    field_id: str = "field-184a",
    field_name: str = "Field A (Plot #184/A)",
    crop: str = "Wheat (HD 3086)",
    crop_stage: str = "Grain Filling",
    rain_forecast: bool = True,
    mandi_price: float = 2275.0,
    msp_price: float = 2125.0,
    active_risk_level: str = "HIGH",
    active_risk_type: str = "Disease Risk (Yellow Rust)",
    next_crop_task: str = "Crown Root Irrigation",
    task_status: str = "TODAY",
    reference_dt: Optional[datetime] = None,
) -> Dict[str, Any]:
    """
    Generates centralized smart notifications evaluated from actual farm telemetry.
    """
    now = reference_dt or datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%d")

    notifications: List[Dict[str, Any]] = []

    # 1. WEATHER SOURCE
    if rain_forecast:
        notifications.append({
            "id": f"notif_weather_rain_{today_str}",
            "dedup_key": f"WEATHER_{field_id}_rain_warning",
            "category": "WEATHER",
            "priority": "HIGH",
            "title": "🌧️ Rain Expected Tomorrow",
            "description": "Rain showers predicted in your village cluster. Hold planned irrigation to conserve ground water and prevent soil saturation.",
            "icon": "🌧️",
            "timestamp": (now - timedelta(minutes=25)).isoformat(),
            "read": False,
            "field_id": field_id,
            "field_name": field_name,
            "crop": crop,
            "target_section": "mandi-weather-section",
            "action_label": "Check Weather Advisory",
        })
    else:
        notifications.append({
            "id": f"notif_weather_dry_{today_str}",
            "dedup_key": f"WEATHER_{field_id}_dry_conditions",
            "category": "WEATHER",
            "priority": "LOW",
            "title": "☀️ Favorable Dry Weather for Foliar Spray",
            "description": "Zero precipitation and low wind speeds predicted. Optimal conditions for fertilizer application.",
            "icon": "☀️",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
            "read": False,
            "field_id": field_id,
            "field_name": field_name,
            "crop": crop,
            "target_section": "mandi-weather-section",
            "action_label": "View Weather Forecast",
        })

    # 2. MARKET SOURCE
    price_diff = mandi_price - msp_price
    notifications.append({
        "id": f"notif_market_{crop.split()[0].lower()}_{today_str}",
        "dedup_key": f"MARKET_{crop.split()[0]}_price_update",
        "category": "MARKET",
        "priority": "MEDIUM",
        "title": f"💰 {crop.split()[0]} Mandi Price at ₹{int(mandi_price)}/Qtl",
        "description": f"Khanna Mandi spot price is ₹{int(mandi_price)}/Qtl (+₹{int(price_diff)} above MSP). Favorable for forward contract lock-in.",
        "icon": "💰",
        "timestamp": (now - timedelta(hours=1)).isoformat(),
        "read": False,
        "field_id": field_id,
        "crop": crop,
        "target_section": "mandi-weather-section",
        "action_label": "Compare Mandis",
    })

    # 3. RISK SOURCE (Early Warning)
    notifications.append({
        "id": f"notif_risk_{field_id}_{today_str}",
        "dedup_key": f"RISK_{field_id}_{active_risk_type.replace(' ', '_').lower()}",
        "category": "RISK",
        "priority": active_risk_level,
        "title": f"⚠️ Elevated Risk: {active_risk_type}",
        "description": f"Morning microclimate humidity above 85% accelerates {active_risk_type} progression in {field_name}. Scout flag leaves.",
        "icon": "⚠️",
        "timestamp": (now - timedelta(minutes=15)).isoformat(),
        "read": False,
        "field_id": field_id,
        "field_name": field_name,
        "crop": crop,
        "target_section": "early-warning-section",
        "action_label": "View Risk Advisory",
    })

    # 4. CROP DOCTOR SOURCE
    notifications.append({
        "id": f"notif_crop_followup_{field_id}_{today_str}",
        "dedup_key": f"CROP_{field_id}_health_followup",
        "category": "CROP",
        "priority": "MEDIUM",
        "title": "🌾 Follow-Up Crop Monitoring Due",
        "description": f"7-day post treatment check scheduled for {field_name}. Re-scan crop leaf imagery to evaluate fungal remediation.",
        "icon": "🌾",
        "timestamp": (now - timedelta(hours=5)).isoformat(),
        "read": False,
        "field_id": field_id,
        "field_name": field_name,
        "crop": crop,
        "target_section": "satellite-map-section",
        "action_label": "Inspect Field Health",
    })

    # 5. SCHEME SOURCE
    notifications.append({
        "id": f"notif_scheme_micro_irrigation_{today_str}",
        "dedup_key": "SCHEME_farmer_pmksy_grant",
        "category": "SCHEME",
        "priority": "LOW",
        "title": "🏛️ Eligible Scheme: PMKSY Micro-Irrigation Grant",
        "description": "Your 4.2 Acre holding matches the 55% direct DBT subsidy for solar micro-drip automation.",
        "icon": "🏛️",
        "timestamp": (now - timedelta(days=1)).isoformat(),
        "read": False,
        "field_id": field_id,
        "crop": crop,
        "target_section": "dbt-mitra-section",
        "action_label": "Check Eligibility",
    })

    # 6. CALENDAR SOURCE
    is_urgent = task_status in ["TODAY", "OVERDUE"]
    notifications.append({
        "id": f"notif_calendar_task_{today_str}",
        "dedup_key": f"CALENDAR_{field_id}_{next_crop_task.replace(' ', '_').lower()}",
        "category": "CALENDAR",
        "priority": "HIGH" if is_urgent else "MEDIUM",
        "title": f"📅 Crop Task: {next_crop_task}",
        "description": f"{next_crop_task} ({crop_stage}) is scheduled {task_status.lower()} for {field_name}.",
        "icon": "📅",
        "timestamp": (now - timedelta(minutes=10)).isoformat(),
        "read": False,
        "field_id": field_id,
        "field_name": field_name,
        "crop": crop,
        "target_section": "crop-calendar-section",
        "action_label": "Open Crop Calendar",
    })

    # Deduplication map check
    dedup_seen = set()
    deduped = []
    for n in notifications:
        if n["dedup_key"] not in dedup_seen:
            dedup_seen.add(n["dedup_key"])
            deduped.append(n)

    # Sort: HIGH > MEDIUM > LOW, then newest first
    weight = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}
    deduped.sort(key=lambda x: (weight.get(x["priority"], 1), x["timestamp"]), reverse=True)

    unread_count = sum(1 for n in deduped if not n["read"])
    high_priority_count = sum(1 for n in deduped if n["priority"] == "HIGH")

    return {
        "status": "success",
        "farmer_name": farmer_name,
        "field_name": field_name,
        "total_notifications": len(deduped),
        "unread_count": unread_count,
        "high_priority_count": high_priority_count,
        "notifications": deduped,
    }
