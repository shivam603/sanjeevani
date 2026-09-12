import React from 'react';

export default function PriceScenarioChart({ priceProjections }) {
  if (!priceProjections) return null;

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="terminal-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <span>📈</span> Model D — AGMARKNET Mandi Price Realization Horizons
          </h3>
          <p className="card-subtitle">
            Benchmark: <strong style={{ color: 'var(--text-primary)' }}>{priceProjections.benchmark_mandi}</strong> • Current Modal: <strong style={{ color: '#38bdf8' }}>{formatINR(priceProjections.current_modal_price)}/Qtl</strong>
          </p>
        </div>
        <span className="badge-grade">ARIMA + EXPONENTIAL SMOOTHING</span>
      </div>

      <div className="scenario-grid">
        {(priceProjections.scenarios || []).map((sc) => {
          const spreadPct = Math.round(
            ((sc.optimistic_price - sc.downside_price) / sc.base_price) * 100
          );

          return (
            <div key={sc.horizon_days} className="scenario-card">
              <div className="scenario-header">
                <span className="scenario-title">T+{sc.horizon_days} Days Horizon</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spread: ±{spreadPct}%</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="price-row">
                  <span className="price-label">🟢 Optimistic Target:</span>
                  <span className="price-val optimistic">{formatINR(sc.optimistic_price)}</span>
                </div>

                <div className="price-row">
                  <span className="price-label">🔵 Base Expected Price:</span>
                  <span className="price-val base">{formatINR(sc.base_price)}</span>
                </div>

                <div className="price-row">
                  <span className="price-label">🔴 Downside Floor (Stress):</span>
                  <span className="price-val downside">{formatINR(sc.downside_price)}</span>
                </div>
              </div>

              {/* Visual Horizon Range Bar */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-elevated)', borderRadius: '9999px', position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '15%',
                      right: '15%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #f43f5e, #38bdf8 50%, #10b981)',
                      borderRadius: '9999px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Downside</span>
                  <span>Base</span>
                  <span>Optimistic</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
