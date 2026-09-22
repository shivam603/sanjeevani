import React from 'react';

export default function CropRiskMatrix({ cropRisk }) {
  if (!cropRisk) return null;

  const metrics = [
    {
      label: 'Climate Resilience',
      score: cropRisk.climate_resilience_score,
      pct: Math.round(cropRisk.climate_resilience_score * 100),
      color: '#10b981',
      desc: 'Sentinel-2 NDVI Phenology & Thermal Stress Resistance',
      invert: false,
    },
    {
      label: 'Pest & Disease Vulnerability',
      score: cropRisk.pest_disease_index,
      pct: Math.round(cropRisk.pest_disease_index * 100),
      color: cropRisk.pest_disease_index > 0.4 ? '#f43f5e' : '#10b981',
      desc: 'Regional Agro-Climatic Pest Vector Tracking',
      invert: true,
    },
    {
      label: 'Water Stress Index',
      score: cropRisk.water_stress_score,
      pct: Math.round(cropRisk.water_stress_score * 100),
      color: cropRisk.water_stress_score > 0.4 ? '#DC2626' : '#0284C7',
      desc: 'NDWI Satellite Moisture & Canal/Borewell Access',
      invert: true,
    },
    {
      label: 'Market Price Volatility',
      score: cropRisk.price_volatility_score,
      pct: Math.round(cropRisk.price_volatility_score * 100),
      color: cropRisk.price_volatility_score > 0.5 ? '#D97706' : '#0284C7',
      desc: 'AGMARKNET 36-Month Historical Standard Deviation',
      invert: true,
    },
  ];

  return (
    <div className="terminal-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <span>🛡️</span> Model C — Crop-Specific Risk Matrix & Geospatial Telemetry
          </h3>
          <p className="card-subtitle">
            Crop: <strong style={{ color: 'var(--text-primary)' }}>{cropRisk.crop_name}</strong> • Multi-factor hazard decomposition
          </p>
        </div>
        <span className={cropRisk.risk_category === 'LOW' ? 'badge-risk-low' : cropRisk.risk_category === 'MODERATE' ? 'badge-risk-moderate' : 'badge-risk-high'}>
          OVERALL RISK: {cropRisk.risk_category} ({(cropRisk.overall_risk_score * 100).toFixed(0)}/100)
        </span>
      </div>

      <div className="risk-matrix-grid">
        {metrics.map((m, idx) => (
          <div key={idx} className="stat-box">
            <div className="risk-bar-header">
              <span className="stat-label">{m.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: m.color }}>
                {m.pct}%
              </span>
            </div>

            <div className="risk-bar-track">
              <div
                className="risk-bar-fill"
                style={{ width: `${m.pct}%`, background: m.color }}
              />
            </div>

            <span className="stat-subtext" style={{ marginTop: '4px' }}>
              {m.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
