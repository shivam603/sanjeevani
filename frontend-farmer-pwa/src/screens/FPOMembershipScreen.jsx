import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function FPOMembershipScreen({ passport }) {
  const { t } = useTranslation();
  const telemetry = passport?.telemetry || {};

  const fpoBenefits = [
    { text: t('benefit_fertilizer'), icon: '🧪' },
    { text: t('benefit_cold_storage'), icon: '❄️' },
    { text: t('benefit_group_credit'), icon: '💳' },
    { text: t('benefit_mandi_logistics'), icon: '🚚' },
  ];

  return (
    <div className="screen-content">
      {/* FPO Hero Card */}
      <div className="pwa-card pwa-card-emerald">
        <div className="card-header-row">
          <div>
            <div className="card-title-sm">🌾 {t('fpo_title')}</div>
            <div className="card-title-main" style={{ fontSize: '1.25rem' }}>
              {telemetry.fpo_name || t('fpo_name_default')}
            </div>
          </div>
          <span className="badge-pill badge-prime">
            💎 {t('fpo_tier_badge')}
          </span>
        </div>

        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: '#94a3b8' }}>
          <div>{t('fpo_reg_no')}</div>
          <div>{t('fpo_member_id')}</div>
          <div style={{ color: '#34d399', fontWeight: 600 }}>
            Active Member Tenure: {telemetry.fpo_tenure_years || '2.4'} Years ({telemetry.fpo_verified_cycles || '5'} Verified Seasons)
          </div>
        </div>
      </div>

      {/* Community Standing & Peer Benchmark Card */}
      <div className="pwa-card" style={{ border: '1px solid rgba(56, 189, 248, 0.35)' }}>
        <div className="card-title-sm" style={{ color: '#38bdf8' }}>
          🏆 {t('fpo_standing_title')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '14px 0' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(16, 185, 129, 0.3))',
              border: '2px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
              {t('fpo_standing_metric')}
            </span>
          </div>

          <p style={{ fontSize: '0.86rem', color: '#f1f5f9', lineHeight: 1.4 }}>
            {t('fpo_standing_desc')}
          </p>
        </div>

        <div
          style={{
            padding: '10px 12px',
            background: 'rgba(56, 189, 248, 0.08)',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#cbd5e1',
          }}
        >
          🤝 <strong>Collective Trust Multiplier:</strong> Your active standing boosts your AgriTrust score by <strong>+14 points</strong> compared to standalone non-FPO farmers.
        </div>
      </div>

      {/* Member Privileges & Collective Services */}
      <div className="pwa-card">
        <div className="card-title-sm" style={{ marginBottom: '12px' }}>
          ✨ {t('fpo_benefits_title')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fpoBenefits.map((benefit, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{benefit.icon}</span>
              <span style={{ fontSize: '0.84rem', color: '#f8fafc', fontWeight: 500 }}>
                {benefit.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
