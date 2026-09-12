import React from 'react';

export default function RiskMixBar({ riskMix = { low: 328, moderate: 116, high: 38 } }) {
  const total = (riskMix.low || 0) + (riskMix.moderate || 0) + (riskMix.high || 0) || 482;
  const lowPct = Math.round(((riskMix.low || 0) / total) * 100);
  const modPct = Math.round(((riskMix.moderate || 0) / total) * 100);
  const highPct = 100 - lowPct - modPct;

  return (
    <div className="portal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            Portfolio Risk Mix
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Aggregate underwriting risk segmentation calibrated against Model C
          </p>
        </div>
        <span className="badge badge-low">
          68% Low Risk
        </span>
      </div>

      {/* Segmented Horizontal Bar */}
      <div
        style={{
          width: '100%',
          height: '24px',
          background: '#1e293b',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          margin: '12px 0 16px',
        }}
      >
        <div
          style={{
            width: `${lowPct}%`,
            background: '#10b981',
            transition: 'width 0.8s ease',
          }}
          title={`Low Risk: ${riskMix.low} (${lowPct}%)`}
        />
        <div
          style={{
            width: `${modPct}%`,
            background: '#f59e0b',
            transition: 'width 0.8s ease',
          }}
          title={`Moderate Risk: ${riskMix.moderate} (${modPct}%)`}
        />
        <div
          style={{
            width: `${highPct}%`,
            background: '#f43f5e',
            transition: 'width 0.8s ease',
          }}
          title={`High Risk: ${riskMix.high} (${highPct}%)`}
        />
      </div>

      {/* Legend Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>🟢 Low Risk</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {riskMix.low}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{lowPct}% of portfolio</div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>🟡 Moderate Risk</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {riskMix.moderate}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{modPct}% of portfolio</div>
        </div>

        <div style={{ padding: '10px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>🔴 High Risk</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {riskMix.high}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{highPct}% of portfolio</div>
        </div>
      </div>
    </div>
  );
}
