import React, { useState } from 'react';

export default function TopNavbar({
  activeTab,
  onSelectTab,
  currentLang,
  onSelectLang,
  onTriggerSpeech,
  isSpeaking,
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
  ];

  const currentLangLabel = languages.find((l) => l.code === currentLang)?.label || 'English';

  return (
    <nav className="agritrust-navbar">
      <div className="agritrust-nav-inner">
        {/* Brand Group */}
        <div className="nav-brand-group" onClick={() => onSelectTab('overview')}>
          <span className="nav-brand-dot"></span>
          <div>
            <div className="nav-brand-title">AgriTrust</div>
            <div className="nav-brand-subtitle">कृषि साख एवं संप्रभु विश्वास</div>
          </div>
        </div>

        {/* Center Menu Links */}
        <ul className="nav-links-menu">
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => onSelectTab('overview')}
            >
              Overview
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'loans' ? 'active' : ''}`}
              onClick={() => onSelectTab('loans')}
            >
              My Loans & Safe Limit
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'consent' ? 'active' : ''}`}
              onClick={() => onSelectTab('consent')}
            >
              Sovereign Data Vault / Consent
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'mandi' ? 'active' : ''}`}
              onClick={() => onSelectTab('mandi')}
            >
              Mandi & Weather
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => onSelectTab('support')}
            >
              Support
            </button>
          </li>
        </ul>

        {/* Right Tools */}
        <div className="nav-right-tools">
          {/* Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="nav-lang-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              aria-label="Select Language"
            >
              <span>🌐</span>
              <span>{currentLangLabel.split(' ')[0]}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {showLangMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1ded3',
                  borderRadius: '10px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: '6px',
                  minWidth: '160px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onSelectLang(l.code);
                      setShowLangMenu(false);
                    }}
                    style={{
                      background: currentLang === l.code ? '#e2f2e5' : 'transparent',
                      color: currentLang === l.code ? '#13532f' : '#334155',
                      fontWeight: currentLang === l.code ? '700' : '500',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Reading Trigger */}
          <button
            className={`nav-voice-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={onTriggerSpeech}
            title="Listen to today's summary"
          >
            <span>🔊</span>
            <span>{isSpeaking ? 'थांबवा (Stop)' : 'बोलकर सुनें'}</span>
          </button>

          {/* Profile Badge */}
          <div className="nav-profile-badge">
            <div style={{ textAlign: 'right' }}>
              <div className="nav-profile-name">Ramesh Patel</div>
              <div className="nav-profile-sub">Khanna FPO</div>
            </div>
            <div className="nav-profile-avatar" title="Farmer Profile">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
