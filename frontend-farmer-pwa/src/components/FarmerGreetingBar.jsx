import React, { useState } from 'react';
import { Check, Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function FarmerGreetingBar({
  onPlayAudio,
  isPlaying,
  user,
  fields = [],
  activeFieldId,
  onSelectField,
  onOpenOnboarding,
}) {
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
            <span className="fpo-member-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Check size={11} strokeWidth={2.5} />
              <span>{t('fpo_member_tag')}</span>
            </span>
          </div>
          <div className="farmer-crop-cluster-sub">
            {cropDesc}
          </div>

          {/* Interactive Field Parcel Switcher (Single Source of Truth) */}
          {fields && fields.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Field Parcel:</span>
              {fields.map((f) => {
                const isSelected = f.id === activeFieldId;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelectField && onSelectField(f.id)}
                    style={{
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      color: isSelected ? '#065f46' : '#475569',
                      border: `1.5px solid ${isSelected ? '#10b981' : '#e2e8f0'}`,
                      borderRadius: '999px',
                      padding: '3px 10px',
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 800 : 500,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: isSelected ? '0 1px 3px rgba(16, 185, 129, 0.2)' : 'none',
                    }}
                  >
                    <span>{f.name.split('(')[0].trim()}</span>
                    <span style={{ opacity: 0.8, fontSize: '10.5px' }}>• {f.crop.split('(')[0].trim()}</span>
                  </button>
                );
              })}
              {onOpenOnboarding && (
                <button
                  type="button"
                  onClick={onOpenOnboarding}
                  style={{
                    background: 'none',
                    border: '1px dashed #10b981',
                    borderRadius: '999px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    color: '#059669',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Add new field parcel"
                >
                  + Add Field
                </button>
              )}
            </div>
          )}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isPlaying ? (
            <Pause size={15} strokeWidth={2.4} fill="currentColor" />
          ) : (
            <Play size={15} strokeWidth={2.4} fill="currentColor" style={{ marginLeft: '2px' }} />
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
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <RotateCcw size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
