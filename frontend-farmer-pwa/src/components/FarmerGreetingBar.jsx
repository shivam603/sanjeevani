import React, { useState } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function FarmerGreetingBar({ onPlayAudio, isPlaying, user }) {
  const { t, currentLang, setCurrentLang } = useTranslation();
  const [playbackSpeed, setPlaybackSpeed] = useState('1.0');

  const handleSpeedToggle = (speed) => {
    setPlaybackSpeed(speed);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const handleLangToggle = (langCode) => {
    setCurrentLang(langCode);
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  };

  const farmerName = user?.name || t('farmer_name_display');
  const cropDesc = user?.crop && user?.cluster 
    ? `${user.acreage} ${user.crop} • ${user.cluster}` 
    : t('farmer_crop_desc');

  return (
    <div className="greeting-assistant-bar">
      {/* Farmer Identity */}
      <div className="farmer-identity-section">
        <div className="tractor-icon-box" title={t('fpo_member_tag')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
            <path d="M14 14a5 5 0 1 0 10 0 5 5 0 1 0-10 0" />
            <path d="M6 14h8m-8 0v-4l4-3h4v7" />
            <path d="M14 8h3l2 3v3" />
          </svg>
        </div>

        <div>
          <div className="farmer-greeting-title">
            <span>{t('greeting_salutation')}, {farmerName}</span>
            <span className="fpo-member-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              {t('fpo_member_tag')}
            </span>
          </div>
          <div className="farmer-crop-cluster-sub">
            {cropDesc}
          </div>
        </div>
      </div>

      {/* Vernacular Voice Assistant Floating Media Widget */}
      <div className="audio-assistant-widget">
        {/* Circular Play Button with Soft Translucent Ring */}
        <button
          className="audio-play-circle-btn"
          onClick={() => onPlayAudio(parseFloat(playbackSpeed))}
          aria-label={t('audio_assistant_title')}
          title={t('audio_assistant_sub')}
          style={{
            boxShadow: isPlaying 
              ? '0 0 0 6px rgba(16, 185, 129, 0.28), 0 4px 16px rgba(16, 185, 129, 0.45)' 
              : '0 0 0 4px rgba(16, 185, 129, 0.15), 0 4px 12px rgba(16, 185, 129, 0.3)',
          }}
        >
          {isPlaying ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <div className="audio-label-group">
          <div className="audio-title-row">
            <span style={{ color: '#059669', letterSpacing: '1px' }}>{isPlaying ? 'ılııl' : '▶'}</span>
            <span>Today's Advisory</span>
          </div>
          <div className="audio-subtitle-sub">
            {isPlaying ? 'Playing advisory...' : 'Tap to hear advisory & limits'}
          </div>
        </div>

        {/* Vernacular Language Selector Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(0, 0, 0, 0.03)', padding: '2px 4px', borderRadius: '9999px' }}>
          {[
            { code: 'pa', label: 'ਪੰਜਾਬੀ' },
            { code: 'hi', label: 'हिंदी' },
            { code: 'en', label: 'EN' },
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => handleLangToggle(l.code)}
              style={{
                background: currentLang === l.code ? '#FFFFFF' : 'transparent',
                color: currentLang === l.code ? '#059669' : '#515154',
                fontWeight: currentLang === l.code ? 700 : 500,
                border: 'none',
                borderRadius: '9999px',
                padding: '3px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                boxShadow: currentLang === l.code ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Playback Speed Selectors */}
        <div className="audio-speed-group">
          <button
            className={`audio-speed-pill ${playbackSpeed === '1.0' ? 'active' : ''}`}
            onClick={() => handleSpeedToggle('1.0')}
          >
            1.0x
          </button>
          <button
            className={`audio-speed-pill ${playbackSpeed === '0.8' ? 'active' : ''}`}
            onClick={() => handleSpeedToggle('0.8')}
          >
            0.8x
          </button>
        </div>

        {/* Replay Button */}
        <button
          className="audio-replay-btn"
          onClick={() => onPlayAudio(parseFloat(playbackSpeed))}
          title="Replay Audio"
          aria-label="Replay Audio"
        >
          ↺
        </button>
      </div>
    </div>
  );
}
