import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SafeBorrowingCard({
  safeLimit = 150000,
  minLimit = 120000,
  maxLimit = 185000,
  tenureMonths = 12,
  loanPurpose = 'Kharif Crop Production & Input Financing',
  repaymentCapacity = 195000,
}) {
  const { t } = useTranslation();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="pwa-card">
      <div className="card-header-row">
        <div>
          <div className="card-title-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={16} strokeWidth={2} style={{ color: '#38bdf8' }} />
            <span>{t('dash_borrowing_limit')}</span>
          </div>
          <div className="card-title-main" style={{ fontSize: '1.8rem', color: '#38bdf8' }}>
            {formatCurrency(safeLimit)}
          </div>
        </div>
        <span className="badge-pill" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          {t('dash_recommended_tenure')}: {t('dash_months', { count: tenureMonths })}
        </span>
      </div>

      {/* Borrowing Range Bar */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
          <span>Min: {formatCurrency(minLimit)}</span>
          <span style={{ color: '#34d399', fontWeight: 700 }}>Recommended Limit</span>
          <span>Max: {formatCurrency(maxLimit)}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '0',
              top: '0',
              bottom: '0',
              width: `${Math.round((safeLimit / maxLimit) * 100)}%`,
              background: 'linear-gradient(90deg, #059669, #38bdf8)',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>

      {/* Meta Grid */}
      <div
        style={{
          marginTop: '14px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '10px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('dash_repayment_capacity')}</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            {formatCurrency(repaymentCapacity)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('dash_loan_purpose')}</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px', lineHeight: 1.2 }}>
            {loanPurpose}
          </div>
        </div>
      </div>
    </div>
  );
}
