"""
SANJEEVANI Agronomic Risk Engine (Rule-based Decision Support)
Evaluates 6 core farm risk categories:
1. Heavy Rain Risk
2. Heat Stress Risk
3. Pest Risk
4. Disease Risk
5. Water Stress Risk
6. Wind Risk

Combines environmental telemetry (weather, stage, crop, field, crop health)
into transparent HIGH, MEDIUM, and LOW risk warnings with reasons and actions.
"""

from typing import Dict, Any, List, Optional


def calculate_rain_risk(
    weather: Dict[str, Any],
    crop: str = "Wheat",
    crop_stage: str = "Grain Filling",
    field: Optional[Dict[str, Any]] = None,
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates Heavy Rain Risk.
    Triggers: High rainfall mm, high probability of precipitation, saturation.
    """
    precip_sum = float(weather.get("precipitation_sum") or weather.get("rainfall_mm") or 0.0)
    precip_prob = float(weather.get("precipitation_probability_max") or weather.get("rain_probability") or 0.0)
    weather_code = int(weather.get("weather_code") or 0)

    # WMO codes for moderate/heavy rain: 63, 65, 81, 82, 95, 96, 99
    is_storm_code = weather_code in [63, 65, 81, 82, 95, 96, 99]

    if precip_sum >= 35.0 or (precip_prob >= 75.0 and precip_sum >= 20.0) or (is_storm_code and precip_sum >= 25.0):
        level = "HIGH"
        reason = (
            f"Forecast indicates heavy precipitation ({precip_sum:.1f}mm expected, {precip_prob:.0f}% chance). "
            f"During {crop_stage} stage, prolonged pooling may waterlog root zones, erode furrows, and induce lodging."
        )
        action = (
            "Clear and deepen field perimeter drainage furrows immediately. "
            "Suspend planned chemical spraying and halt scheduled irrigation."
        )
        urgency = "Immediate"
    elif precip_sum >= 15.0 or precip_prob >= 50.0:
        level = "MEDIUM"
        reason = (
            f"Moderate rainfall conditions anticipated ({precip_sum:.1f}mm, {precip_prob:.0f}% chance). "
            f"Topsoil moisture may saturate, temporarily restricting field traffic."
        )
        action = (
            "Inspect bund integrity and monitor drainage channels. Delay scheduled furrow irrigation until showers conclude."
        )
        urgency = "Within 24–48 hours"
    else:
        level = "LOW"
        reason = (
            f"Precipitation levels ({precip_sum:.1f}mm) are within standard agronomic tolerance for {crop}."
        )
        action = "Maintain routine irrigation and field cultivation activities."
        urgency = "Routine"

    confidence = 0.92 if level == "HIGH" else (0.84 if level == "MEDIUM" else 0.76)
    what_desc = (
        f"Potential heavy rain risk on {crop} ({level} alert)"
        if level == "HIGH"
        else (f"Possible rainfall alert for {crop}" if level == "MEDIUM" else f"Normal precipitation levels for {crop}")
    )

    return {
        "risk_type": "heavy_rain",
        "title": "Heavy Rain Risk",
        "level": level,
        "icon": "🌧️",
        "what": what_desc,
        "why": reason,
        "when": urgency,
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "urgency": urgency,
        "metrics_trigger": {
            "rainfall_mm": precip_sum,
            "rain_probability": precip_prob,
            "weather_code": weather_code,
        },
    }


def calculate_heat_risk(
    weather: Dict[str, Any],
    crop: str = "Wheat",
    crop_stage: str = "Grain Filling",
    field: Optional[Dict[str, Any]] = None,
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates Heat Stress Risk.
    Triggers: Maximum temperatures > 35°C, especially during flowering/heading/grain filling.
    """
    temp_max = float(weather.get("temperature_2m_max") or weather.get("temperature") or 25.0)
    stage_lower = crop_stage.lower()
    is_heat_sensitive_stage = any(s in stage_lower for s in ["flowering", "heading", "grain filling", "booting", "pod"])

    if (temp_max >= 36.0 and is_heat_sensitive_stage) or temp_max >= 38.0:
        level = "HIGH"
        reason = (
            f"Forecasted daytime peak temperature of {temp_max:.1f}°C during {crop_stage}. "
            f"Conditions may induce terminal thermal stress, pollen sterility, or premature grain desiccation."
        )
        action = (
            "Provide light evening sprinkler irrigation to cool the crop canopy. "
            "Monitor for upper leaf scorch and consider applying anti-transpirant or potassium spray."
        )
        urgency = "Immediate"
    elif temp_max >= 31.0:
        level = "MEDIUM"
        reason = (
            f"Daytime high reaching {temp_max:.1f}°C. Elevated evaporative demand may accelerate moisture depletion from the root zone."
        )
        action = (
            "Scout canopy during peak afternoon hours. Ensure root-zone moisture remains above threshold."
        )
        urgency = "Within 24–48 hours"
    else:
        level = "LOW"
        reason = f"Daytime temperatures ({temp_max:.1f}°C) remain favorable for {crop} photosynthesis and metabolic development."
        action = "Continue standard agronomic practices."
        urgency = "Routine"

    confidence = 0.90 if level == "HIGH" else (0.82 if level == "MEDIUM" else 0.75)
    what_desc = (
        f"Potential heat stress risk on {crop} ({level} alert)"
        if level == "HIGH"
        else (f"Possible elevated daytime temperature for {crop}" if level == "MEDIUM" else f"Optimal temperature range for {crop}")
    )

    return {
        "risk_type": "heat_stress",
        "title": "Heat Stress Risk",
        "level": level,
        "icon": "☀️",
        "what": what_desc,
        "why": reason,
        "when": urgency,
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "urgency": urgency,
        "metrics_trigger": {
            "temp_max_c": temp_max,
            "sensitive_stage": is_heat_sensitive_stage,
        },
    }


def calculate_pest_risk(
    weather: Dict[str, Any],
    crop: str = "Wheat",
    crop_stage: str = "Grain Filling",
    field: Optional[Dict[str, Any]] = None,
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates Pest Risk (Aphids, Stem Borers, Whiteflies, Bollworms).
    Triggers: Warm temperature (20-32°C) + High relative humidity (>70%) + Dense canopy/vegetative stage.
    """
    humidity = float(weather.get("humidity") or weather.get("relative_humidity_2m") or 55.0)
    temp = float(weather.get("temperature") or weather.get("temperature_2m_max") or 24.0)

    # Moderate/high vegetative canopy provides microhabitat
    is_vulnerable_stage = any(s in crop_stage.lower() for s in ["vegetative", "tillering", "heading", "grain filling", "flowering"])

    if humidity >= 70.0 and (20.0 <= temp <= 32.0) and is_vulnerable_stage:
        level = "HIGH"
        reason = (
            f"Microclimate conditions (warm {temp:.1f}°C and high relative humidity {humidity:.0f}%) "
            f"create an optimal breeding environment for sucking pests (aphids/whiteflies) on {crop}."
        )
        action = (
            "Inspect 20 random plants across field borders, checking leaf undersides and flag leaves. "
            "Install yellow sticky traps and keep biological neem oil (1500 ppm) ready."
        )
        urgency = "Immediate"
    elif (humidity >= 58.0 and (18.0 <= temp <= 34.0)) or humidity >= 75.0:
        level = "MEDIUM"
        reason = (
            f"Atmospheric humidity ({humidity:.0f}%) and mild temperatures ({temp:.1f}°C) may encourage pest colonization."
        )
        action = (
            "Monitor border rows for early nymph presence. Check for initial leaf curling or honeydew secretions."
        )
        urgency = "Within 24–48 hours"
    else:
        level = "LOW"
        reason = f"Current atmospheric conditions ({temp:.1f}°C, {humidity:.0f}% RH) suppress rapid pest proliferation."
        action = "Maintain regular bi-weekly field walkthroughs."
        urgency = "Routine"

    confidence = 0.88 if level == "HIGH" else (0.80 if level == "MEDIUM" else 0.72)
    what_desc = (
        f"Potential pest infestation risk on {crop} ({level} alert)"
        if level == "HIGH"
        else (f"Possible pest colonization conditions for {crop}" if level == "MEDIUM" else f"Low pest proliferation pressure for {crop}")
    )

    return {
        "risk_type": "pest",
        "title": "Pest Risk",
        "level": level,
        "icon": "🐛",
        "what": what_desc,
        "why": reason,
        "when": urgency,
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "urgency": urgency,
        "metrics_trigger": {
            "humidity_pct": humidity,
            "temp_c": temp,
        },
    }


def calculate_disease_risk(
    weather: Dict[str, Any],
    crop: str = "Wheat",
    crop_stage: str = "Grain Filling",
    field: Optional[Dict[str, Any]] = None,
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates Disease Risk (Fungal Rusts, Blights, Mildew).
    Triggers: Extended leaf wetness, humidity > 75%, overcast/rain codes (50-65, 80-82), moderate temp (15-26°C).
    """
    humidity = float(weather.get("humidity") or weather.get("relative_humidity_2m") or 55.0)
    temp = float(weather.get("temperature") or weather.get("temperature_2m_max") or 22.0)
    weather_code = int(weather.get("weather_code") or 0)
    precip_sum = float(weather.get("precipitation_sum") or weather.get("rainfall_mm") or 0.0)

    # Overcast or rainy codes
    is_damp = weather_code in [3, 51, 53, 55, 61, 63, 65, 80, 81] or precip_sum > 2.0

    if humidity >= 75.0 and (15.0 <= temp <= 27.0) and is_damp:
        level = "HIGH"
        reason = (
            f"Prolonged canopy dampness (humidity {humidity:.0f}%, rain/cloud conditions) at {temp:.1f}°C "
            f"substantially increases vulnerability to fungal spore germination (yellow/brown rust, leaf blight)."
        )
        action = (
            "Scout mid and lower canopy leaves for yellow/orange pustules or water-soaked lesions. "
            "Avoid overhead irrigation and keep bio-fungicide or systemic triazole on standby."
        )
        urgency = "Immediate"
    elif humidity >= 62.0 and (14.0 <= temp <= 29.0):
        level = "MEDIUM"
        reason = (
            f"Elevated humidity ({humidity:.0f}%) and moderate temperature ({temp:.1f}°C) may allow localized fungal development."
        )
        action = (
            "Monitor dense canopy zones and shaded borders for early fungal spots. Ensure inter-row airflow."
        )
        urgency = "Within 24–48 hours"
    else:
        level = "LOW"
        reason = f"Dry canopy conditions ({humidity:.0f}% RH) suppress fungal spore germination on {crop}."
        action = "Routine crop monitoring."
        urgency = "Routine"

    confidence = 0.89 if level == "HIGH" else (0.81 if level == "MEDIUM" else 0.73)
    what_desc = (
        f"Potential fungal disease risk on {crop} ({level} alert)"
        if level == "HIGH"
        else (f"Possible disease vulnerability conditions for {crop}" if level == "MEDIUM" else f"Dry canopy; low fungal risk for {crop}")
    )

    return {
        "risk_type": "disease",
        "title": "Disease Risk",
        "level": level,
        "icon": "🦠",
        "what": what_desc,
        "why": reason,
        "when": urgency,
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "urgency": urgency,
        "metrics_trigger": {
            "humidity_pct": humidity,
            "temp_c": temp,
            "damp_weather": is_damp,
        },
    }


def calculate_water_risk(
    weather: Dict[str, Any],
    crop: str = "Wheat",
    crop_stage: str = "Grain Filling",
    field: Optional[Dict[str, Any]] = None,
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates Water Stress Risk (Drought / Soil Moisture Deficit).
    Triggers: Low soil moisture (<16%), high temperature, zero forecasted rainfall, declining NDVI biomass.
    """
    moisture_str = ""
    if field and "moisture" in field:
        moisture_str = str(field["moisture"])
    elif crop_health and "moisture" in crop_health:
        moisture_str = str(crop_health["moisture"])

    moisture_val = 22.0
    if moisture_str:
        try:
            moisture_val = float(moisture_str.replace("%", "").strip())
        except ValueError:
            moisture_val = 22.0

    precip_sum = float(weather.get("precipitation_sum") or weather.get("rainfall_mm") or 0.0)
    temp_max = float(weather.get("temperature_2m_max") or weather.get("temperature") or 26.0)

    if moisture_val < 16.0 and precip_sum < 2.0 and temp_max >= 28.0:
        level = "HIGH"
        reason = (
            f"Soil moisture has dropped to {moisture_val:.0f}% with negligible rain in forecast ({precip_sum:.1f}mm) "
            f"and high daytime highs ({temp_max:.1f}°C). Root zone faces acute water deficit during {crop_stage}."
        )
        action = (
            "Initiate priority tube-well/canal irrigation within 24 hours. "
            "Consider straw mulching along furrows to reduce surface evaporation."
        )
        urgency = "Immediate"
    elif moisture_val < 20.0 and precip_sum < 5.0:
        level = "MEDIUM"
        reason = (
            f"Root-zone moisture ({moisture_val:.0f}%) is nearing critical threshold without significant incoming rainfall."
        )
        action = (
            "Schedule irrigation within the next 36–48 hours before visible leaf wilting occurs."
        )
        urgency = "Within 24–48 hours"
    else:
        level = "LOW"
        reason = f"Soil moisture reserves ({moisture_val:.0f}%) are currently adequate to satisfy {crop} transpiration needs."
        action = "Avoid over-irrigation to conserve water and prevent nutrient leaching."
        urgency = "Routine"

    confidence = 0.91 if level == "HIGH" else (0.83 if level == "MEDIUM" else 0.76)
    what_desc = (
        f"Potential water stress & root deficit on {crop} ({level} alert)"
        if level == "HIGH"
        else (f"Possible soil moisture depletion for {crop}" if level == "MEDIUM" else f"Adequate root-zone soil moisture for {crop}")
    )

    return {
        "risk_type": "water_stress",
        "title": "Water Stress Risk",
        "level": level,
        "icon": "💧",
        "what": what_desc,
        "why": reason,
        "when": urgency,
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "urgency": urgency,
        "metrics_trigger": {
            "soil_moisture_pct": moisture_val,
            "forecast_rain_mm": precip_sum,
            "temp_max_c": temp_max,
        },
    }


def calculate_wind_risk(
    weather: Dict[str, Any],
    crop: str = "Wheat",
    crop_stage: str = "Grain Filling",
    field: Optional[Dict[str, Any]] = None,
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Evaluates Wind Risk (Crop Lodging, Mechanical Snapping, Spray Drift).
    Triggers: Wind gusts/speeds > 30 km/h, especially for tall/grain-heavy crops.
    """
    wind_speed = float(weather.get("wind_speed_10m_max") or weather.get("wind_speed_kmh") or weather.get("wind_speed") or 10.0)
    is_tall_crop = any(c in crop.lower() for c in ["wheat", "rice", "paddy", "mustard", "sugarcane", "maize"])
    is_lodging_sensitive_stage = any(s in crop_stage.lower() for s in ["heading", "grain filling", "maturity", "flowering"])

    if wind_speed >= 30.0 and is_tall_crop and is_lodging_sensitive_stage:
        level = "HIGH"
        reason = (
            f"High wind speeds of {wind_speed:.1f} km/h forecasted. Grain-heavy {crop} stems during {crop_stage} "
            f"are at severe risk of crop lodging (bending/snapping to the ground)."
        )
        action = (
            "Do NOT irrigate the field prior to wind arrival (wet root zones loosen soil anchorage and trigger lodging). "
            "Postpone all high-pressure spraying operations."
        )
        urgency = "Immediate"
    elif wind_speed >= 18.0:
        level = "MEDIUM"
        reason = (
            f"Breezy winds of {wind_speed:.1f} km/h may cause significant pesticide/foliar spray drift and slight stem sway."
        )
        action = (
            "Postpone chemical spraying until early morning or dusk when winds diminish (<15 km/h). Inspect boundary fences."
        )
        urgency = "Within 24–48 hours"
    else:
        level = "LOW"
        reason = f"Gentle wind speeds ({wind_speed:.1f} km/h) maintain healthy canopy aeration without physical lodging hazard."
        action = "Safe for all spraying, dusting, and standard field equipment operations."
        urgency = "Routine"

    confidence = 0.90 if level == "HIGH" else (0.82 if level == "MEDIUM" else 0.75)
    what_desc = (
        f"Potential crop lodging / high wind hazard on {crop} ({level} alert)"
        if level == "HIGH"
        else (f"Possible spray drift due to breezy winds" if level == "MEDIUM" else f"Calm wind conditions for {crop}")
    )

    return {
        "risk_type": "wind",
        "title": "Wind Risk",
        "level": level,
        "icon": "💨",
        "what": what_desc,
        "why": reason,
        "when": urgency,
        "action": action,
        "confidence": confidence,
        "reason": reason,
        "urgency": urgency,
        "metrics_trigger": {
            "wind_speed_kmh": wind_speed,
            "lodging_sensitive": is_lodging_sensitive_stage,
        },
    }


def calculate_farm_risks(
    fields: List[Dict[str, Any]],
    weather: Dict[str, Any],
    crop_health: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Master Risk Aggregator.
    Evaluates all 6 risk categories across provided farm parcels/fields.
    Prioritizes output by risk level: HIGH -> MEDIUM -> LOW.
    """
    all_warnings: List[Dict[str, Any]] = []

    # Map level to numerical sort weight (HIGH = 3, MEDIUM = 2, LOW = 1)
    weight_map = {"HIGH": 3, "MEDIUM": 2, "LOW": 1}

    for f in fields:
        field_id = f.get("id", "field-main")
        field_name = f.get("name", "Field A")
        crop = f.get("crop", "Wheat (HD 3086)")
        crop_stage = f.get("crop_stage") or f.get("stage") or "Grain Filling"
        field_health = {
            "ndvi": f.get("ndvi", 0.74),
            "moisture": f.get("moisture", "22%"),
            **(crop_health or {}),
        }

        # Calculate the 6 discrete risk types
        risk_calculators = [
            calculate_rain_risk,
            calculate_heat_risk,
            calculate_pest_risk,
            calculate_disease_risk,
            calculate_water_risk,
            calculate_wind_risk,
        ]

        for calc in risk_calculators:
            res = calc(weather, crop=crop, crop_stage=crop_stage, field=f, crop_health=field_health)
            res["field_id"] = field_id
            res["field_name"] = field_name
            res["crop"] = crop
            res["crop_stage"] = crop_stage
            res["field_area"] = f.get("area", "4.2 Acres")
            res["sort_weight"] = weight_map.get(res["level"], 1)
            all_warnings.append(res)

    # Sort prioritized: HIGH first, then MEDIUM, then LOW
    all_warnings.sort(key=lambda x: x["sort_weight"], reverse=True)

    # Categorize counts
    high_count = sum(1 for w in all_warnings if w["level"] == "HIGH")
    medium_count = sum(1 for w in all_warnings if w["level"] == "MEDIUM")
    low_count = sum(1 for w in all_warnings if w["level"] == "LOW")

    # High-level summary recommendation
    if high_count > 0:
        summary_status = f"{high_count} critical farm risk{'s' if high_count > 1 else ''} require immediate attention."
        primary_severity = "HIGH"
    elif medium_count > 0:
        summary_status = f"{medium_count} potential risk{'s' if medium_count > 1 else ''} detected. Monitor crops closely."
        primary_severity = "MEDIUM"
    else:
        summary_status = "All evaluated farm indicators remain in the favorable/safe zone."
        primary_severity = "LOW"

    return {
        "status": "success",
        "primary_severity": primary_severity,
        "summary": summary_status,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "total_risks_evaluated": len(all_warnings),
        "warnings": all_warnings,
        "disclaimer": (
            "Sanjeevani Predictive Early-Warning System provides agricultural decision support based on "
            "environmental thresholds and phenological models. Monitor field conditions directly before taking action."
        ),
    }
