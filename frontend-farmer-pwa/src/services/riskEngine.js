/**
 * SANJEEVANI Agronomic Risk Engine (Client & Offline PWA Rule Service)
 * Implements transparent rule-based agricultural risk evaluation across 6 categories:
 * 1. Heavy Rain Risk
 * 2. Heat Stress Risk
 * 3. Pest Risk
 * 4. Disease Risk
 * 5. Water Stress Risk
 * 6. Wind Risk
 *
 * Combines telemetry and prioritizes warnings (HIGH -> MEDIUM -> LOW).
 */

/**
 * 1. Heavy Rain Risk
 */
export function calculateRainRisk(weather = {}, crop = 'Wheat', cropStage = 'Grain Filling', field = null, cropHealth = null) {
  const precipSum = Number(weather.precipitation_sum ?? weather.rainfall_mm ?? 0.0);
  const precipProb = Number(weather.precipitation_probability_max ?? weather.rain_probability ?? 0.0);
  const weatherCode = Number(weather.weather_code ?? 0);

  const isStormCode = [63, 65, 81, 82, 95, 96, 99].includes(weatherCode);

  if (precipSum >= 35.0 || (precipProb >= 75.0 && precipSum >= 20.0) || (isStormCode && precipSum >= 25.0)) {
    return {
      risk_type: 'heavy_rain',
      title: 'Heavy Rain Risk',
      level: 'HIGH',
      icon: '🌧️',
      reason: `Forecast indicates heavy precipitation (${precipSum.toFixed(1)}mm expected, ${precipProb.toFixed(0)}% chance). During ${cropStage} stage, prolonged pooling may waterlog root zones, erode furrows, and induce lodging.`,
      action: 'Clear and deepen field perimeter drainage furrows immediately. Suspend planned chemical spraying and halt scheduled irrigation.',
      urgency: 'Immediate',
      metrics_trigger: { rainfall_mm: precipSum, rain_probability: precipProb, weather_code: weatherCode },
    };
  }

  if (precipSum >= 15.0 || precipProb >= 50.0) {
    return {
      risk_type: 'heavy_rain',
      title: 'Heavy Rain Risk',
      level: 'MEDIUM',
      icon: '🌧️',
      reason: `Moderate rainfall conditions anticipated (${precipSum.toFixed(1)}mm, ${precipProb.toFixed(0)}% chance). Topsoil moisture may saturate, temporarily restricting field traffic.`,
      action: 'Inspect bund integrity and monitor drainage channels. Delay scheduled furrow irrigation until showers conclude.',
      urgency: 'Within 24–48 hours',
      metrics_trigger: { rainfall_mm: precipSum, rain_probability: precipProb, weather_code: weatherCode },
    };
  }

  return {
    risk_type: 'heavy_rain',
    title: 'Heavy Rain Risk',
    level: 'LOW',
    icon: '🌧️',
    reason: `Precipitation levels (${precipSum.toFixed(1)}mm) are within standard agronomic tolerance for ${crop}.`,
    action: 'Maintain routine irrigation and field cultivation activities.',
    urgency: 'Routine',
    metrics_trigger: { rainfall_mm: precipSum, rain_probability: precipProb, weather_code: weatherCode },
  };
}

/**
 * 2. Heat Stress Risk
 */
