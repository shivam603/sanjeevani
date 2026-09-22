import React, { useState } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function TopNavbar({
  activeTab,
  onSelectTab,
  onTriggerSpeech,
  isSpeaking,
  onLogout,
  user,
  onOpenPassport,
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
          {/* Switch to Lender Underwriting Desk */}
          <a
            href="http://localhost:3002"
            className="nav-portal-switch-btn"
            title="Switch to Institutional Lender Underwriting Desk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>🏦</span>
            <span>Lender Desk</span>
            <span style={{ fontSize: '10px' }}>↗</span>
          </a>

          {/* 1-Click Credit Passport Button */}
          {onOpenPassport && (
            <button
              className="nav-passport-btn"
              onClick={onOpenPassport}
              title={t('pass_btn_nav')}
            >
              <span>📄</span>
              <span className="passport-btn-text">{t('pass_btn_nav')}</span>
            </button>
          )}

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
                  top: '115%',
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'var(--glass-blur-lg)',
                  WebkitBackdropFilter: 'var(--glass-blur-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  boxShadow: 'var(--glass-highlight-prominent), 0 16px 36px rgba(30, 41, 59, 0.12)',
                  padding: '8px',
                  minWidth: '180px',
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
                      background: currentLang === l.code ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      color: currentLang === l.code ? '#059669' : '#1D1D1F',
                      fontWeight: currentLang === l.code ? '700' : '500',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '8px 14px',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all var(--transition-glass-fast)',
                    }}
                  >
                    <span>{l.label}</span>
                    {currentLang === l.code && <span style={{ color: '#059669', fontWeight: 800 }}>✓</span>}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.94)',
                  backdropFilter: 'var(--glass-blur-lg)',
                  WebkitBackdropFilter: 'var(--glass-blur-lg)',
                  border: '1px solid rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  boxShadow: 'var(--glass-highlight-prominent), 0 16px 36px rgba(30, 41, 59, 0.12)',
                  padding: '14px',
                  minWidth: '220px',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#1D1D1F', fontSize: '14px' }}>{farmerName}</div>
                  <div style={{ fontSize: '12px', color: '#515154' }}>{fpoName}</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                    {t('rl_pill')}
                  </div>
                </div>

                {onOpenPassport && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenPassport();
                    }}
                    style={{
                      background: 'rgba(16, 185, 129, 0.10)',
                      color: '#059669',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      transition: 'all var(--transition-glass-fast)',
                    }}
                  >
                    <span>📄</span>
                    <span>{t('pass_btn_nav')}</span>
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#DC2626',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      transition: 'all var(--transition-glass-fast)',
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
