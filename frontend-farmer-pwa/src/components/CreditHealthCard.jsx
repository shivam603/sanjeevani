import React from 'react';

export default function CreditHealthCard({ score = 78, maxScore = 100 }) {
  // SVG circular gauge math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / maxScore) * circumference;

  return (
    <div className="agritrust-card">
      {/* Category & Title */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">AGRITRUST SOVEREIGN RATING</div>
          <div className="card-title-main">पत स्थिती (Credit Health)</div>
        </div>

        <div className="status-badge-leaf">
          <span>🍃</span>
          <span>Good Standing (उत्कृष्ट पत)</span>
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
            <span className="score-gauge-subtext">out of {maxScore}</span>
          </div>
        </div>

        {/* Reasons List */}
        <div className="score-reasons-list">
          <div className="score-reasons-title">क्रेडिट वाढण्याचे कारण:</div>

          <div className="score-reason-item">
            <div className="score-reason-check">✓</div>
            <div>
              <strong>100% On-time</strong> repayment on SBI KCC loan (2024).
            </div>
          </div>

          <div className="score-reason-item">
            <div className="score-reason-check">✓</div>
            <div>
              <strong>Verified E-Nam:</strong> 42 Quintal Gehu trade tracked via Khanna Mandi.
            </div>
          </div>
        </div>
      </div>

      {/* No Agent Fees Lightbulb Notice */}
      <div className="card-footer-notice-box">
        <span style={{ fontSize: '15px' }}>💡</span>
        <span>
          No agent fees or CIBIL deductions. Your rating is backed directly by your land deeds and crop harvest history.
        </span>
      </div>
    </div>
  );
}