export function calculateHeatRisk(weather = {}, crop = 'Wheat', cropStage = 'Grain Filling', field = null, cropHealth = null) {
  const tempMax = Number(weather.temperature_2m_max ?? weather.temperature ?? 25.0);
  const stageLower = (cropStage || '').toLowerCase();
  const isHeatSensitiveStage = ['flowering', 'heading', 'grain filling', 'booting', 'pod'].some((s) => stageLower.includes(s));

  if ((tempMax >= 36.0 && isHeatSensitiveStage) || tempMax >= 38.0) {
    return {
      risk_type: 'heat_stress',
      title: 'Heat Stress Risk',
      level: 'HIGH',
      icon: '☀️',
      reason: `Forecasted daytime peak temperature of ${tempMax.toFixed(1)}°C during ${cropStage}. Conditions may induce terminal thermal stress, pollen sterility, or premature grain desiccation.`,
      action: 'Provide light evening sprinkler irrigation to cool the crop canopy. Monitor for upper leaf scorch and consider applying anti-transpirant or potassium spray.',
      urgency: 'Immediate',
      metrics_trigger: { temp_max_c: tempMax, sensitive_stage: isHeatSensitiveStage },
    };
  }

  if (tempMax >= 31.0) {
    return {
      risk_type: 'heat_stress',
      title: 'Heat Stress Risk',
      level: 'MEDIUM',
      icon: '☀️',
      reason: `Daytime high reaching ${tempMax.toFixed(1)}°C. Elevated evaporative demand may accelerate moisture depletion from the root zone.`,
      action: 'Scout canopy during peak afternoon hours. Ensure root-zone moisture remains above threshold.',
      urgency: 'Within 24–48 hours',
      metrics_trigger: { temp_max_c: tempMax, sensitive_stage: isHeatSensitiveStage },
    };
  }

  return {
    risk_type: 'heat_stress',
    title: 'Heat Stress Risk',
    level: 'LOW',
    icon: '☀️',
    reason: `Daytime temperatures (${tempMax.toFixed(1)}°C) remain favorable for ${crop} photosynthesis and metabolic development.`,
    action: 'Continue standard agronomic practices.',
    urgency: 'Routine',
    metrics_trigger: { temp_max_c: tempMax, sensitive_stage: isHeatSensitiveStage },
  };
}

/**
 * 3. Pest Risk
 */
export function calculatePestRisk(weather = {}, crop = 'Wheat', cropStage = 'Grain Filling', field = null, cropHealth = null) {
  const humidity = Number(weather.humidity ?? weather.relative_humidity_2m ?? 55.0);
  const temp = Number(weather.temperature ?? weather.temperature_2m_max ?? 24.0);
  const stageLower = (cropStage || '').toLowerCase();
  const isVulnerableStage = ['vegetative', 'tillering', 'heading', 'grain filling', 'flowering'].some((s) => stageLower.includes(s));

  if (humidity >= 70.0 && temp >= 20.0 && temp <= 32.0 && isVulnerableStage) {
    return {
      risk_type: 'pest',
      title: 'Pest Risk',
      level: 'HIGH',
      icon: '🐛',
      reason: `Microclimate conditions (warm ${temp.toFixed(1)}°C and high relative humidity ${humidity.toFixed(0)}%) create an optimal breeding environment for sucking pests (aphids/whiteflies) on ${crop}.`,
      action: 'Inspect 20 random plants across field borders, checking leaf undersides and flag leaves. Install yellow sticky traps and keep biological neem oil (1500 ppm) ready.',
      urgency: 'Immediate',
      metrics_trigger: { humidity_pct: humidity, temp_c: temp },
    };
  }

  if ((humidity >= 58.0 && temp >= 18.0 && temp <= 34.0) || humidity >= 75.0) {
    return {
      risk_type: 'pest',
      title: 'Pest Risk',
      level: 'MEDIUM',
      icon: '🐛',
      reason: `Atmospheric humidity (${humidity.toFixed(0)}%) and mild temperatures (${temp.toFixed(1)}°C) may encourage pest colonization.`,
      action: 'Monitor border rows for early nymph presence. Check for initial leaf curling or honeydew secretions.',
      urgency: 'Within 24–48 hours',
      metrics_trigger: { humidity_pct: humidity, temp_c: temp },
    };
  }

  return {
    risk_type: 'pest',
    title: 'Pest Risk',
    level: 'LOW',
    icon: '🐛',
    reason: `Current atmospheric conditions (${temp.toFixed(1)}°C, ${humidity.toFixed(0)}% RH) suppress rapid pest proliferation.`,
    action: 'Maintain regular bi-weekly field walkthroughs.',
    urgency: 'Routine',
    metrics_trigger: { humidity_pct: humidity, temp_c: temp },
  };
}

