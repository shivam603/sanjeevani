import React from 'react';

export default function TopNav({
  activeTab,
  onSelectTab,
  requestCount = 0,
  decisionCount = 0,
  lenderUser,
  onLogout,
}) {
  const tabs = [
    { id: 'portfolio', label: 'Consented Portfolio', icon: '🔍' },
    { id: 'dossier', label: 'Underwriting Terminal', icon: '📊' },
    { id: 'requests', label: 'Consent Requests', icon: '🔐', badge: requestCount },
    { id: 'decisions', label: 'Decision Audit Log', icon: '📜', badge: decisionCount },
  ];

  const institutionLabel = lenderUser?.institutionName
    ? `${(lenderUser.lenderType || 'BANK').toUpperCase()}: ${lenderUser.institutionName}`
    : 'INSTITUTION: STATE BANK OF INDIA #401';
  const officerName = lenderUser?.officerName || 'Vikram Mehta';
  const officerRole = lenderUser?.officerRole || 'Lead Agri Underwriter • Maharashtra Hub';

  return (
    <header className="lender-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-logo-badge">SANJEEVANI</div>
          <div>
            <h1 className="brand-title">Sanjeevani • Institutional Underwriting</h1>
            <p className="brand-subtitle">Consent-Gated Agricultural Credit Intelligence Terminal</p>
          </div>
        </div>

        <div className="user-desk-section">
          <a
            href="http://localhost:3000"
            className="lender-external-portal-btn"
            title="Switch to Farmer Portal"
            style={{ marginRight: '8px' }}
          >
            <span>🌾 Farmer Portal</span>
            <span>↗</span>
          </a>

          <div className="institution-pill">
            {institutionLabel}
          </div>
          <div className="underwriter-profile">
            <div className="underwriter-name">{officerName}</div>
            <div className="underwriter-role">{officerRole}</div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="lender-logout-btn"
              title="Log out of terminal"
            >
              Log Out
            </button>
          )}
        </div>
      </div>

      <div className="nav-tabs-bar">
        <div className="nav-tabs-inner">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {Boolean(tab.badge) && <span className="tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
