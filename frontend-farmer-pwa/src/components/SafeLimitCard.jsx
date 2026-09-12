import React from 'react';

export default function SafeLimitCard({ onSpeakLimit }) {
  const maxLimit = 165000;
  const currentBorrowed = 45000;
  const freeHeadroom = maxLimit - currentBorrowed; // 120000

  return (
    <div className="agritrust-card">
      {/* Category & Title with Speaker button */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">SMART STRESS-FREE CAP</div>
          <div className="card-title-main">सुरक्षित कर्ज मर्यादा (Safe Limit)</div>
        </div>

        <button
          className="safe-limit-speaker-btn"
          onClick={onSpeakLimit}
          title="Listen to Safe Limit explanation"
          aria-label="Listen to Safe Limit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        </button>
      </div>

      {/* Dark Forest Green Hero Box */}
      <div className="safe-limit-dark-hero-box">
        <div className="safe-limit-headroom-tag">MAXIMUM RECOMMENDED HEADROOM</div>
        <div className="safe-limit-amount-hero">
          ₹1,65,000 <span>रुपये</span>
        </div>
        <div className="safe-limit-description-text">
          Calculated based on 4.2 acres Wheat + real-time AGMARKNET Khanna Mandi projections. Repay comfortably post-Baisakhi harvest without any debt pressure.
        </div>
      </div>

      {/* Sub-bar Progress Section */}
      <div className="safe-limit-progress-section">
        <div className="safe-limit-progress-top-row">
          <span className="safe-limit-borrowed-label">Current Borrowed: ₹45,000</span>
          <span className="safe-limit-headroom-label">Free Headroom: ₹1,20,000</span>
        </div>

        {/* Dual Split Bar (27% used, 73% free capacity) */}
        <div className="split-progress-bar-track" role="progressbar" aria-valuenow="27" aria-valuemin="0" aria-valuemax="100">
          <div className="split-progress-used" style={{ width: '27%' }}></div>
          <div className="split-progress-free" style={{ width: '73%' }}></div>
        </div>

        <div className="safe-limit-progress-bottom-row">
          <span>Used (Fertilizer subsidy)</span>
          <span>Safe capacity limit ₹1,65,000</span>
        </div>
      </div>

      {/* Bottom Shield Notice */}
      <div className="card-footer-notice-box">
        <span style={{ fontSize: '15px' }}>🛡️</span>
        <span>
          AgriTrust prevents over-leveraging: Banks cannot offer you high-interest private debt beyond this threshold.
        </span>
      </div>
    </div>
  );
}
