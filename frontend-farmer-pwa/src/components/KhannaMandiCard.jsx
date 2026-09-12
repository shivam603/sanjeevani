import React from 'react';

export default function KhannaMandiCard({ onOpenMandiModal }) {
  return (
    <div className="agritrust-card" style={{ gap: '12px' }}>
      {/* Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🏬</span>
          <span className="card-category-label">KHANNA MANDI (LIVE)</span>
        </div>

        <span className="green-tag-pill">+₹150 / Qtl</span>
      </div>

      {/* Big Price */}
      <div className="mandi-big-price-text">
        ₹2,275 <span style={{ fontSize: '18px', fontWeight: 600 }}>/ क्विंटल</span>
      </div>

      {/* Body Description */}
      <p className="mandi-card-body-text">
        Wheat wholesale price steady at Khanna Mandi. Current quote is comfortably above Central MSP (₹2,125). Ideal for advance booking contracts.
      </p>

      {/* Footer */}
      <div className="mandi-card-footer-row">
        <span className="mandi-arrivals-note">Arrivals: 4,120 Bags today</span>
        <button
          onClick={onOpenMandiModal}
          style={{
            background: 'none',
            border: 'none',
            color: '#15803d',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Mandi Rates &gt;
        </button>
      </div>
    </div>
  );
}