/**
 * 4. Disease Risk
 */
export function calculateDiseaseRisk(weather = {}, crop = 'Wheat', cropStage = 'Grain Filling', field = null, cropHealth = null) {
  const humidity = Number(weather.humidity ?? weather.relative_humidity_2m ?? 55.0);
  const temp = Number(weather.temperature ?? weather.temperature_2m_max ?? 22.0);
  const weatherCode = Number(weather.weather_code ?? 0);
  const precipSum = Number(weather.precipitation_sum ?? weather.rainfall_mm ?? 0.0);

  const isDamp = [3, 51, 53, 55, 61, 63, 65, 80, 81].includes(weatherCode) || precipSum > 2.0;

  if (humidity >= 75.0 && temp >= 15.0 && temp <= 27.0 && isDamp) {
    return {
      risk_type: 'disease',
      title: 'Disease Risk',
      level: 'HIGH',
      icon: '🦠',
      reason: `Prolonged canopy dampness (humidity ${humidity.toFixed(0)}%, rain/cloud conditions) at ${temp.toFixed(1)}°C substantially increases vulnerability to fungal spore germination (yellow/brown rust, leaf blight).`,
      action: 'Scout mid and lower canopy leaves for yellow/orange pustules or water-soaked lesions. Avoid overhead irrigation and keep bio-fungicide or systemic triazole on standby.',
      urgency: 'Immediate',
      metrics_trigger: { humidity_pct: humidity, temp_c: temp, damp_weather: isDamp },
    };
  }

  if (humidity >= 62.0 && temp >= 14.0 && temp <= 29.0) {
    return {
      risk_type: 'disease',
      title: 'Disease Risk',
      level: 'MEDIUM',
      icon: '🦠',
      reason: `Elevated humidity (${humidity.toFixed(0)}%) and moderate temperature (${temp.toFixed(1)}°C) may allow localized fungal development.`,
      action: 'Monitor dense canopy zones and shaded borders for early fungal spots. Ensure inter-row airflow.',
      urgency: 'Within 24–48 hours',
      metrics_trigger: { humidity_pct: humidity, temp_c: temp, damp_weather: isDamp },
    };
  }

  return {
    risk_type: 'disease',
    title: 'Disease Risk',
    level: 'LOW',
    icon: '🦠',
    reason: `Dry canopy conditions (${humidity.toFixed(0)}% RH) suppress fungal spore germination on ${crop}.`,
    action: 'Routine crop monitoring.',
    urgency: 'Routine',
    metrics_trigger: { humidity_pct: humidity, temp_c: temp, damp_weather: isDamp },
  };
}

/**
 * 5. Water Stress Risk
 */
