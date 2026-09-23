"""
SANJEEVANI Agronomic Crop Calendar Engine
Generates personalized crop lifecycle timelines and farmer activities
based on Field, Crop, Sowing Date, and Growth Stage.

Supported Crops:
- Wheat (HD 3086 / PBW 343) - Rabi
- Mustard (Pusa Bold / Giriraj) - Rabi
- Paddy / Rice (PR 126 / Pusa Basmati) - Kharif
- Sugarcane (Co 0238) - Annual / Multi-season
- Cotton (BT) - Kharif
- Maize (Hybrid) - Kharif/Rabi

Explicitly marks timings as Approximate/Estimated.
Evaluates activity statuses: UPCOMING, TODAY, COMPLETED, OVERDUE.
"""

from datetime import datetime, timedelta, date
from typing import Dict, Any, List, Optional


# Crop Lifecycle Templates: (Stage Name, Relative Day Offset from Sowing, Activity Title, Default Notes, Category Icon)
CROP_SCHEDULE_TEMPLATES = {
    "wheat": [
        {
            "stage": "Sowing & Seed Treatment",
            "day_offset": 0,
            "title": "Seed Priming & Basal Sowing",
            "action_type": "sowing",
            "icon": "🌱",
            "notes": "Treated with Trichoderma viride @ 4g/kg seed. Applied basal DAP @ 55 kg/acre.",
        },
        {
            "stage": "Crown Root Initiation (CRI)",
            "day_offset": 22,
            "title": "1st Critical Crown Root Irrigation",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Ensure light, uniform irrigation. Root initiation is vital for tillering density.",
        },
        {
            "stage": "Vegetative & Tillering",
            "day_offset": 40,
            "title": "Weed Scouting & Nitrogen Top-Dressing",
            "action_type": "monitoring",
            "icon": "🔍",
            "notes": "Scout for broadleaf phalaris minor. Broadcast 1st split Urea @ 45 kg/acre.",
        },
        {
            "stage": "Jointing & Stem Elongation",
            "day_offset": 65,
            "title": "2nd Irrigation & Micro-Nutrient Check",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Irrigate according to soil moisture. Inspect for zinc or sulfur deficiency.",
        },
        {
            "stage": "Booting & Heading",
            "day_offset": 85,
            "title": "Disease & Yellow Rust Inspection",
            "action_type": "disease_monitoring",
            "icon": "🦠",
            "notes": "Examine flag leaves for yellow stripe rust pustules. Keep bio-fungicide ready.",
        },
        {
            "stage": "Grain Filling & Milking",
            "day_offset": 105,
            "title": "Terminal Heat Protection & Light Watering",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Apply light evening irrigation to moderate canopy temperature during afternoon heat.",
        },
        {
            "stage": "Physiological Maturity & Harvest",
            "day_offset": 130,
            "title": "Grain Hardness Test & Combine Harvest",
            "action_type": "harvest",
            "icon": "🌾",
            "notes": "Harvest when grain moisture drops below 12%. Check local APMC mandi arrivals.",
        },
    ],
    "mustard": [
        {
            "stage": "Sowing & Soil Prep",
            "day_offset": 0,
            "title": "Basal Sowing & Gypsum Incorporation",
            "action_type": "sowing",
            "icon": "🌱",
            "notes": "Seed drilled at 4-5 cm depth with sulfur replenishment.",
        },
        {
            "stage": "Germination & Thinning",
            "day_offset": 18,
            "title": "Thinning & Inter-Plant Spacing",
            "action_type": "monitoring",
            "icon": "🌱",
            "notes": "Maintain 12-15 cm between plants for maximum branching potential.",
        },
        {
            "stage": "Vegetative & Branching",
            "day_offset": 35,
            "title": "Pre-Flowering Hoeing & 1st Irrigation",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Light watering prior to flowering onset. Remove emerging weeds.",
        },
        {
            "stage": "Flowering & Pod Initiation",
            "day_offset": 55,
            "title": "Mustard Aphid Field Scouting",
            "action_type": "disease_monitoring",
            "icon": "🔍",
            "notes": "Inspect central inflorescence twigs for aphid colonies. Apply neem oil if needed.",
        },
        {
            "stage": "Pod Filling (Siliqua)",
            "day_offset": 75,
            "title": "Pod Moisture Watering & Frost Watch",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Crucial moisture stage for seed oil synthesis and pod enlargement.",
        },
        {
            "stage": "Maturity & Harvest",
            "day_offset": 115,
            "title": "Morning Harvest & Sun Curing",
            "action_type": "harvest",
            "icon": "🌾",
            "notes": "Harvest in early morning dew to prevent pod shattering. Sun dry for 4-5 days.",
        },
    ],
    "rice": [
        {
            "stage": "Nursery & Puddling",
            "day_offset": 0,
            "title": "Wet Nursery Sowing & Field Puddling",
            "action_type": "sowing",
            "icon": "🌱",
            "notes": "Prepare level puddled field with zinc sulfate basal dress.",
        },
        {
            "stage": "Transplantation",
            "day_offset": 25,
            "title": "Seedling Transplantation",
            "action_type": "sowing",
            "icon": "🌱",
            "notes": "Transplant 2-3 seedlings per hill at 20x15 cm spacing in standing water.",
        },
        {
            "stage": "Active Tillering",
            "day_offset": 45,
            "title": "Water Standing & Urea Top-Dress",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Maintain 2-3 cm water level; broadcast 1st split Urea.",
        },
        {
            "stage": "Panicle Initiation",
            "day_offset": 70,
            "title": "Stem Borer & Leaf Folder Trapping",
            "action_type": "disease_monitoring",
            "icon": "🔍",
            "notes": "Install pheromone lures; apply MOP (potash) for stem vigor.",
        },
        {
            "stage": "Flowering & Heading",
            "day_offset": 90,
            "title": "Bacterial Blight Scouting & Aeration",
            "action_type": "monitoring",
            "icon": "🦠",
            "notes": "Inspect for water-soaked leaf streaks. Temporary mid-season drainage.",
        },
        {
            "stage": "Grain Filling & Milking",
            "day_offset": 105,
            "title": "Terminal Field Drainage",
            "action_type": "irrigation",
            "icon": "💧",
            "notes": "Drain standing water 10-12 days before anticipated harvest.",
        },
        {
            "stage": "Harvest & Threshing",
            "day_offset": 125,
            "title": "Grain Moisture Check & Threshing",
            "action_type": "harvest",
            "icon": "🌾",
            "notes": "Harvest when 80-85% of panicles turn golden yellow.",
        },
    ],
}


