import React from 'react';

export default function TopNav({ activeTab, onSelectTab, requestCount = 0, decisionCount = 0 }) {
  const tabs = [
    { id: 'portfolio', label: 'Consented Portfolio', icon: '🔍' },
    { id: 'dossier', label: 'Underwriting Terminal', icon: '📊' },
    { id: 'requests', label: 'Consent Requests', icon: '🔐', badge: requestCount },
    { id: 'decisions', label: 'Decision Audit Log', icon: '📜', badge: decisionCount },
  ];

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
          <div className="institution-pill">
            INSTITUTION: STATE BANK OF INDIA #401
          </div>
          <div className="underwriter-profile">
            <div className="underwriter-name">Vikram Mehta</div>
            <div className="underwriter-role">Lead Agri Underwriter • Maharashtra Hub</div>
          </div>
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
