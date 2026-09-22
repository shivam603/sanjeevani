import React from 'react';

export const ConsentBadge = ({
  status = 'active', // 'active' | 'pending' | 'revoked' | 'expired'
  lenderName = 'State Bank of India',
  validUntil = '2026-10-15',
  scopes = ['credit_score', 'satellite_ndvi'],
}) => {
  const statusConfig = {
    active: { color: '#6ee7b7', bg: 'rgba(52, 211, 153, 0.14)', border: 'rgba(52, 211, 153, 0.35)', label: 'Consent Active', icon: '🔒' },
    pending: { color: '#fde68a', bg: 'rgba(251, 191, 36, 0.14)', border: 'rgba(251, 191, 36, 0.35)', label: 'Consent Requested', icon: '⏳' },
    revoked: { color: '#fca5a5', bg: 'rgba(248, 113, 113, 0.14)', border: 'rgba(248, 113, 113, 0.35)', label: 'Revoked by Farmer', icon: '🚫' },
    expired: { color: '#B7AA9C', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.16)', label: 'Consent Expired', icon: '⌛' },
  };

  const current = statusConfig[status] || statusConfig.active;

  return (
    <div
      className="liquid-glass-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: 'var(--glass-highlight), var(--glass-shadow-sm)',
        borderRadius: 'var(--radius-md)',
        gap: '12px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '1.25rem' }}>{current.icon}</span>
        <div>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {lenderName}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Permissions: {scopes.join(', ')} • Exp: {validUntil}
          </div>
        </div>
      </div>
      <span
        style={{
          fontSize: '0.76rem',
          fontWeight: 600,
          color: current.color,
          background: current.bg,
          padding: '4px 12px',
          borderRadius: 'var(--radius-pill)',
          border: `1px solid ${current.border}`,
          backdropFilter: 'var(--glass-blur-sm)',
          WebkitBackdropFilter: 'var(--glass-blur-sm)',
          boxShadow: 'var(--glass-highlight)',
        }}
      >
        {current.label}
      </span>
    </div>
  );
};

export default ConsentBadge;
