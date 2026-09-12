import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function CreditHealthCard({
  score = 78,
  maxScore = 100,
  onOpenSimulator,
  onOpenPassport,
}) {
  const { t } = useTranslation();

  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  return (
    <div className="agritrust-card">
      {/* Category & Title */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">{t('ch_category')}</div>
          <div className="card-title-main">{t('ch_title')}</div>
        </div>

        <div className="status-badge-leaf">
          <span>🍃</span>
          <span>{t('ch_good_standing')}</span>
        </div>
      </div>

      {/* Score Gauge & Reasons Container */}
      <div className="score-gauge-container">
        {/* Circular Ring Gauge */}
        <div className="score-circular-gauge-wrapper">
          <svg width="104" height="104" viewBox="0 0 104 104" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="10"
            />
            {/* Active Green Stroke */}
            <circle
              cx="52"
              cy="52"
              r={radius}
              fill="none"
              stroke="#13532f"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>

          <div className="score-gauge-center-text">
            <span className="score-gauge-number">{score}</span>
            <span className="score-gauge-subtext">{t('ch_score_out_of')}</span>
          </div>
        </div>

        {/* Reasons List */}
        <div className="score-reasons-list">
          <div className="score-reasons-title">{t('ch_reasons_title')}</div>

          <div className="score-reason-item">
            <div className="score-reason-check">✓</div>
            <div>
              <strong>{t('ch_reason_1_bold')}</strong> {t('ch_reason_1_text')}
            </div>
          </div>

          <div className="score-reason-item">
            <div className="score-reason-check">✓</div>
            <div>
              <strong>{t('ch_reason_2_bold')}</strong> {t('ch_reason_2_text')}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons for Simulator & Passport */}
      {(onOpenSimulator || onOpenPassport) && (
        <div className="card-quick-actions-row">
          {onOpenSimulator && (
            <button
              className="card-action-link-btn"
              onClick={onOpenSimulator}
              title={t('sim_title')}
            >
              <span>🚀</span>
              <span>{t('sim_title')}</span>
            </button>
          )}
          {onOpenPassport && (
            <button
              className="card-action-link-btn passport-variant"
              onClick={onOpenPassport}
              title={t('pass_btn_card')}
            >
              <span>📄</span>
              <span>{t('pass_btn_card')}</span>
            </button>
          )}
        </div>
      )}

      {/* No Agent Fees Lightbulb Notice */}
      <div className="card-footer-notice-box">
        <span style={{ fontSize: '15px' }}>💡</span>
        <span>{t('ch_notice')}</span>
      </div>
    </div>
  );
}
