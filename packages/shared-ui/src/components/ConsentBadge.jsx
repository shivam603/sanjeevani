import React from 'react';

export const ConsentBadge = ({
  status = 'active', // 'active' | 'pending' | 'revoked' | 'expired'
  lenderName = 'State Bank of India',
  validUntil = '2026-10-15',
  scopes = ['credit_score', 'satellite_ndvi'],
}) => {
  const statusConfig = {
    active: { color: '#10b981', label: 'Consent Active', icon: '🔒' },
    pending: { color: '#f59e0b', label: 'Consent Requested', icon: '⏳' },
    revoked: { color: '#ef4444', label: 'Revoked by Farmer', icon: '🚫' },
    expired: { color: '#94a3b8', label: 'Consent Expired', icon: '⌛' },
  };

  const current = statusConfig[status] || statusConfig.active;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(30, 41, 59, 0.6)',
        border: `1px solid ${current.color}40`,
        borderRadius: '12px',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>{current.icon}</span>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
            {lenderName}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Permissions: {scopes.join(', ')} • Exp: {validUntil}
          </div>
        </div>
      </div>
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: current.color,
          background: `${current.color}15`,
          padding: '4px 10px',
          borderRadius: '20px',
          border: `1px solid ${current.color}30`,
        }}
      >
        {current.label}
      </span>
    </div>
  );
};
