import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function ProfileCompleteness({ confidence = 0.88 }) {
  const { t } = useTranslation();
  const percentage = Math.round(confidence * 100);

  const verificationItems = [
    { label: 'GIS Land Parcel Survey #184/A', verified: true, icon: '🗺️' },
    { label: 'Sentinel-2 Satellite Biomass (NDVI)', verified: true, icon: '🛰️' },
    { label: 'Lasalgaon APMC Price Benchmarking', verified: true, icon: '📊' },
    { label: 'PMFBY Crop Insurance Shield', verified: true, icon: '🛡️' },
    { label: 'Nashik FPO 2.4-Year Delivery History', verified: true, icon: '🤝' },
  ];

  return (
    <div className="pwa-card">
      <div className="card-header-row">
        <div>
          <div className="card-title-sm">✅ {t('dash_data_confidence')}</div>
          <div className="card-title-main" style={{ fontSize: '1.25rem' }}>
            {percentage}% Verified Telemetry
          </div>
        </div>
        <span className="badge-pill badge-active">
          High Confidence
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', margin: '8px 0 14px' }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #059669, #10b981)',
            borderRadius: '4px',
            transition: 'width 0.8s ease',
          }}
        />
      </div>

      {/* Checklist items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {verificationItems.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              padding: '6px 8px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
            <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>✓</span>
          </div>
        ))}
      </div>
    </div>
  );
}
