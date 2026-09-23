"""
Predictive Early-Warning System API Endpoint
Evaluates multi-field agronomic risks:
- Heavy Rain Risk
- Heat Stress Risk
- Pest Risk
- Disease Risk
- Water Stress Risk
- Wind Risk

Prioritizes active warnings (HIGH -> MEDIUM -> LOW), associates them with specific fields,
and provides clear reasons and actionable guidance without unsupported claims.
"""

from typing import Any, Dict, List, Optional
import logging
from fastapi import APIRouter, Query, Body
from pydantic import BaseModel, Field
import httpx

from app.engine.risk_engine import (
    calculate_rain_risk,
    calculate_heat_risk,
    calculate_pest_risk,
    calculate_disease_risk,
    calculate_water_risk,
    calculate_wind_risk,
    calculate_farm_risks,
)

logger = logging.getLogger("sanjeevani.warnings")

router = APIRouter()

# -----------------------------------------------------------------------------
# Default Cadastral Farm Parcels (Matching Sanjeevani PWA & Satellite Map)
# -----------------------------------------------------------------------------
DEFAULT_FARM_FIELDS = [
    {
        "id": "field-a",
        "name": "Field A (Plot #184/A - Main)",
        "crop": "Wheat (HD 3086)",
        "crop_stage": "Grain Filling",
        "area": "4.2 Acres",
        "ndvi": 0.74,
        "moisture": "22%",
    },
    {
        "id": "field-b",
        "name": "Field B (Plot #183 - North)",
        "crop": "Mustard (Pusa Bold)",
        "crop_stage": "Pod Formation",
        "area": "2.8 Acres",
        "ndvi": 0.62,
        "moisture": "18%",
    },
    {
        "id": "field-c",
        "name": "Field C (Plot #185 - South)",
        "crop": "Sugarcane (Co 0238)",
        "crop_stage": "Grand Growth",
        "area": "3.5 Acres",
        "ndvi": 0.68,
        "moisture": "26%",
    },
]


class FarmFieldModel(BaseModel):
    id: str = Field(default="field-a", description="Unique field or parcel ID")
    name: str = Field(default="Field A", description="Human-readable field name")
    crop: str = Field(default="Wheat (HD 3086)", description="Crop sown in this field")
    crop_stage: str = Field(default="Grain Filling", description="Current phenological crop stage")
    area: Optional[str] = Field(default="4.2 Acres", description="Parcel acreage")
    ndvi: Optional[float] = Field(default=0.74, description="NDVI biomass health score")
    moisture: Optional[str] = Field(default="22%", description="Soil moisture index/percentage")


class WarningEvaluationRequest(BaseModel):
    lat: Optional[float] = Field(default=30.65, description="Farm latitude")
    lon: Optional[float] = Field(default=76.28, description="Farm longitude")
    village: Optional[str] = Field(default="Village Bhadson, Ludhiana Cluster", description="Village or cluster name")
    fields: Optional[List[FarmFieldModel]] = Field(default=None, description="List of farm parcels to evaluate")
    weather: Optional[Dict[str, Any]] = Field(default=None, description="Optional explicit weather telemetry")
    crop_health: Optional[Dict[str, Any]] = Field(default=None, description="Optional crop health telemetry")


async def fetch_weather_telemetry(lat: float, lon: float) -> Dict[str, Any]:
    """
    Fetches real-time weather metrics from Open-Meteo or provides regional fallback.
    """
    open_meteo_url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
        "&timezone=auto&forecast_days=3"
    )

    try:
        async with httpx.AsyncClient(timeout=3.5) as client:
            resp = await client.get(open_meteo_url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})
                daily = data.get("daily", {})
                return {
                    "temperature": float(current.get("temperature_2m", 26.4)),
                    "humidity": float(current.get("relative_humidity_2m", 58.0)),
                    "rainfall_mm": float(current.get("precipitation", 0.0)),
                    "weather_code": int(current.get("weather_code", 2)),
                    "wind_speed_kmh": float(current.get("wind_speed_10m", 11.0)),
                    "temperature_2m_max": float(daily.get("temperature_2m_max", [29.5])[0]),
                    "temperature_2m_min": float(daily.get("temperature_2m_min", [16.2])[0]),
                    "precipitation_sum": float(daily.get("precipitation_sum", [7.5])[0]),
                    "precipitation_probability_max": float(daily.get("precipitation_probability_max", [65])[0]),
                    "wind_speed_10m_max": float(daily.get("wind_speed_10m_max", [14.0])[0]),
                    "source": "Open-Meteo Live API",
                }
    except Exception as e:
        logger.warning(f"Live weather fetch failed: {e}. Using regional baseline telemetry.")

    return {
        "temperature": 26.4,
        "humidity": 68.0,
        "rainfall_mm": 6.5,
        "weather_code": 61,
        "wind_speed_kmh": 14.5,
        "temperature_2m_max": 29.5,
        "temperature_2m_min": 16.2,
        "precipitation_sum": 12.0,
        "precipitation_probability_max": 65.0,
        "wind_speed_10m_max": 18.2,
        "source": "Regional Agronomic Baseline",
    }


@router.get("", summary="Get Active Predictive Farm Early Warnings")
async def get_early_warnings(
    lat: float = Query(default=30.65, description="Latitude"),
    lon: float = Query(default=76.28, description="Longitude"),
    field_id: Optional[str] = Query(default=None, description="Optional filter for specific field ID"),
):
    """
    Returns prioritized early warnings across all farmer fields.
    """
    weather = await fetch_weather_telemetry(lat, lon)
    fields_to_eval = DEFAULT_FARM_FIELDS

    if field_id:
        filtered = [f for f in fields_to_eval if f["id"] == field_id]
        if filtered:
            fields_to_eval = filtered

    results = calculate_farm_risks(fields=fields_to_eval, weather=weather)
    results["weather_snapshot"] = weather
    results["fields_evaluated"] = [f["name"] for f in fields_to_eval]
    return results


@router.post("/evaluate", summary="Evaluate Farm Risks for Custom Fields & Weather")
async def evaluate_early_warnings(payload: WarningEvaluationRequest = Body(...)):
    """
    Allows custom field and telemetry risk evaluation.
    """
    lat = payload.lat or 30.65
    lon = payload.lon or 76.28

    weather = payload.weather
    if not weather:
        weather = await fetch_weather_telemetry(lat, lon)

    fields_to_eval = [f.model_dump() for f in payload.fields] if payload.fields else DEFAULT_FARM_FIELDS
    results = calculate_farm_risks(
        fields=fields_to_eval,
        weather=weather,
        crop_health=payload.crop_health,
    )
    results["weather_snapshot"] = weather
    results["fields_evaluated"] = [f.get("name") for f in fields_to_eval]
    return results
