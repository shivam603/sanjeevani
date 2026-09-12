import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SatelliteFieldMapCard() {
  const { t } = useTranslation();

  const [activeLayer, setActiveLayer] = useState('ndvi'); // 'ndvi' | 'moisture' | 'satellite'
  const [growthStage, setGrowthStage] = useState('current'); // 'sowing' | 'tillering' | 'heading' | 'current'
  const [selectedZone, setSelectedZone] = useState(null);

  // Growth stage telemetry data
  const stageData = {
    sowing: { ndvi: '0.34', moisture: '28%', status: 'Emergence', color: '#84cc16' },
    tillering: { ndvi: '0.56', moisture: '24%', status: 'Active Vegetative', color: '#22c55e' },
    heading: { ndvi: '0.69', moisture: '20%', status: 'Booting / Heading', color: '#16a34a' },
    current: { ndvi: '0.74', moisture: '22%', status: 'Grain Filling (Optimal)', color: '#15803d' },
  };

  const currentData = stageData[growthStage];

  // Colors & Gradients depending on layer
  const getGradientDef = () => {
    if (activeLayer === 'moisture') {
      return (
        <radialGradient id="fieldGradient" cx="45%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#0ea5e9" stopOpacity="0.8" />
          <stop offset="80%" stopColor="#38bdf8" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.5" />
        </radialGradient>
      );
    }
    if (activeLayer === 'satellite') {
      return (
        <radialGradient id="fieldGradient" cx="45%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#4d7c0f" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#3f6212" stopOpacity="0.9" />
          <stop offset="85%" stopColor="#65a30d" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#a16207" stopOpacity="0.75" />
        </radialGradient>
      );
    }
    // NDVI
    if (growthStage === 'sowing') {
      return (
        <radialGradient id="fieldGradient" cx="45%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#a3e635" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0.6" />
        </radialGradient>
      );
    }
    if (growthStage === 'tillering') {
      return (
        <radialGradient id="fieldGradient" cx="45%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#4ade80" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#86efac" stopOpacity="0.65" />
        </radialGradient>
      );
    }
    if (growthStage === 'heading') {
      return (
        <radialGradient id="fieldGradient" cx="45%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#15803d" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#22c55e" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0.7" />
        </radialGradient>
      );
    }
    // current
    return (
      <radialGradient id="fieldGradient" cx="45%" cy="50%" r="65%">
        <stop offset="0%" stopColor="#166534" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#15803d" stopOpacity="0.9" />
        <stop offset="75%" stopColor="#22c55e" stopOpacity="0.85" />
        <stop offset="100%" stopColor="#84cc16" stopOpacity="0.75" />
      </radialGradient>
    );
  };

  return (
    <div className="agritrust-card satellite-map-card">
      {/* Card Header Line */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">
            <span className="sat-pulsing-dot"></span>
            {t('map_category')}
          </div>
          <div className="card-title-main">{t('map_title')}</div>
        </div>
        <div className="parcel-id-badge">
          <span>📍</span>
          <span>{t('map_parcel_badge')}</span>
        </div>
      </div>

      {/* Layer Selection Pill Bar */}
      <div className="map-layer-selector">
        <button
          className={`map-layer-btn ${activeLayer === 'ndvi' ? 'active' : ''}`}
          onClick={() => setActiveLayer('ndvi')}
        >
          <span>🌱</span>
          <span>{t('map_layer_ndvi')}</span>
        </button>
        <button
          className={`map-layer-btn ${activeLayer === 'moisture' ? 'active' : ''}`}
          onClick={() => setActiveLayer('moisture')}
        >
          <span>💧</span>
          <span>{t('map_layer_moisture')}</span>
        </button>
        <button
          className={`map-layer-btn ${activeLayer === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveLayer('satellite')}
        >
          <span>🛰️</span>
          <span>{t('map_layer_satellite')}</span>
        </button>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="satellite-viewport-box">
        <svg
          viewBox="0 0 760 380"
          className="satellite-field-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {getGradientDef()}

            {/* Subtle grid pattern for satellite imagery overlay */}
            <pattern id="satGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </pattern>

            {/* Farm furrows pattern */}
            <pattern id="furrows" width="12" height="12" patternTransform="rotate(25 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="12" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
            </pattern>

            {/* Water canal shimmer */}
            <linearGradient id="canalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Background Earth Terrain */}
          <rect width="760" height="380" fill="#1c2820" />
          <rect width="760" height="380" fill="url(#satGrid)" />

          {/* Neighboring Cadastral Parcels (Context Boundary) */}
          <g opacity="0.35" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3">
            {/* Plot #183 North */}
            <polygon points="60,30 320,20 340,110 50,115" fill="#2d3a30" />
            <text x="170" y="70" fill="#94a3b8" fontSize="11" textAnchor="middle">Plot #183 (Mustard)</text>

            {/* Plot #184/B East */}
            <polygon points="560,90 710,80 730,280 570,300" fill="#243328" />
            <text x="645" y="190" fill="#94a3b8" fontSize="11" textAnchor="middle">Plot #184/B</text>

            {/* Plot #185 South */}
            <polygon points="120,330 480,310 510,370 90,375" fill="#2d3a30" />
            <text x="290" y="350" fill="#94a3b8" fontSize="11" textAnchor="middle">Plot #185 (Sugarcane)</text>
          </g>

          {/* Irrigation Canal Running Across West Ridge */}
          <path
            d="M 20,40 Q 60,160 50,360"
            fill="none"
            stroke="url(#canalGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <text x="35" y="210" fill="#7dd3fc" fontSize="10" transform="rotate(-82 35 210)">Bhadson Feeder Canal</text>

          {/* Farm Tractor Road Along South Boundary */}
          <path
            d="M 60,300 C 220,305 450,295 720,290"
            fill="none"
            stroke="#78716c"
            strokeWidth="5"
            strokeDasharray="8 4"
            opacity="0.6"
          />

          {/* PRIMARY PARCEL: Plot #184/A (Ramesh Patel - 4.2 Acres) */}
          <g id="main-parcel-group">
            {/* Field Polygon Fill */}
            <polygon
              points="100,130 520,100 550,280 140,290"
              fill="url(#fieldGradient)"
              stroke="#4ade80"
              strokeWidth="3.5"
              filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.4))"
              style={{ transition: 'all 0.5s ease', cursor: 'pointer' }}
              onClick={() => setSelectedZone('Center Field (Zone B)')}
            />

            {/* Furrow Texture Overlay */}
            <polygon
              points="100,130 520,100 550,280 140,290"
              fill="url(#furrows)"
              pointerEvents="none"
            />

            {/* Cadastral Survey Boundary Corner Markers */}
            <circle cx="100" cy="130" r="4.5" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
            <circle cx="520" cy="100" r="4.5" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
            <circle cx="550" cy="280" r="4.5" fill="#ffffff" stroke="#15803d" strokeWidth="2" />
            <circle cx="140" cy="290" r="4.5" fill="#ffffff" stroke="#15803d" strokeWidth="2" />

            {/* Interactive Sampling Inspection Pins */}
            {/* Pin 1: West Canal Ridge */}
            <g
              transform="translate(180, 180)"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedZone('Zone A (Near Canal)')}
            >
              <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.2)" />
              <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <text x="0" y="3" fill="#14532d" fontSize="9" fontWeight="bold" textAnchor="middle">A</text>
            </g>

            {/* Pin 2: Center Core Field */}
            <g
              transform="translate(340, 195)"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedZone('Zone B (Core Canopy)')}
            >
              <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.2)" />
              <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <text x="0" y="3" fill="#14532d" fontSize="9" fontWeight="bold" textAnchor="middle">B</text>
            </g>

            {/* Pin 3: East Boundary */}
            <g
              transform="translate(470, 210)"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedZone('Zone C (East Ridge)')}
            >
              <circle cx="0" cy="0" r="14" fill="rgba(255,255,255,0.2)" />
              <circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#16a34a" strokeWidth="2.5" />
              <text x="0" y="3" fill="#14532d" fontSize="9" fontWeight="bold" textAnchor="middle">C</text>
            </g>

            {/* Field Center Label */}
            <rect x="230" y="125" width="220" height="26" rx="13" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.2)" />
            <text x="340" y="142" fill="#ffffff" fontSize="12" fontWeight="600" textAnchor="middle">
              {t('farmer_name_display')} • 4.2 A Wheat
            </text>

            {/* Farmhouse / Tube-well Shed Marker */}
            <g transform="translate(130, 250)">
              <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
              <polygon points="-10,-8 0,-16 10,-8" fill="#ef4444" />
              <text x="18" y="2" fill="#e2e8f0" fontSize="10">Tube-well #3</text>
            </g>
          </g>

          {/* Compass Rose & Scale Bar */}
          <g transform="translate(710, 45)">
            <circle cx="0" cy="0" r="18" fill="rgba(15, 23, 42, 0.6)" stroke="#64748b" strokeWidth="1" />
            <polygon points="0,-14 4,-2 0,0 -4,-2" fill="#ef4444" />
            <polygon points="0,14 4,2 0,0 -4,2" fill="#cbd5e1" />
            <text x="0" y="-16" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">N</text>
          </g>

          {/* Coordinate Watermark */}
          <text x="20" y="365" fill="#64748b" fontSize="10" fontFamily="monospace">
            LAT: 30°42'18.4"N | LON: 76°13'05.1"E | EPSG:4326
          </text>
        </svg>

        {/* Selected Zone Float Badge */}
        {selectedZone && (
          <div className="zone-telemetry-pill">
            <span>🔎 {selectedZone}:</span>
            <strong>
              {activeLayer === 'moisture' ? 'Moisture 23%' : `NDVI ${activeLayer === 'satellite' ? 'Optical Clear' : currentData.ndvi}`}
            </strong>
            <button className="zone-close-btn" onClick={() => setSelectedZone(null)}>✕</button>
          </div>
        )}

        {/* Dynamic Legend Scale */}
        <div className="map-legend-overlay">
          {activeLayer === 'ndvi' ? (
            <div className="legend-scale-row">
              <span className="legend-label">0.2 Sparse</span>
              <div className="legend-gradient-bar ndvi-bar"></div>
              <span className="legend-label">0.8+ Dense Biomass</span>
            </div>
          ) : activeLayer === 'moisture' ? (
            <div className="legend-scale-row">
              <span className="legend-label">10% Dry</span>
              <div className="legend-gradient-bar moisture-bar"></div>
              <span className="legend-label">35% Saturated</span>
            </div>
          ) : (
            <div className="legend-scale-row">
              <span className="legend-label">True-Color Sentinel-2 Optical RGB (10m Resolution)</span>
            </div>
          )}
        </div>
      </div>

      {/* Crop Growth Timeline Scrubber */}
      <div className="crop-timeline-wrapper">
        <div className="crop-timeline-title">{t('map_growth_stage')}</div>
        <div className="crop-timeline-buttons">
          <button
            className={`timeline-step-btn ${growthStage === 'sowing' ? 'active' : ''}`}
            onClick={() => setGrowthStage('sowing')}
          >
            <span className="step-dot"></span>
            <span className="step-label">{t('map_stage_sowing')}</span>
          </button>
          <button
            className={`timeline-step-btn ${growthStage === 'tillering' ? 'active' : ''}`}
            onClick={() => setGrowthStage('tillering')}
          >
            <span className="step-dot"></span>
            <span className="step-label">{t('map_stage_tillering')}</span>
          </button>
          <button
            className={`timeline-step-btn ${growthStage === 'heading' ? 'active' : ''}`}
            onClick={() => setGrowthStage('heading')}
          >
            <span className="step-dot"></span>
            <span className="step-label">{t('map_stage_heading')}</span>
          </button>
          <button
            className={`timeline-step-btn ${growthStage === 'current' ? 'active' : ''}`}
            onClick={() => setGrowthStage('current')}
          >
            <span className="step-dot active-pulse"></span>
            <span className="step-label">{t('map_stage_current')}</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Footer Bar */}
      <div className="map-telemetry-grid">
        <div className="telemetry-metric-box">
          <div className="telemetry-label">{t('map_mean_ndvi')}</div>
          <div className="telemetry-value" style={{ color: currentData.color }}>
            {currentData.ndvi} <span className="telemetry-unit">/ 1.0</span>
          </div>
        </div>

        <div className="telemetry-metric-box">
          <div className="telemetry-label">{t('map_moisture_val')}</div>
          <div className="telemetry-value" style={{ color: '#0284c7' }}>
            {currentData.moisture}
          </div>
        </div>

        <div className="telemetry-metric-box">
          <div className="telemetry-label">{t('map_cloud_cover')}</div>
          <div className="telemetry-value" style={{ color: '#16a34a' }}>
            0% (Clear)
          </div>
        </div>
      </div>

      {/* Orbit Pass Footnote */}
      <div className="card-footer-notice-box" style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '15px' }}>🛰️</span>
        <span>{t('map_pass_date')}</span>
      </div>
    </div>
  );
}
