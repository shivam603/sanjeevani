import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function RabiLoanHeroCard({ onRequestLoan }) {
  const { t } = useTranslation();

  return (
    <div className="agritrust-card rabi-loan-card">
      {/* Top Banner with Real Wheat Field Photograph & Overlay */}
      <div className="rabi-hero-banner-image">
        <div className="rabi-hero-overlay"></div>
        <div className="rabi-hero-content">
          <div className="rabi-pill-tag">{t('rl_pill')}</div>
          <div className="rabi-hero-headline">{t('rl_headline')}</div>
        </div>
      </div>

      {/* Inner Card Body */}
      <div className="rabi-loan-inner-body">
        {/* Trio Stat Grid */}
        <div className="rabi-stats-trio-grid">
          <div className="rabi-stat-box">
            <span className="rabi-stat-label">{t('rl_sanctioned_label')}</span>
            <span className="rabi-stat-val">{t('rl_sanctioned_val')}</span>
            <span className="rabi-stat-sub">{t('rl_sanctioned_sub')}</span>
          </div>

          <div className="rabi-stat-box">
            <span className="rabi-stat-label">{t('rl_rate_label')}</span>
            <span className="rabi-stat-val">{t('rl_rate_val')}</span>
            <span className="rabi-stat-sub">{t('rl_rate_sub')}</span>
          </div>

          <div className="rabi-stat-box">
            <span className="rabi-stat-label">{t('rl_tenure_label')}</span>
            <span className="rabi-stat-val">{t('rl_tenure_val')}</span>
            <span className="rabi-stat-sub">{t('rl_tenure_sub')}</span>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="rabi-loan-bottom-action-bar">
          <div className="rabi-dbt-instant-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#15803d">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>{t('rl_dbt_note')}</span>
          </div>

          <button
            className="rabi-request-loan-btn"
            onClick={onRequestLoan}
            title={t('rl_btn_request')}
          >
            <span>{t('rl_btn_request')}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
