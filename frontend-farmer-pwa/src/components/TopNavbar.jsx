import React, { useState } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function TopNavbar({
  activeTab,
  onSelectTab,
  onTriggerSpeech,
  isSpeaking,
  onLogout,
  user,
}) {
  const { t, currentLang, setCurrentLang } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.label || 'English';

  const farmerName = user?.name || t('farmer_name_display');
  const fpoName = user?.fpo || t('fpo_member_tag');

  return (
    <nav className="agritrust-navbar">
      <div className="agritrust-nav-inner">
        {/* Brand Group */}
        <div className="nav-brand-group" onClick={() => onSelectTab('overview')}>
          <span className="nav-brand-dot"></span>
          <div>
            <div className="nav-brand-title">{t('app_name')}</div>
            <div className="nav-brand-subtitle">{t('brand_subtitle')}</div>
          </div>
        </div>

        {/* Center Menu Links */}
        <ul className="nav-links-menu">
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => onSelectTab('overview')}
            >
              {t('nav_overview')}
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'loans' ? 'active' : ''}`}
              onClick={() => onSelectTab('loans')}
            >
              {t('nav_loans')}
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'consent' ? 'active' : ''}`}
              onClick={() => onSelectTab('consent')}
            >
              {t('nav_consent')}
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'mandi' ? 'active' : ''}`}
              onClick={() => onSelectTab('mandi')}
            >
              {t('nav_mandi')}
            </button>
          </li>
          <li>
            <button
              className={`nav-link-btn ${activeTab === 'support' ? 'active' : ''}`}
              onClick={() => onSelectTab('support')}
            >
              {t('nav_support')}
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
                  minWidth: '170px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setCurrentLang(l.code);
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
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{l.label}</span>
                    {currentLang === l.code && <span style={{ color: '#166534' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Reading Trigger */}
          <button
            className={`nav-voice-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={onTriggerSpeech}
            title={isSpeaking ? t('nav_stop_listen') : t('nav_listen')}
          >
            <span>🔊</span>
            <span>{isSpeaking ? t('nav_stop_listen') : t('nav_listen')}</span>
          </button>

          {/* Profile Badge & Dropdown */}
          <div style={{ position: 'relative' }}>
            <div
              className="nav-profile-badge"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{ cursor: 'pointer' }}
              title="Farmer Profile & Menu"
            >
              <div style={{ textAlign: 'right' }}>
                <div className="nav-profile-name">{farmerName}</div>
                <div className="nav-profile-sub">{fpoName}</div>
              </div>
              <div className="nav-profile-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            </div>

            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1ded3',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: '12px',
                  minWidth: '200px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ borderBottom: '1px solid #e2ece3', paddingBottom: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#132a1b' }}>{farmerName}</div>
                  <div style={{ fontSize: '12px', color: '#5b7362' }}>{fpoName}</div>
                  <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>
                    {t('rl_pill')}
                  </div>
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    style={{
                      background: '#fee2e2',
                      color: '#b91c1c',
                      border: '1px solid #fca5a5',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: '100%',
                    }}
                  >
                    <span>🚪</span>
                    <span>{t('nav_logout')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
