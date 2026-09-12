import React from 'react';

export default function TopNav({ activeTab, onSelectTab, fpoName, fpoRegion, pendingAttestationCount = 0 }) {
  const tabs = [
    { id: 'overview', label: 'Portfolio Overview', icon: '📊' },
    { id: 'members', label: 'Member Management', icon: '👥' },
    { id: 'attestation', label: 'Production Attestation', icon: '⚖️', badge: pendingAttestationCount },
    { id: 'financing', label: 'Bulk Financing Negotiation', icon: '🏛️' },
  ];

  return (
    <header className="portal-header">
      {/* Brand & Organization Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.35rem',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          🌾
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
              {fpoName || 'Nashik Green Agro FPO'}
            </h1>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              FPO Admin
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {fpoRegion || 'Nashik, Maharashtra'} • CIN: U01409MH2021PTC362810 • 482 Members
          </div>
        </div>
      </div>

      {/* Screen Navigation Tabs */}
      <nav className="portal-nav-tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`portal-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span
                  style={{
                    background: '#f59e0b',
                    color: '#090d16',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    marginLeft: '4px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