export function calculateWaterRisk(weather = {}, crop = 'Wheat', cropStage = 'Grain Filling', field = null, cropHealth = null) {
  let moistureStr = '';
  if (field && field.moisture) moistureStr = String(field.moisture);
  else if (cropHealth && cropHealth.moisture) moistureStr = String(cropHealth.moisture);

  let moistureVal = 22.0;
  if (moistureStr) {
    const parsed = parseFloat(moistureStr.replace('%', '').trim());
    if (!isNaN(parsed)) moistureVal = parsed;
  }

  const precipSum = Number(weather.precipitation_sum ?? weather.rainfall_mm ?? 0.0);
  const tempMax = Number(weather.temperature_2m_max ?? weather.temperature ?? 26.0);

  if (moistureVal < 16.0 && precipSum < 2.0 && tempMax >= 28.0) {
    return {
      risk_type: 'water_stress',
      title: 'Water Stress Risk',
      level: 'HIGH',
      icon: '💧',
      reason: `Soil moisture has dropped to ${moistureVal.toFixed(0)}% with negligible rain in forecast (${precipSum.toFixed(1)}mm) and high daytime highs (${tempMax.toFixed(1)}°C). Root zone faces acute water deficit during ${cropStage}.`,
      action: 'Initiate priority tube-well/canal irrigation within 24 hours. Consider straw mulching along furrows to reduce surface evaporation.',
      urgency: 'Immediate',
      metrics_trigger: { soil_moisture_pct: moistureVal, forecast_rain_mm: precipSum, temp_max_c: tempMax },
    };
  }

  if (moistureVal < 20.0 && precipSum < 5.0) {
    return {
      risk_type: 'water_stress',
      title: 'Water Stress Risk',
      level: 'MEDIUM',
      icon: '💧',
      reason: `Root-zone moisture (${moistureVal.toFixed(0)}%) is nearing critical threshold without significant incoming rainfall.`,
      action: 'Schedule irrigation within the next 36–48 hours before visible leaf wilting occurs.',
      urgency: 'Within 24–48 hours',
      metrics_trigger: { soil_moisture_pct: moistureVal, forecast_rain_mm: precipSum, temp_max_c: tempMax },
    };
  }

  return {
    risk_type: 'water_stress',
    title: 'Water Stress Risk',
    level: 'LOW',
    icon: '💧',
    reason: `Soil moisture reserves (${moistureVal.toFixed(0)}%) are currently adequate to satisfy ${crop} transpiration needs.`,
    action: 'Avoid over-irrigation to conserve water and prevent nutrient leaching.',
    urgency: 'Routine',
    metrics_trigger: { soil_moisture_pct: moistureVal, forecast_rain_mm: precipSum, temp_max_c: tempMax },
  };
}

/**
 * 6. Wind Risk
 */
export function calculateWindRisk(weather = {}, crop = 'Wheat', cropStage = 'Grain Filling', field = null, cropHealth = null) {
  const windSpeed = Number(weather.wind_speed_10m_max ?? weather.wind_speed_kmh ?? weather.wind_speed ?? 10.0);
  const cropLower = (crop || '').toLowerCase();
  const isTallCrop = ['wheat', 'rice', 'paddy', 'mustard', 'sugarcane', 'maize'].some((c) => cropLower.includes(c));
  const stageLower = (cropStage || '').toLowerCase();
  const isLodgingSensitiveStage = ['heading', 'grain filling', 'maturity', 'flowering'].some((s) => stageLower.includes(s));

  if (windSpeed >= 30.0 && isTallCrop && isLodgingSensitiveStage) {
    return {
      risk_type: 'wind',
      title: 'Wind Risk',
      level: 'HIGH',
      icon: '💨',
      reason: `High wind speeds of ${windSpeed.toFixed(1)} km/h forecasted. Grain-heavy ${crop} stems during ${cropStage} are at severe risk of crop lodging (bending/snapping to the ground).`,
      action: 'Do NOT irrigate the field prior to wind arrival (wet root zones loosen soil anchorage and trigger lodging). Postpone all high-pressure spraying operations.',
      urgency: 'Immediate',
      metrics_trigger: { wind_speed_kmh: windSpeed, lodging_sensitive: isLodgingSensitiveStage },
    };
  }

  if (windSpeed >= 18.0) {
    return {
      risk_type: 'wind',
      title: 'Wind Risk',
      level: 'MEDIUM',
      icon: '💨',
      reason: `Breezy winds of ${windSpeed.toFixed(1)} km/h may cause significant pesticide/foliar spray drift and slight stem sway.`,
      action: 'Postpone chemical spraying until early morning or dusk when winds diminish (<15 km/h). Inspect boundary fences.',
      urgency: 'Within 24–48 hours',
      metrics_trigger: { wind_speed_kmh: windSpeed, lodging_sensitive: isLodgingSensitiveStage },
    };
  }

  return {
    risk_type: 'wind',
    title: 'Wind Risk',
    level: 'LOW',
    icon: '💨',
    reason: `Gentle wind speeds (${windSpeed.toFixed(1)} km/h) maintain healthy canopy aeration without physical lodging hazard.`,
    action: 'Safe for all spraying, dusting, and standard field equipment operations.',
    urgency: 'Routine',
    metrics_trigger: { wind_speed_kmh: windSpeed, lodging_sensitive: isLodgingSensitiveStage },
  };
}

