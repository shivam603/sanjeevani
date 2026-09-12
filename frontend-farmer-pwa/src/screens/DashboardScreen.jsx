import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import ScoreGauge from '../components/ScoreGauge';
import SafeBorrowingCard from '../components/SafeBorrowingCard';
import ProfileCompleteness from '../components/ProfileCompleteness';

export default function DashboardScreen({ passport, onRefreshPassport, isRefreshing }) {
  const { t } = useTranslation();
  const [toastMessage, setToastMessage] = useState(null);

  const handleRefresh = async () => {
    if (onRefreshPassport) {
      await onRefreshPassport();
      setToastMessage(t('dash_refreshed_toast'));
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const telemetry = passport?.telemetry || {};

  return (
    <div className="screen-content">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            background: 'linear-gradient(90deg, #059669, #10b981)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          ✨ {toastMessage}
        </div>
      )}

      {/* Screen 1 Hero: Score Gauge Card */}
      <div className="pwa-card pwa-card-emerald">
        <div className="card-header-row">
          <div>
            <div className="card-title-sm">🌾 {t('dash_verified_score')}</div>
            <div className="card-title-main">AgriTrust Passbook</div>
          </div>
          <span className="badge-pill badge-prime">
            {passport?.score_grade || t('dash_grade_prime')}
          </span>
        </div>

        {/* Visual Radial Gauge 0-100 */}
        <ScoreGauge
          score={passport?.agritrust_score ?? 78}
          maxScore={100}
          grade={passport?.score_grade}
        />

        {/* Quick telemetry metrics under gauge */}
        <div
          style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '12px 8px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Crop Risk</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#10b981' }}>
              {passport?.risk_profile?.crop_risk || 'LOW'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Market Risk</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b' }}>
              {passport?.risk_profile?.market_volatility || 'MODERATE'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Climate Shield</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8' }}>
              {passport?.risk_profile?.climate_resilience || 'HIGH'}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Borrowing Range Card */}
      <SafeBorrowingCard
        safeLimit={passport?.safe_limit ?? 150000}
        minLimit={passport?.safe_credit_min ?? 120000}
        maxLimit={passport?.safe_credit_max ?? 185000}
        tenureMonths={passport?.recommended_tenure_months ?? 12}
        loanPurpose={passport?.loan_purpose ?? t('dash_purpose_kcc')}
        repaymentCapacity={passport?.expected_repayment_capacity ?? 195000}
      />

      {/* Profile Completeness & Telemetry Card */}
      <ProfileCompleteness confidence={passport?.data_confidence ?? 0.88} />

      {/* Live Agricultural Telemetry Grid */}
      <div className="pwa-card">
        <div className="card-title-sm" style={{ marginBottom: '10px' }}>
          📡 {t('dash_verified_telemetry')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('dash_telemetry_ndvi')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              {telemetry.ndvi_mean ?? '0.74'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{telemetry.ndvi_status ?? 'Optimal Growth'}</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('dash_telemetry_moisture')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
              {telemetry.moisture_index ? `${Math.round(telemetry.moisture_index * 100)}%` : '45%'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{telemetry.moisture_status ?? 'Adequate Soil Moisture'}</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('dash_telemetry_mandi')}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
              ₹{telemetry.last_mandi_price ?? '2,450'}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{telemetry.mandi_name ?? 'Lasalgaon APMC'}</div>
          </div>

          <div style={{ padding: '10px', background: 'rgba(0,0,0,0.25)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t('dash_telemetry_insurance')}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              Active ✓
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{telemetry.insurance_scheme ?? 'PMFBY Kharif'}</div>
          </div>
        </div>
      </div>

      {/* One-Tap Refresh Button */}
      <button
        type="button"
        className="pwa-btn pwa-btn-primary"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <span>🔄</span>
        <span>{isRefreshing ? t('dash_refreshing') : t('dash_refresh_btn')}</span>
      </button>
    </div>
  );
}
