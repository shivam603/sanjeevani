import React from 'react';

export const Header = ({
  appName = 'Sanjeevani',
  portalType = 'Farmer PWA', // 'Farmer PWA' | 'FPO Portal' | 'Lender Dashboard'
  userProfile = { name: 'Rameshwar Patel', role: 'Farmer' },
  statusBadge = null,
}) => {
  return (
    <header
      className="liquid-glass-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 28px',
        background: 'rgba(24, 22, 21, 0.82)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'var(--glass-highlight), var(--glass-shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Specular Shine Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, rgba(52, 91, 138, 0.65) 0%, rgba(84, 30, 13, 0.55) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: 'var(--glass-highlight), 0 4px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          🌾
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.18rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.025em', fontFamily: 'var(--font-display)' }}>
              {appName}
            </span>
            <span
              style={{
                fontSize: '0.70rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(52, 91, 138, 0.25)',
                color: '#93c5fd',
                border: '1px solid rgba(96, 165, 250, 0.35)',
                backdropFilter: 'var(--glass-blur-sm)',
              }}
            >
              {portalType}
            </span>
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
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
            padding: '5px 14px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'var(--glass-blur-sm)',
            WebkitBackdropFilter: 'var(--glass-blur-sm)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: 'var(--glass-highlight)',
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(164, 141, 108, 0.5) 0%, rgba(52, 91, 138, 0.5) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#FFFFFF',
            }}
          >
            {userProfile.name ? userProfile.name[0] : 'U'}
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{userProfile.name}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{userProfile.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
