import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SatelliteFieldMapCard({ user }) {
  const { t } = useTranslation();
  const svgRef = useRef(null);

  // Storage key scoped to user session
  const userId = user?.id || 'ramesh_patel';
  const storageKey = `sanjeevani_farm_fields_${userId}`;

  // Default initial fields (matching Sanjeevani cadastral satellite parcel baseline)
  const initialFields = [
    {
      id: 'field-184a',
      name: 'Field A (Plot #184/A - Main)',
      area: user?.acreage || '4.2 Acres',
      crop: user?.crop || 'Wheat (HD 3086)',
      cropStage: 'Grain Filling',
      healthStatus: 'Healthy', // 'Healthy' | 'Moderate Risk' | 'High Risk'
      ndvi: 0.74,
      moisture: '22%',
      description: 'Primary parcel. Alluvial loam soil irrigated by tube-well #3.',
      polygon: [
        { x: 100, y: 130 },
        { x: 520, y: 100 },
        { x: 550, y: 280 },
        { x: 140, y: 290 },
      ],
      isPrimary: true,
    },
    {
      id: 'field-183',
      name: 'Field B (Plot #183 - North)',
      area: '2.8 Acres',
      crop: 'Mustard (Pusa Bold)',
      cropStage: 'Pod Formation',
      healthStatus: 'Moderate Risk',
      ndvi: 0.62,
      moisture: '18%',
      description: 'Border ridge parcel near north canal feeder. Silty loam.',
      polygon: [
        { x: 60, y: 30 },
        { x: 320, y: 20 },
        { x: 340, y: 110 },
        { x: 50, y: 115 },
      ],
      isPrimary: false,
    },
    {
      id: 'field-185',
      name: 'Field C (Plot #185 - South)',
      area: '3.5 Acres',
      crop: 'Sugarcane (Co 0238)',
      cropStage: 'Grand Growth',
      healthStatus: 'Healthy',
      ndvi: 0.68,
      moisture: '26%',
      description: 'Southern plot with deep furrow irrigation channels.',
      polygon: [
        { x: 120, y: 330 },
        { x: 480, y: 310 },
        { x: 510, y: 370 },
        { x: 90, y: 375 },
      ],
      isPrimary: false,
    },
  ];

  // 1. Persistent Fields State
  const [fields, setFields] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved fields from storage:', e);
    }
    return initialFields;
  });

  // Save fields on update
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(fields));
    } catch (e) {
      console.warn('Failed to persist fields to localStorage:', e);
    }
  }, [fields, storageKey]);

  // 2. Map View & Layers
  const [activeLayer, setActiveLayer] = useState('ndvi'); // 'ndvi' | 'moisture' | 'satellite'
  const [growthStage, setGrowthStage] = useState('current'); // 'sowing' | 'tillering' | 'heading' | 'current'
  const [selectedField, setSelectedField] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  // 3. Location State (GPS / Manual Selection)
  const [farmLocation, setFarmLocation] = useState({
    name: user?.cluster || 'Village Bhadson, Ludhiana Cluster',
    lat: 30.65,
    lon: 76.28,
    isGps: false,
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Auto-check geolocation silently without forcing prompts
  useEffect(() => {
    if ('geolocation' in navigator && navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((perm) => {
        if (perm.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setFarmLocation((prev) => ({
                ...prev,
                lat: Number(pos.coords.latitude.toFixed(4)),
                lon: Number(pos.coords.longitude.toFixed(4)),
                isGps: true,
              }));
            },
            () => {},
            { timeout: 3000 }
          );
        }
      }).catch(() => {});
    }
  }, []);

  // 4. Boundary Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState([]);
  const [calculatedArea, setCalculatedArea] = useState('0.0 Acres');

  // 5. Field Form Modal (Create / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    crop: 'Wheat (HD 3086)',
    cropStage: 'Grain Filling',
    healthStatus: 'Healthy',
    description: '',
  });

  // Calculate polygon area in approximate acres (Shoelace formula scaled to farm canvas)
  const calculatePolygonArea = useCallback((pts) => {
    if (!pts || pts.length < 3) return '0.0 Acres';
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y;
      area -= pts[j].x * pts[i].y;
    }
    const pixelArea = Math.abs(area) / 2;
    // Scale factor: 25,000 pixels ≈ 1 acre on our 760x380 SVG canvas
    const acres = (pixelArea / 25000).toFixed(1);
    return `${Math.max(0.5, parseFloat(acres))} Acres`;
  }, []);

  // Map Canvas Click Handler (Vertex plotting)
  const handleMapClick = (e) => {
    if (!isDrawing || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = 760 / rect.width;
    const scaleY = 380 / rect.height;

    const rawX = Math.round((clientX - rect.left) * scaleX);
    const rawY = Math.round((clientY - rect.top) * scaleY);

    const x = Math.max(15, Math.min(745, rawX));
    const y = Math.max(15, Math.min(365, rawY));

    const updated = [...drawingPoints, { x, y }];
    setDrawingPoints(updated);

    if (updated.length >= 3) {
      setCalculatedArea(calculatePolygonArea(updated));
    }
  };

  // Finish Boundary Drawing
  const handleFinishBoundary = () => {
    if (drawingPoints.length < 3) {
      alert('Please place at least 3 points to complete a field boundary.');
      return;
    }
    const computedArea = calculatePolygonArea(drawingPoints);
    setFormData({
      name: `Field ${String.fromCharCode(65 + fields.length)}`,
      area: computedArea,
      crop: user?.crop || 'Wheat (HD 3086)',
      cropStage: 'Vegetative',
      healthStatus: 'Healthy',
      description: '',
    });
    setEditingFieldId(null);
    setIsFormOpen(true);
  };

  // Undo Last Point
  const handleUndoPoint = (e) => {
    e.stopPropagation();
    if (drawingPoints.length > 0) {
      const updated = drawingPoints.slice(0, -1);
      setDrawingPoints(updated);
      setCalculatedArea(updated.length >= 3 ? calculatePolygonArea(updated) : '0.0 Acres');
    }
  };

  // Clear Points
  const handleClearPoints = (e) => {
    e.stopPropagation();
    setDrawingPoints([]);
    setCalculatedArea('0.0 Acres');
  };

  // Cancel Drawing
  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setDrawingPoints([]);
    setCalculatedArea('0.0 Acres');
  };

  // Save Field Form
  const handleSaveField = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingFieldId) {
      // Edit existing field
      setFields((prev) =>
        prev.map((f) =>
          f.id === editingFieldId
            ? {
                ...f,
                name: formData.name,
                area: formData.area || f.area,
                crop: formData.crop,
                cropStage: formData.cropStage,
                healthStatus: formData.healthStatus,
                description: formData.description,
              }
            : f
        )
      );
      if (selectedField?.id === editingFieldId) {
        setSelectedField((prev) => ({
          ...prev,
          name: formData.name,
          area: formData.area || prev.area,
          crop: formData.crop,
          cropStage: formData.cropStage,
          healthStatus: formData.healthStatus,
          description: formData.description,
        }));
      }
    } else {
      // Create new field from drawing points
      const newField = {
        id: `field-${Date.now()}`,
        name: formData.name,
        area: formData.area || calculatedArea,
        crop: formData.crop,
        cropStage: formData.cropStage,
        healthStatus: formData.healthStatus,
        ndvi: formData.healthStatus === 'Healthy' ? 0.72 : formData.healthStatus === 'Moderate Risk' ? 0.58 : 0.42,
        moisture: formData.healthStatus === 'Healthy' ? '22%' : '15%',
        description: formData.description || 'Newly demarcated field boundary.',
        polygon: drawingPoints,
        isPrimary: false,
      };
      setFields((prev) => [...prev, newField]);
      setSelectedField(newField);
    }

    setIsFormOpen(false);
    setIsDrawing(false);
    setDrawingPoints([]);
    setCalculatedArea('0.0 Acres');
    setEditingFieldId(null);
  };

  // Edit Existing Field
  const handleStartEditField = (field) => {
    setFormData({
      name: field.name,
      area: field.area,
      crop: field.crop,
      cropStage: field.cropStage,
      healthStatus: field.healthStatus,
      description: field.description || '',
    });
    setEditingFieldId(field.id);
    setIsFormOpen(true);
  };

  // Delete Field
  const handleDeleteField = (fieldId) => {
    if (confirm('Are you sure you want to delete this field from your Farm Map?')) {
      setFields((prev) => prev.filter((f) => f.id !== fieldId));
      if (selectedField?.id === fieldId) {
        setSelectedField(null);
      }
    }
  };

  // Pre-configured agricultural cluster locations for manual selection
  const agriClusters = [
    { name: 'Village Bhadson, Ludhiana Cluster (Punjab)', lat: 30.65, lon: 76.28 },
    { name: 'Niphad Taluka, Nashik Hub (Maharashtra)', lat: 19.99, lon: 73.78 },
    { name: 'Gharaunda Farm, Karnal Belt (Haryana)', lat: 29.68, lon: 76.99 },
    { name: 'Daurala Block, Meerut Cluster (Uttar Pradesh)', lat: 28.98, lon: 77.70 },
  ];

  const handleSelectCluster = (c) => {
    setFarmLocation({
      name: c.name,
      lat: c.lat,
      lon: c.lon,
      isGps: false,
    });
    setIsLocationModalOpen(false);
  };

  // SVG Polygon Points String Formatter
  const getPointsString = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');

  // Health Status Visual Indicators
  const getHealthBadge = (status) => {
    switch (status) {
      case 'Healthy':
        return { color: '#16a34a', bg: '#f0fdf4', border: '#86efac', text: 'Healthy', icon: '🟢' };
      case 'Moderate Risk':
        return { color: '#d97706', bg: '#fffbeb', border: '#fcd34d', text: 'Moderate Risk', icon: '🟡' };
      default:
        return { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', text: 'High Risk', icon: '🔴' };
    }
  };

  // Dynamic NDVI / Moisture / Satellite Gradient
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
      {/* 1. Header Bar: Title + Farm Location + Add Field Button */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">
            <span className="sat-pulsing-dot"></span>
            {t('fm_badge')}
          </div>
          <div className="card-title-main">{t('fm_title')}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Farm Location Badge (Clickable for Manual Cluster Change) */}
          <button
            className="parcel-id-badge"
            style={{ cursor: 'pointer', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid #cbd5e1' }}
            onClick={() => setIsLocationModalOpen(true)}
            title="Click to view or switch farm cluster location"
          >
            <span>{farmLocation.isGps ? '📡' : '📍'}</span>
            <span style={{ maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {farmLocation.name.split(',')[0]}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b' }}>▼</span>
          </button>

          {/* Add Field Button */}
          {!isDrawing && (
            <button
              className="btn-consent-allow"
              style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '20px' }}
              onClick={() => {
                setIsDrawing(true);
                setDrawingPoints([]);
                setCalculatedArea('0.0 Acres');
              }}
            >
              {t('fm_draw_boundary')}
            </button>
          )}
        </div>
      </div>

      {/* 2. Drawing Mode Alert Bar */}
      {isDrawing && (
        <div className="fm-drawing-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="sat-pulsing-dot" style={{ backgroundColor: '#f59e0b' }}></span>
            <strong style={{ fontSize: '12.5px', color: '#92400e' }}>{t('fm_drawing_mode')}:</strong>
            <span style={{ fontSize: '12px', color: '#78350f' }}>{t('fm_tap_instructions')}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
              Points: {drawingPoints.length} | Area: {calculatedArea}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button className="ew-pill-btn" onClick={handleUndoPoint} disabled={drawingPoints.length === 0}>
              {t('fm_undo_point')}
            </button>
            <button className="ew-pill-btn" onClick={handleClearPoints} disabled={drawingPoints.length === 0}>
              {t('fm_clear_points')}
            </button>
            <button
              className="btn-consent-allow"
              style={{ padding: '4px 12px', fontSize: '11.5px', borderRadius: '14px' }}
              onClick={handleFinishBoundary}
              disabled={drawingPoints.length < 3}
            >
              {t('fm_finish_boundary')}
            </button>
            <button className="ew-pill-btn" onClick={handleCancelDrawing}>
              {t('fm_cancel_drawing')}
            </button>
          </div>
        </div>
      )}

      {/* 3. Layer Selection Pill Bar */}
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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Fields:</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
            {fields.length}
          </span>
        </div>
      </div>

      {/* 4. Interactive Map Canvas Container */}
      <div
        className={`satellite-viewport-box ${isDrawing ? 'drawing-active' : ''}`}
        style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 760 380"
          className="satellite-field-svg"
          preserveAspectRatio="xMidYMid meet"
          onClick={handleMapClick}
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

          {/* Irrigation Canal Running Across West Ridge */}
          <path
            d="M 20,40 Q 60,160 50,360"
            fill="none"
            stroke="url(#canalGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.85"
          />
          <text x="35" y="210" fill="#7dd3fc" fontSize="10" transform="rotate(-82 35 210)">
            Feeder Canal
          </text>

          {/* Farm Tractor Road */}
          <path
            d="M 60,300 C 220,305 450,295 720,290"
            fill="none"
            stroke="#78716c"
            strokeWidth="5"
            strokeDasharray="8 4"
            opacity="0.6"
          />

          {/* 5. Render All Saved Fields on the Map */}
          {fields.map((f) => {
            const isSelected = selectedField?.id === f.id;
            const healthBadge = getHealthBadge(f.healthStatus);

            // Compute center point for label
            let centerX = 300;
            let centerY = 200;
            if (f.polygon && f.polygon.length > 0) {
              centerX = Math.round(f.polygon.reduce((acc, p) => acc + p.x, 0) / f.polygon.length);
              centerY = Math.round(f.polygon.reduce((acc, p) => acc + p.y, 0) / f.polygon.length);
            }

            return (
              <g key={f.id} className="farm-field-polygon-group">
                {/* Field Polygon */}
                <polygon
                  points={getPointsString(f.polygon)}
                  fill={f.isPrimary ? 'url(#fieldGradient)' : 'rgba(34, 197, 94, 0.25)'}
                  stroke={isSelected ? '#38bdf8' : healthBadge.color}
                  strokeWidth={isSelected ? '4' : '2.5'}
                  strokeDasharray={isSelected ? '6 3' : 'none'}
                  filter="drop-shadow(0px 6px 12px rgba(0,0,0,0.35))"
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: isDrawing ? 'crosshair' : 'pointer',
                  }}
                  onClick={(e) => {
                    if (!isDrawing) {
                      e.stopPropagation();
                      setSelectedField(f);
                    }
                  }}
                />

                {/* Furrows Texture */}
                <polygon
                  points={getPointsString(f.polygon)}
                  fill="url(#furrows)"
                  pointerEvents="none"
                />

                {/* Boundary Vertex Circles */}
                {f.polygon.map((p, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? '5' : '3.5'}
                    fill="#ffffff"
                    stroke={healthBadge.color}
                    strokeWidth="2"
                    pointerEvents="none"
                  />
                ))}

                {/* Field Center Label Tag */}
                <g
                  transform={`translate(${centerX - 70}, ${centerY - 13})`}
                  style={{ cursor: isDrawing ? 'crosshair' : 'pointer' }}
                  onClick={(e) => {
                    if (!isDrawing) {
                      e.stopPropagation();
                      setSelectedField(f);
                    }
                  }}
                >
                  <rect
                    width="140"
                    height="24"
                    rx="12"
                    fill={isSelected ? '#0369a1' : 'rgba(15, 23, 42, 0.85)'}
                    stroke={isSelected ? '#38bdf8' : 'rgba(255,255,255,0.3)'}
                    strokeWidth="1.2"
                  />
                  <text
                    x="70"
                    y="15"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {f.name.split(' ')[0]} {f.name.split(' ')[1] || ''} • {f.area}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 6. Active Drawing Preview (Lines & Vertices) */}
          {isDrawing && drawingPoints.length > 0 && (
            <g className="drawing-preview-group">
              {/* Completed/Closed Polygon Fill Preview if >= 3 pts */}
              {drawingPoints.length >= 3 && (
                <polygon
                  points={getPointsString(drawingPoints)}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              )}

              {/* Connecting Lines */}
              <polyline
                points={getPointsString(drawingPoints)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />

              {/* Plotted Vertices */}
              {drawingPoints.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt.x} cy={pt.y} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x} y={pt.y - 9} fill="#fef3c7" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {idx + 1}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Compass Rose */}
          <g transform="translate(710, 45)">
            <circle cx="0" cy="0" r="18" fill="rgba(15, 23, 42, 0.6)" stroke="#64748b" strokeWidth="1" />
            <polygon points="0,-14 4,-2 0,0 -4,-2" fill="#ef4444" />
            <polygon points="0,14 4,2 0,0 -4,2" fill="#cbd5e1" />
            <text x="0" y="-16" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">N</text>
          </g>

          {/* Coordinate Watermark */}
          <text x="20" y="365" fill="#94a3b8" fontSize="10" fontFamily="monospace">
            LAT: {farmLocation.lat}°N | LON: {farmLocation.lon}°E | EPSG:4326 | {farmLocation.name.split(',')[0]}
          </text>
        </svg>

        {/* Selected Zone or Field Float Pill */}
        {selectedZone && (
          <div className="zone-telemetry-pill">
            <span>🔎 {selectedZone}</span>
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

      {/* 5. Field Details Inspector Drawer / Card */}
      {selectedField && (
        <div className="fm-field-details-box">
          <div className="ew-card-top-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📍</span>
              <div>
                <strong style={{ fontSize: '15px', color: '#1e293b' }}>{selectedField.name}</strong>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {selectedField.area} • {selectedField.crop}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                className="ew-level-badge"
                style={{
                  backgroundColor: getHealthBadge(selectedField.healthStatus).bg,
                  borderColor: getHealthBadge(selectedField.healthStatus).border,
                  color: getHealthBadge(selectedField.healthStatus).color,
                }}
              >
                {getHealthBadge(selectedField.healthStatus).icon} {selectedField.healthStatus}
              </span>
              <button className="zone-close-btn" onClick={() => setSelectedField(null)} style={{ marginLeft: '4px' }}>
                ✕
              </button>
            </div>
          </div>

          <div className="ew-meta-chips" style={{ marginTop: '8px' }}>
            <span className="ew-chip">🌱 Stage: <strong>{selectedField.cropStage}</strong></span>
            <span className="ew-chip">🛰️ NDVI Biomass: <strong>{selectedField.ndvi ?? '0.74'}</strong></span>
            <span className="ew-chip">💧 Soil Moisture: <strong>{selectedField.moisture ?? '22%'}</strong></span>
            <span className="ew-chip">📐 Boundary: <strong>{selectedField.polygon?.length || 4} Corners</strong></span>
          </div>

          {selectedField.description && (
            <div className="ew-detail-block" style={{ marginTop: '8px' }}>
              <div className="ew-detail-label"><span>📝</span> Notes:</div>
              <div className="ew-detail-text">{selectedField.description}</div>
            </div>
          )}

          {/* Action Toolbar for Field */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button className="ew-pill-btn" onClick={() => handleStartEditField(selectedField)}>
              {t('fm_edit_btn')}
            </button>
            <button
              className="ew-pill-btn"
              style={{ color: '#b91c1c', borderColor: '#fca5a5' }}
              onClick={() => handleDeleteField(selectedField.id)}
            >
              {t('fm_delete_btn')}
            </button>
          </div>
        </div>
      )}

      {/* 6. Saved Fields Quick Selector Bar */}
      <div className="ew-field-tabs" style={{ marginTop: '4px' }}>
        {fields.map((f) => {
          const badge = getHealthBadge(f.healthStatus);
          const isSelected = selectedField?.id === f.id;
          return (
            <button
              key={f.id}
              className={`ew-tab-btn ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedField(isSelected ? null : f)}
            >
              <span>{badge.icon}</span>
              <span>{f.name.split(' ')[0]} {f.name.split(' ')[1] || ''}</span>
              <span style={{ fontSize: '10.5px', opacity: 0.8 }}>({f.area})</span>
            </button>
          );
        })}
      </div>

      {/* 7. Field Creation / Edit Modal */}
      {isFormOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="agritrust-card fm-modal-content" style={{ maxWidth: '440px', width: '92%', gap: '12px' }}>
            <div className="card-header-line">
              <strong style={{ fontSize: '16px', color: '#1e293b' }}>
                {editingFieldId ? t('fm_edit_btn') : t('fm_save_btn')}
              </strong>
              <button className="zone-close-btn" onClick={() => setIsFormOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveField} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="mandi-filter-label">{t('fm_field_name')}:</label>
                <input
                  type="text"
                  className="mandi-filter-select"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('fm_field_name_placeholder')}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="mandi-filter-label">{t('fm_area')}:</label>
                  <input
                    type="text"
                    className="mandi-filter-select"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mandi-filter-label">{t('fm_crop')}:</label>
                  <select
                    className="mandi-filter-select"
                    value={formData.crop}
                    onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  >
                    <option value="Wheat (HD 3086)">Wheat (HD 3086)</option>
                    <option value="Mustard (Pusa Bold)">Mustard (Pusa Bold)</option>
                    <option value="Paddy / Rice (PR 126)">Paddy / Rice (PR 126)</option>
                    <option value="Sugarcane (Co 0238)">Sugarcane (Co 0238)</option>
                    <option value="Cotton (BT)">Cotton (BT)</option>
                    <option value="Maize (Hybrid)">Maize (Hybrid)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="mandi-filter-label">{t('fm_stage')}:</label>
                  <select
                    className="mandi-filter-select"
                    value={formData.cropStage}
                    onChange={(e) => setFormData({ ...formData, cropStage: e.target.value })}
                  >
                    <option value="Sowing / Emergence">Sowing / Emergence</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Tillering">Tillering</option>
                    <option value="Heading / Flowering">Heading / Flowering</option>
                    <option value="Grain Filling">Grain Filling</option>
                    <option value="Maturity / Harvest">Maturity / Harvest</option>
                  </select>
                </div>

                <div>
                  <label className="mandi-filter-label">Health & Risk Status:</label>
                  <select
                    className="mandi-filter-select"
                    value={formData.healthStatus}
                    onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                  >
                    <option value="Healthy">🟢 Healthy</option>
                    <option value="Moderate Risk">🟡 Moderate Risk</option>
                    <option value="High Risk">🔴 High Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mandi-filter-label">{t('fm_description')}:</label>
                <textarea
                  className="mandi-filter-select"
                  style={{ height: '65px', resize: 'none', fontFamily: 'inherit' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('fm_description_placeholder')}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button type="button" className="ew-pill-btn" onClick={() => setIsFormOpen(false)}>
                  {t('fm_cancel_drawing')}
                </button>
                <button type="submit" className="btn-consent-allow">
                  {t('fm_save_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Location Selector Modal (GPS vs Regional Clusters) */}
      {isLocationModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="agritrust-card fm-modal-content" style={{ maxWidth: '420px', width: '92%', gap: '14px' }}>
            <div className="card-header-line">
              <strong style={{ fontSize: '16px', color: '#1e293b' }}>{t('fm_change_location')}</strong>
              <button className="zone-close-btn" onClick={() => setIsLocationModalOpen(false)}>✕</button>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Select a regional agricultural cluster or enable device GPS to view satellite telemetry.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {agriClusters.map((cluster) => (
                <button
                  key={cluster.name}
                  className="mandi-price-card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    padding: '10px 14px',
                    borderColor: farmLocation.name === cluster.name ? '#15803d' : '#e2e8f0',
                    backgroundColor: farmLocation.name === cluster.name ? '#f0fdf4' : '#ffffff',
                  }}
                  onClick={() => handleSelectCluster(cluster)}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>📍 {cluster.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Coords: {cluster.lat}°N, {cluster.lon}°E
                  </div>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="ew-pill-btn" onClick={() => setIsLocationModalOpen(false)}>
                {t('fm_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="card-footer-notice-box" style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '15px' }}>🛰️</span>
        <span>{t('map_pass_date')}</span>
      </div>
    </div>
  );
}
