import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function RabiLoanHeroCard({ onRequestLoan }) {
  const { t } = useTranslation();

  return (
    <div className="agritrust-card rabi-loan-card">
      {/* Environmental Agricultural Wheat Photograph with Soft Masking */}
      <div className="rabi-hero-banner-image">
        <div className="rabi-hero-overlay"></div>
        <div className="rabi-hero-content">
          <div className="rabi-pill-tag">{t('rl_pill')}</div>
          <div className="rabi-hero-headline">{t('rl_headline')}</div>
        </div>
      </div>

      {/* Inner Card Body with Connected Floating Financial Object */}
      <div className="rabi-loan-inner-body">
        {/* Visually Connected Glass Information Composition */}
        <div className="rabi-stats-trio-grid">
          <div className="rabi-stat-box">
            <span className="rabi-stat-label">{t('rl_sanctioned_label')}</span>
            <span className="rabi-stat-val" style={{ color: '#1D1D1F' }}>{t('rl_sanctioned_val')}</span>
            <span className="rabi-stat-sub">{t('rl_sanctioned_sub')}</span>
          </div>

          <div className="rabi-stat-box">
            <span className="rabi-stat-label">{t('rl_rate_label')}</span>
            <span className="rabi-stat-val" style={{ color: '#059669' }}>{t('rl_rate_val')}</span>
            <span className="rabi-stat-sub">{t('rl_rate_sub')}</span>
          </div>

          <div className="rabi-stat-box">
            <span className="rabi-stat-label">{t('rl_tenure_label')}</span>
            <span className="rabi-stat-val" style={{ color: '#1D1D1F' }}>{t('rl_tenure_val')}</span>
            <span className="rabi-stat-sub">{t('rl_tenure_sub')}</span>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="rabi-loan-bottom-action-bar">
          <div className="rabi-dbt-instant-note">
            <CheckCircle2 size={16} strokeWidth={2.2} style={{ color: '#10B981', flexShrink: 0 }} />
            <span>{t('rl_dbt_note')}</span>
          </div>

          <button
            className="rabi-request-loan-btn"
            onClick={onRequestLoan}
            title={t('rl_btn_request')}
          >
            <span>{t('rl_btn_request')}</span>
            <ArrowRight size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Regulatory Distinction Footnote */}
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '10px', lineHeight: 1.35, borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '8px' }}>
          <strong>Notice:</strong> Preliminary eligibility assessment based on sovereign score. Final sanction & disbursal are determined exclusively by authorized partner bank underwriting.
        </div>
      </div>
    </div>
  );
}
