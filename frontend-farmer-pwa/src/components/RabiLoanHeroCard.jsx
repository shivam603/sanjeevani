import React from 'react';

export default function RabiLoanHeroCard({ onRequestLoan }) {
  return (
    <div className="agritrust-card rabi-loan-card">
      {/* Top Banner with Real Wheat Field Photograph & Overlay */}
      <div className="rabi-hero-banner-image">
        <div className="rabi-hero-overlay"></div>
        <div className="rabi-hero-content">
          <div className="rabi-pill-tag">Pre-Approved Rabi 2025–26</div>
          <div className="rabi-hero-headline">रब्बी पेरणी कर्ज सहाय्य (Rabi Sowing Loan)</div>
        </div>
      </div>

      {/* Inner Card Body */}
      <div className="rabi-loan-inner-body">
        {/* Trio Stat Grid */}
        <div className="rabi-stats-trio-grid">
          <div className="rabi-stat-box">
            <span className="rabi-stat-label">Sanctioned Sum</span>
            <span className="rabi-stat-val">₹45,000</span>
            <span className="rabi-stat-sub">For Seeds & DAP</span>
          </div>

          <div className="rabi-stat-box">
            <span className="rabi-stat-label">Interest Rate</span>
            <span className="rabi-stat-val">4.0% p.a.</span>
            <span className="rabi-stat-sub">Govt. Subvention</span>
          </div>

          <div className="rabi-stat-box">
            <span className="rabi-stat-label">Tenure Repayment</span>
            <span className="rabi-stat-val">Bullet (May '26)</span>
            <span className="rabi-stat-sub">Post-Harvest Mandi</span>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="rabi-loan-bottom-action-bar">
          <div className="rabi-dbt-instant-note">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#15803d">
              <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>No bank branch visit required • Instant DBT to account</span>
          </div>

          <button
            className="rabi-request-loan-btn"
            onClick={onRequestLoan}
            title="Request Instant Loan Disbursement"
          >
            <span>बँकेकडून कर्ज मिळवा (Request Loan)</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
