import React from 'react';

export default function DbtSubsidyTrackerCard({ onCallMitra }) {
  return (
    <div className="agritrust-card" style={{ gap: '12px' }}>
      {/* Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🏛️</span>
          <span className="card-category-label">DBT SUBSIDY TRACKER</span>
        </div>

        <span className="green-tag-pill">Verified ✓</span>
      </div>

      {/* Main Headline */}
      <div className="dbt-amount-heading">
        17th हप्ता जमा (₹2,000)
      </div>

      {/* Body Text */}
      <p className="mandi-card-body-text">
        PM-KISAN installment credited into Bank of Baroda (A/C ...4019). Aadhaar e-KYC verified &amp; active on NPCI direct mapper.
      </p>

      {/* Field Mitra Profile Bar */}
      <div className="dbt-mitra-profile-footer">
        <div className="dbt-mitra-identity">
          <div className="dbt-mitra-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div>
            <div className="dbt-mitra-name-text">Sachin Shinde</div>
            <div className="dbt-mitra-role-text">सह्याद्री / खन्ना FPO Field Mitra</div>
          </div>
        </div>

        <button
          className="btn-call-mitra"
          onClick={onCallMitra}
          title="Contact FPO Field Officer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          <span>Call Mitra</span>
        </button>
      </div>
    </div>
  );
}
