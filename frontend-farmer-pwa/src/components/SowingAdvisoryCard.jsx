import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchWeatherAction } from '../services/api';
import {
  CloudSun,
  CloudRain,
  Sun,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  Wheat,
  Sprout,
  Clock,
  Zap,
  TriangleAlert,
  RotateCcw,
  Info,
} from 'lucide-react';

function getWeatherIcon(conditionStr, size = 16) {
  const cond = (conditionStr || '').toLowerCase();
  if (cond.includes('rain') || cond.includes('shower') || cond.includes('drizzle')) {
    return <CloudRain size={size} strokeWidth={2} />;
  }
  if (cond.includes('thunder') || cond.includes('storm')) {
    return <CloudLightning size={size} strokeWidth={2} />;
  }
  if (cond.includes('cloud') || cond.includes('overcast')) {
    return <CloudSun size={size} strokeWidth={2} />;
  }
  return <Sun size={size} strokeWidth={2} />;
}

export default function SowingAdvisoryCard({ user }) {
  const { t } = useTranslation();

  // State management: loading, error, data, retry counter
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [selectedForecastIndex, setSelectedForecastIndex] = useState(0);

  // Derive location, crop, field and stage from user context with solid defaults
  const farmLocation = user?.cluster || 'Village Bhadson, Ludhiana Cluster';
  const cropName = user?.crop || 'Wheat (HD 3086)';
  const fieldArea = user?.acreage || '4.2 Acres';
  const cropStage = 'Grain Filling'; // Phenological stage aligned with Rabi cycle

  // Load weather and action telemetry
  const loadWeather = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    // Default coordinates for Ludhiana Cluster (Punjab Rabi belt)
    let lat = 30.65;
    let lon = 76.28;

    // Use geolocation silently if already granted without forcing prompts
    if ('geolocation' in navigator && navigator.permissions) {
      try {
        const perm = await navigator.permissions.query({ name: 'geolocation' });
        if (perm.state === 'granted') {
          const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        }
      } catch (e) {
        // Silently use saved farm coordinates
      }
    }

    try {
      const res = await fetchWeatherAction({
        lat,
        lon,
        crop: cropName,
        cropStage: cropStage,
        village: farmLocation,
      });

      if (res && res.data) {
        setWeatherData(res.data);
      } else {
        setError('No weather data available.');
      }
    } catch (err) {
      console.error('Weather action load error:', err);
      setError('Unable to load weather information.');
    } finally {
      setLoading(false);
    }
  }, [farmLocation, cropName, cropStage]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  // Format updated timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // ---------------------------------------------------------------------------
  // 1. Loading State
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="agritrust-card weather-action-card" style={{ gap: '14px', minHeight: '260px' }}>
        <div className="card-header-line">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="card-feature-icon-box">
              <CloudSun size={18} strokeWidth={2.2} />
            </div>
            <span className="card-category-label">{t('wa_badge')}</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{farmLocation.split(',')[0]}</span>
        </div>

        <div className="weather-loading-container">
          <div className="weather-spinner"></div>
          <span className="weather-loading-text">{t('wa_loading')}</span>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Error State with Retry
  // ---------------------------------------------------------------------------
  if (error || !weatherData) {
    return (
      <div className="agritrust-card weather-action-card" style={{ gap: '14px', minHeight: '220px' }}>
        <div className="card-header-line">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="card-feature-icon-box">
              <CloudSun size={18} strokeWidth={2.2} />
            </div>
            <span className="card-category-label">{t('wa_badge')}</span>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{farmLocation.split(',')[0]}</span>
        </div>

        <div className="weather-error-container">
          <TriangleAlert size={26} strokeWidth={2} color="#f59e0b" />
          <p className="weather-error-text">
            {error || t('wa_error')}
          </p>
          <button className="weather-retry-btn" onClick={() => loadWeather(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={13} strokeWidth={2} />
            {t('wa_retry')}
          </button>
        </div>
      </div>
    );
  }

  const { current, timing, weather_impact, recommended_action, forecast, last_updated, disclaimer } = weatherData;
  const activeDay = forecast && forecast[selectedForecastIndex] ? forecast[selectedForecastIndex] : null;

  return (
    <div className="agritrust-card weather-action-card" style={{ gap: '14px' }}>
      {/* 1. Header Line: Badge + Last Updated */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="card-feature-icon-box">
            <CloudSun size={18} strokeWidth={2.2} />
          </div>
          <span className="card-category-label" style={{ letterSpacing: '0.06em' }}>
            {t('wa_badge')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="weather-live-pulse-dot"></span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
            {t('wa_updated')}: {formatTime(last_updated)}
          </span>
        </div>
      </div>

      {/* 2. Farm & Crop Context Pill Bar: Flow (Location -> Field -> Crop -> Stage) */}
      <div className="weather-context-chip-row">
        <span className="weather-context-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} strokeWidth={2} />
          {farmLocation.split(',')[0]}
        </span>
        <span className="weather-context-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Wheat size={12} strokeWidth={2} />
          {cropName} ({fieldArea})
        </span>
        <span className="weather-context-chip stage-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <Sprout size={12} strokeWidth={2} />
          {cropStage}
        </span>
      </div>

      {/* 3. Primary Weather Action Banner (The Decision-Support Callout) */}
      <div className="weather-action-banner">
        <div className="weather-action-header-row">
          <span className="weather-timing-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} strokeWidth={2} />
            {timing}
          </span>
          <span className="weather-condition-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            {getWeatherIcon(current.condition, 14)}
            <span>{current.condition}</span>
          </span>
        </div>

        {/* Impact */}
        <div className="weather-impact-box">
          <span className="weather-impact-tag">{t('wa_impact_label')}:</span>
          <span className="weather-impact-text">{weather_impact}</span>
        </div>

        {/* Recommended Action */}
        <div className="weather-action-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <div style={{ marginTop: '2px', color: '#16a34a' }}>
              <Zap size={16} strokeWidth={2.2} />
            </div>
            <div>
              <span className="weather-action-tag">{t('wa_action_label')}:</span>
              <p className="weather-action-main-text">{recommended_action}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Weather Telemetry Metrics Grid */}
      <div className="weather-telemetry-grid">
        {/* Metric 1: Temperature */}
        <div className="weather-telemetry-pill">
          <span className="telemetry-pill-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Thermometer size={11} strokeWidth={2} />
            Temp
          </span>
          <span className="telemetry-pill-value">{Math.round(current.temperature)}°C</span>
        </div>

        {/* Metric 2: Rain Probability */}
        <div className="weather-telemetry-pill highlight-rain">
          <span className="telemetry-pill-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <CloudRain size={11} strokeWidth={2} />
            {t('wa_rain_prob')}
          </span>
          <span className="telemetry-pill-value">{current.rain_probability}%</span>
        </div>

        {/* Metric 3: Expected Rainfall */}
        <div className="weather-telemetry-pill">
          <span className="telemetry-pill-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Droplets size={11} strokeWidth={2} />
            {t('wa_rainfall')}
          </span>
          <span className="telemetry-pill-value">{current.rainfall_mm} mm</span>
        </div>

        {/* Metric 4: Wind Speed */}
        <div className="weather-telemetry-pill">
          <span className="telemetry-pill-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Wind size={11} strokeWidth={2} />
            {t('wa_wind')}
          </span>
          <span className="telemetry-pill-value">{Math.round(current.wind_speed_kmh)} km/h</span>
        </div>

        {/* Metric 5: Humidity */}
        <div className="weather-telemetry-pill">
          <span className="telemetry-pill-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <Droplets size={11} strokeWidth={2} />
            {t('wa_humidity')}
          </span>
          <span className="telemetry-pill-value">{current.humidity}%</span>
        </div>
      </div>

      {/* 5. 5-Day Forecast View with Agricultural Impact */}
      {forecast && forecast.length > 0 && (
        <div className="weather-forecast-section">
          <div className="weather-forecast-title-row">
            <span className="weather-forecast-header-text">{t('wa_forecast_tab')}</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Tap a day to view farm impact</span>
          </div>

          <div className="five-days-forecast-pills-row">
            {forecast.map((d, i) => {
              const isSelected = selectedForecastIndex === i;
              return (
                <button
                  key={d.date || i}
                  type="button"
                  className={`weather-day-pill interactive-day-pill ${isSelected ? 'selected-day' : ''}`}
                  onClick={() => setSelectedForecastIndex(i)}
                  title={`${d.day_name}: ${d.agricultural_impact}`}
                >
                  <span className="weather-day-name">{d.day_name}</span>
                  <span className="weather-day-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getWeatherIcon(d.condition || d.agricultural_impact, 16)}
                  </span>
                  <span className="weather-day-temp">
                    {Math.round(d.temp_max)}°<span className="weather-min-temp">/{Math.round(d.temp_min)}°</span>
                  </span>
                  {d.rain_probability > 0 && (
                    <span className="weather-day-rain-prob" style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <Droplets size={10} strokeWidth={2} />
                      {d.rain_probability}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Selected Day Agricultural Impact Callout */}
          {activeDay && (
            <div className="weather-day-impact-callout">
              <span className="day-impact-badge">{activeDay.day_name} Impact</span>
              <span className="day-impact-text">{activeDay.agricultural_impact}</span>
            </div>
          )}
        </div>
      )}

      {/* 6. Legal / Decision-Support Disclaimer */}
      <div className="weather-disclaimer-row" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <Info size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
        <span>{disclaimer || t('wa_disclaimer')}</span>
      </div>
    </div>
  );
}