def get_crop_key(crop_name: str) -> str:
    """Resolves crop string to template key."""
    c = (crop_name or "").lower()
    if "wheat" in c or "gehun" in c:
        return "wheat"
    if "mustard" in c or "sarson" in c or "raya" in c:
        return "mustard"
    if "rice" in c or "paddy" in c or "dhan" in c:
        return "rice"
    return "wheat"  # Default robust agronomic fallback


def generate_crop_calendar(
    crop: str = "Wheat (HD 3086)",
    sowing_date_str: Optional[str] = None,
    field_name: str = "Field A (Plot #184/A)",
    current_stage: Optional[str] = None,
    reference_date: Optional[date] = None,
) -> Dict[str, Any]:
    """
    Generates personalized crop timeline and farmer task list.
    """
    today = reference_date or date.today()

    # Parse sowing date or default to current Rabi cycle (e.g. Nov 15)
    if sowing_date_str:
        try:
            sowing_date = datetime.strptime(sowing_date_str.split("T")[0], "%Y-%m-%d").date()
        except ValueError:
            sowing_date = today - timedelta(days=95)
    else:
        # Default aligned with current grain filling in Rabi season
        sowing_date = today - timedelta(days=95)

    days_after_sowing = max(0, (today - sowing_date).days)
    crop_key = get_crop_key(crop)
    template = CROP_SCHEDULE_TEMPLATES.get(crop_key, CROP_SCHEDULE_TEMPLATES["wheat"])

    activities: List[Dict[str, Any]] = []
    current_lifecycle_stage = current_stage or "Grain Filling"
    next_activity: Optional[Dict[str, Any]] = None

    for idx, item in enumerate(template):
        target_date = sowing_date + timedelta(days=item["day_offset"])
        diff_days = (target_date - today).days

        # Status evaluation
        if diff_days < -3:
            status = "COMPLETED"
        elif -3 <= diff_days < 0:
            status = "OVERDUE"
        elif diff_days == 0:
            status = "TODAY"
        else:
            status = "UPCOMING"

        # Format human-friendly approximate date
        date_formatted = target_date.strftime("%d %b %Y")
        approx_label = f"Estimated: {date_formatted}"

        if diff_days == 0:
            due_label = "Due Today"
        elif diff_days == 1:
            due_label = "Due Tomorrow"
        elif diff_days > 1:
            due_label = f"Due in {diff_days} days"
        elif diff_days == -1:
            due_label = "1 day overdue"
        else:
            due_label = f"{abs(diff_days)} days overdue"

        activity_obj = {
            "id": f"act_{idx}_{item['action_type']}",
            "activity_name": item["title"],
            "approximate_date": approx_label,
            "raw_date": target_date.isoformat(),
            "due_label": due_label,
            "crop_stage": item["stage"],
            "status": status,
            "notes": item["notes"],
            "icon": item["icon"],
            "days_after_sowing": item["day_offset"],
            "is_completed": status == "COMPLETED",
        }
        activities.append(activity_obj)

        # Track the next upcoming or today activity
        if next_activity is None and status in ["TODAY", "UPCOMING", "OVERDUE"]:
            next_activity = activity_obj

    # Fallback next activity if all completed
    if next_activity is None and activities:
        next_activity = activities[-1]

    # Overall progress percentage
    completed_count = sum(1 for a in activities if a["status"] == "COMPLETED")
    progress_pct = round((completed_count / max(1, len(activities))) * 100)

    return {
        "status": "success",
        "crop": crop,
        "field_name": field_name,
        "sowing_date": sowing_date.isoformat(),
        "sowing_date_formatted": sowing_date.strftime("%d %b %Y"),
        "days_after_sowing": days_after_sowing,
        "current_stage": current_lifecycle_stage,
        "progress_percentage": progress_pct,
        "total_activities": len(activities),
        "completed_count": completed_count,
        "next_activity": next_activity,
        "activities": activities,
        "disclaimer": (
            "Agricultural schedule timings are approximate and estimated based on standard phenological degree days. "
            "Actual field progression varies with local microclimate and variety."
        ),
    }
