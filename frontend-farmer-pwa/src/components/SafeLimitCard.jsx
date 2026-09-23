import React from 'react';
import { Volume2, ShieldCheck, CreditCard } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SafeLimitCard({ onSpeakLimit, safeLimit = 165000, minLimit = 120000 }) {
  const { t } = useTranslation();
  const formatINR = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

  return (
    <div className="agritrust-card">
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="card-feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
            <CreditCard size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="card-category-label">{t('sl_category')}</div>
            <div className="card-title-main">{t('sl_title')}</div>
          </div>
        </div>
        <button className="safe-limit-speaker-btn" onClick={onSpeakLimit} title={t('sl_title')} aria-label={t('sl_title')}>
          <Volume2 size={16} strokeWidth={2} />
        </button>
      </div>
      <div className="safe-limit-content-grid">
        <div className="safe-limit-dark-hero-box">
          <div className="safe-limit-headroom-tag">{t('sl_headroom_tag')}</div>
          <div className="safe-limit-amount-hero">{formatINR(safeLimit)} <span>{t('sl_currency_suffix')}</span></div>
          <div className="safe-limit-description-text">{t('sl_desc')}</div>
        </div>
        <div className="safe-limit-progress-section">
          <div className="safe-limit-progress-top-row"><span className="safe-limit-borrowed-label">{t('sl_borrowed_label')}</span><span className="safe-limit-headroom-label">{t('sl_free_label')}</span></div>
          <div className="split-progress-bar-track" role="progressbar" aria-valuenow="27" aria-valuemin="0" aria-valuemax="100"><div className="split-progress-used" style={{ width: '27%' }}></div><div className="split-progress-free" style={{ width: '73%' }}></div></div>
          <div className="safe-limit-progress-bottom-row"><span>{t('sl_used_sub')}</span><span>From {formatINR(minLimit)}</span></div>
        </div>
      </div>
      <div className="card-footer-notice-box"><ShieldCheck size={16} strokeWidth={2} style={{ color: 'var(--brand-green, #15803d)', flexShrink: 0 }} /><span>{t('sl_notice')}</span></div>
    </div>
  );
}
