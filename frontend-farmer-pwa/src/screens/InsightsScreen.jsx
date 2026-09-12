import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function InsightsScreen({ passport, onNavigateTab }) {
  const { t } = useTranslation();
  const explanation = passport?.explanation || {};

  const positiveDrivers = explanation.positive_drivers || [
    t('driver_yield_consistency'),
    t('driver_fpo_tenure'),
    t('driver_ndvi_health'),
    t('driver_pmfby_active'),
  ];

  const actionablePrompts = explanation.actionable_prompts || [
    { text: t('prompt_upload_mandi'), tab: 'upload' },
    { text: t('prompt_verify_gps'), tab: 'upload' },
    { text: t('prompt_renew_insurance'), tab: 'upload' },
  ];

  return (
    <div className="screen-content">
      {/* Header Card */}
      <div className="pwa-card pwa-card-emerald">
        <div className="card-title-sm">💡 {t('insights_title')}</div>
        <div className="card-title-main" style={{ fontSize: '1.25rem' }}>
          Transparent AI Explanation
        </div>
        <p className="card-desc" style={{ marginTop: '8px' }}>
          {explanation.summary || t('insights_subtitle')}
        </p>
      </div>

      {/* Positive Impact Drivers */}
      <div className="pwa-card">
        <div className="card-title-sm" style={{ color: '#34d399', marginBottom: '10px' }}>
          🌟 {t('insights_positive_header')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {positiveDrivers.map((driver, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
              }}
            >
              <span style={{ fontSize: '1.1rem', marginTop: '2px' }}>✅</span>
              <div style={{ fontSize: '0.86rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                {driver}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Improvement Prompts */}
      <div className="pwa-card" style={{ border: '1px solid rgba(56, 189, 248, 0.3)' }}>
        <div className="card-title-sm" style={{ color: '#38bdf8', marginBottom: '10px' }}>
          🚀 {t('insights_action_header')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {actionablePrompts.map((promptItem, idx) => {
            const promptText = typeof promptItem === 'string' ? promptItem : promptItem.text;
            const targetTab = typeof promptItem === 'string' ? 'upload' : (promptItem.tab || 'upload');

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>📈</span>
                  <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 600, lineHeight: 1.4 }}>
                    {promptText}
                  </div>
                </div>

                <button
                  type="button"
                  className="pwa-btn pwa-btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    minHeight: '38px',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    color: '#38bdf8',
                    alignSelf: 'flex-end',
                    width: 'auto',
                  }}
                  onClick={() => onNavigateTab && onNavigateTab(targetTab)}
                >
                  {t('insights_action_btn')} →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