/**
 * Master Farm Risk Combiner
 * Evaluates all 6 risk calculators across all fields and prioritizes by level: HIGH -> MEDIUM -> LOW
 */
export function calculateFarmRisks({ fields = [], weather = {}, cropHealth = null }) {
  const allWarnings = [];
  const weightMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };

  const targetFields = fields && fields.length > 0 ? fields : [
    {
      id: 'field-a',
      name: 'Field A (Plot #184/A - Main)',
      crop: 'Wheat (HD 3086)',
      crop_stage: 'Grain Filling',
      area: '4.2 Acres',
      ndvi: 0.74,
      moisture: '22%',
    },
    {
      id: 'field-b',
      name: 'Field B (Plot #183 - North)',
      crop: 'Mustard (Pusa Bold)',
      crop_stage: 'Pod Formation',
      area: '2.8 Acres',
      ndvi: 0.62,
      moisture: '18%',
    },
    {
      id: 'field-c',
      name: 'Field C (Plot #185 - South)',
      crop: 'Sugarcane (Co 0238)',
      crop_stage: 'Grand Growth',
      area: '3.5 Acres',
      ndvi: 0.68,
      moisture: '26%',
    },
  ];

  const calculators = [
    calculateRainRisk,
    calculateHeatRisk,
    calculatePestRisk,
    calculateDiseaseRisk,
    calculateWaterRisk,
    calculateWindRisk,
  ];

  targetFields.forEach((field) => {
    const fieldId = field.id || 'field-main';
    const fieldName = field.name || 'Field A';
    const crop = field.crop || 'Wheat (HD 3086)';
    const cropStage = field.crop_stage || field.stage || 'Grain Filling';
    const health = {
      ndvi: field.ndvi ?? 0.74,
      moisture: field.moisture ?? '22%',
      ...(cropHealth || {}),
    };

    calculators.forEach((calc) => {
      const risk = calc(weather, crop, cropStage, field, health);
      risk.field_id = fieldId;
      risk.field_name = fieldName;
      risk.crop = crop;
      risk.crop_stage = cropStage;
      risk.field_area = field.area || '4.2 Acres';
      risk.sort_weight = weightMap[risk.level] || 1;
      allWarnings.push(risk);
    });
  });

  // Prioritize HIGH first, then MEDIUM, then LOW
  allWarnings.sort((a, b) => b.sort_weight - a.sort_weight);

  const highCount = allWarnings.filter((w) => w.level === 'HIGH').length;
  const mediumCount = allWarnings.filter((w) => w.level === 'MEDIUM').length;
  const lowCount = allWarnings.filter((w) => w.level === 'LOW').length;

  let primarySeverity = 'LOW';
  let summary = 'All evaluated farm indicators remain in the favorable/safe zone.';

  if (highCount > 0) {
    primarySeverity = 'HIGH';
    summary = `${highCount} critical farm risk${highCount > 1 ? 's' : ''} require immediate attention.`;
  } else if (mediumCount > 0) {
    primarySeverity = 'MEDIUM';
    summary = `${mediumCount} potential risk${mediumCount > 1 ? 's' : ''} detected. Monitor crops closely.`;
  }

  return {
    status: 'success',
    primary_severity: primarySeverity,
    summary,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    total_risks_evaluated: allWarnings.length,
    warnings: allWarnings,
    disclaimer: 'Sanjeevani Predictive Early-Warning System provides agricultural decision support based on environmental thresholds and phenological models. Monitor field conditions directly before taking action.',
  };
}
