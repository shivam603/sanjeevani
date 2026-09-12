import React from 'react';

export const Header = ({
  appName = 'Sanjeevani',
  portalType = 'Farmer PWA', // 'Farmer PWA' | 'FPO Portal' | 'Lender Dashboard'
  userProfile = { name: 'Rameshwar Patel', role: 'Farmer' },
  statusBadge = null,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          🌾
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              {appName}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              {portalType}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Agricultural Credit Intelligence Engine
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {statusBadge}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '30px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            {userProfile.name ? userProfile.name[0] : 'U'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>{userProfile.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{userProfile.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
