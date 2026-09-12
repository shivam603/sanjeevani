import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SafeLimitCard({ onSpeakLimit }) {
  const { t } = useTranslation();

  return (
    <div className="agritrust-card">
      {/* Category & Title with Speaker button */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">{t('sl_category')}</div>
          <div className="card-title-main">{t('sl_title')}</div>
        </div>

        <button
          className="safe-limit-speaker-btn"
          onClick={onSpeakLimit}
          title={t('sl_title')}
          aria-label={t('sl_title')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        </button>
      </div>

      {/* Dark Forest Green Hero Box */}
      <div className="safe-limit-dark-hero-box">
        <div className="safe-limit-headroom-tag">{t('sl_headroom_tag')}</div>
        <div className="safe-limit-amount-hero">
          ₹1,65,000 <span>{t('sl_currency_suffix')}</span>
        </div>
        <div className="safe-limit-description-text">
          {t('sl_desc')}
        </div>
      </div>

      {/* Sub-bar Progress Section */}
      <div className="safe-limit-progress-section">
        <div className="safe-limit-progress-top-row">
          <span className="safe-limit-borrowed-label">{t('sl_borrowed_label')}</span>
          <span className="safe-limit-headroom-label">{t('sl_free_label')}</span>
        </div>

        {/* Dual Split Bar (27% used, 73% free capacity) */}
        <div className="split-progress-bar-track" role="progressbar" aria-valuenow="27" aria-valuemin="0" aria-valuemax="100">
          <div className="split-progress-used" style={{ width: '27%' }}></div>
          <div className="split-progress-free" style={{ width: '73%' }}></div>
        </div>

        <div className="safe-limit-progress-bottom-row">
          <span>{t('sl_used_sub')}</span>
          <span>{t('sl_cap_sub')}</span>
        </div>
      </div>

      {/* Bottom Shield Notice */}
      <div className="card-footer-notice-box">
        <span style={{ fontSize: '15px' }}>🛡️</span>
        <span>{t('sl_notice')}</span>
      </div>
    </div>
  );
}
