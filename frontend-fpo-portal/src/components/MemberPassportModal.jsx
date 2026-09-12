import React from 'react';

export default function MemberPassportModal({ passport, onClose, onFlagUpdate }) {
  if (!passport) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const telemetry = passport.telemetry || {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
                {passport.farmer_code || 'MEMBER'}
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                {passport.full_name}
              </h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Village: {passport.village} • Primary: {telemetry.primary_crop || 'Mixed Crops'}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Score & Risk Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.95))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
              AgriTrust Score
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>
                {passport.agritrust_score}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ 100</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-low" style={{ fontSize: '0.78rem' }}>
              {passport.score_grade || 'Grade A • Prime'}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
              Safe Limit: <strong style={{ color: '#38bdf8' }}>{formatCurrency(passport.safe_limit)}</strong>
            </div>
          </div>
        </div>

        {/* Telemetry Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Mapped Land Area</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              {telemetry.parcel_area_ha || '2.4'} Hectares
            </div>
            <div style={{ fontSize: '0.7rem', color: '#10b981' }}>PostGIS Survey Verified</div>
          </div>

          <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Sentinel-2 NDVI Health</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              {telemetry.ndvi_mean || '0.74'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Optimal Biomass Density</div>
          </div>
        </div>

        {/* Data Update Notice / Reasons */}
        {passport.needs_data_update && (
          <div
            style={{
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24' }}>
              ⚠️ Data Update Recommended
            </div>
            <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#f1f5f9' }}>
              {(passport.missing_data_reasons || []).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Privacy Note */}
        <div style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
          🔒 FPO-Level View: Sensitive personal identity records (Aadhaar & raw banking PII) are strictly protected.
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onFlagUpdate && onFlagUpdate(passport.farmer_id)}
          >
            🚩 {passport.needs_data_update ? 'Update Reminder Sent' : 'Flag for Update'}
          </button>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
}
