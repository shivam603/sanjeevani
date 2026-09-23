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
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  return (
    <div className="agritrust-card credit-health-card-unified">
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

      {/* Dominant Score Module with Luminous Glow */}
      <div className="score-gauge-container">
        {/* Circular Ring Gauge */}
        <div className="score-circular-gauge-wrapper" style={{ width: '116px', height: '116px' }}>
          <svg width="116" height="116" viewBox="0 0 116 116" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', display: 'block' }}>
            <defs>
              <linearGradient id="scoreGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="60%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
              <filter id="scoreGaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10B981" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Background Track */}
            <circle
              cx="58"
              cy="58"
              r={radius}
              fill="none"
              stroke="rgba(16, 185, 129, 0.12)"
              strokeWidth="11"
            />
            {/* Active Luminous Emerald Stroke */}
            <circle
              cx="58"
              cy="58"
              r={radius}
              fill="none"
              stroke="url(#scoreGaugeGrad)"
              strokeWidth="11"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#scoreGaugeGlow)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          </svg>

          <div className="score-gauge-center-text" style={{ position: 'absolute', top: 0, left: 0, width: '116px', height: '116px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', margin: 0, padding: 0 }}>
            <span className="score-gauge-number" style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1, margin: 0, padding: 0, textAlign: 'center' }}>{score}</span>
            <span className="score-gauge-subtext" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1, marginTop: '4px', textAlign: 'center', whiteSpace: 'nowrap' }}>{t('ch_score_out_of')}</span>
          </div>
        </div>

        {/* Reasons List with +12 Monthly Growth Pill */}
        <div className="score-reasons-list">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div className="score-reasons-title">{t('ch_reasons_title')}</div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '9999px' }}>
              +12 this month
            </span>
          </div>

          <div className="score-reason-item">
            <div className="score-reason-check">✓</div>
            <div>
              <strong style={{ color: '#1D1D1F' }}>{t('ch_reason_1_bold')}</strong> {t('ch_reason_1_text')}
            </div>
          </div>

          <div className="score-reason-item">
            <div className="score-reason-check">✓</div>
            <div>
              <strong style={{ color: '#1D1D1F' }}>{t('ch_reason_2_bold')}</strong> {t('ch_reason_2_text')}
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
              <span>What-If Score & Limit Booster</span>
            </button>
          )}
          {onOpenPassport && (
            <button
              className="card-action-link-btn passport-variant"
              onClick={onOpenPassport}
              title={t('pass_btn_card')}
            >
              <span>📄</span>
              <span>Official Bank Passport &gt;</span>
            </button>
          )}
        </div>
      )}

      {/* No Agent Fees Notice */}
      <div className="card-footer-notice-box">
        <span style={{ fontSize: '15px' }}>💡</span>
        <span>{t('ch_notice')}</span>
      </div>
    </div>
  );
}
