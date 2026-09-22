import React from 'react';

export default function CashFlowChart({ cashFlow }) {
  if (!cashFlow) return null;

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const gross = cashFlow.gross_revenue_inr || 1;
  const inputCostPct = Math.min(100, Math.round(((cashFlow.input_costs_inr || 0) / gross) * 100));
  const obligationsPct = Math.min(100, Math.round(((cashFlow.existing_obligations_inr || 0) / gross) * 100));
  const netCashflowPct = Math.max(0, 100 - inputCostPct - obligationsPct);

  return (
    <div className="terminal-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <span>💵</span> Model B — Deterministic Cashflow & Repayment Capacity Engine
          </h3>
          <p className="card-subtitle">
            Derived from crop cycles, benchmark mandi realization, and regional cost-per-acre inputs
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>DEBT SERVICE COVERAGE RATIO</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: cashFlow.dscr >= 1.5 ? '#00966A' : '#D97706', fontFamily: 'var(--font-mono)' }}>
            {cashFlow.dscr}x DSCR
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="cashflow-breakdown-grid">
        <div className="cashflow-item">
          <span className="stat-label">Expected Yield</span>
          <span className="stat-value">{cashFlow.expected_yield_qtl} <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>Qtl</span></span>
          <span className="stat-subtext">@ {formatINR(cashFlow.realization_price_inr)} / Qtl</span>
        </div>

        <div className="cashflow-item">
          <span className="stat-label">Gross Seasonal Revenue</span>
          <span className="stat-value" style={{ color: '#0879C9' }}>{formatINR(cashFlow.gross_revenue_inr)}</span>
          <span className="stat-subtext">100% Projected Topline</span>
        </div>

        <div className="cashflow-item highlight-cost">
          <span className="stat-label">Input & Cultivation Costs</span>
          <span className="stat-value" style={{ color: '#B91C1C' }}>{formatINR(cashFlow.input_costs_inr)}</span>
          <span className="stat-subtext">{inputCostPct}% of Gross Revenue</span>
        </div>

        <div className="cashflow-item highlight-cost">
          <span className="stat-label">Existing Debt Service</span>
          <span className="stat-value" style={{ color: '#D97706' }}>{formatINR(cashFlow.existing_obligations_inr)}</span>
          <span className="stat-subtext">{obligationsPct}% Debt Obligations</span>
        </div>

        <div className="cashflow-item highlight-net">
          <span className="stat-label">Net Repayment Capacity</span>
          <span className="stat-value" style={{ color: '#00966A' }}>{formatINR(cashFlow.net_cashflow_inr)}</span>
          <span className="stat-subtext">Net Unencumbered Surplus</span>
        </div>

        <div className="cashflow-item" style={{ border: '1px solid rgba(8, 121, 201, 0.3)' }}>
          <span className="stat-label">Recommended Safe Credit Limit</span>
          <span className="stat-value" style={{ color: '#0879C9' }}>{formatINR(cashFlow.safe_credit_limit_inr)}</span>
          <span className="stat-subtext">Max Safe Exposure Cap</span>
        </div>
      </div>

      {/* Visual Proportional Cash Flow Waterfall Bar */}
      <div style={{ marginTop: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          <span>Cashflow Distribution Breakdown</span>
          <span>Net Surplus: {netCashflowPct}%</span>
        </div>
        <div style={{ height: '14px', width: '100%', borderRadius: '9999px', overflow: 'hidden', display: 'flex', background: 'var(--bg-surface-elevated)' }}>
          <div
            title={`Input Costs: ${inputCostPct}%`}
            style={{ width: `${inputCostPct}%`, background: '#f43f5e', transition: 'width 0.5s' }}
          />
          <div
            title={`Existing Debt: ${obligationsPct}%`}
            style={{ width: `${obligationsPct}%`, background: '#fb923c', transition: 'width 0.5s' }}
          />
          <div
            title={`Net Surplus: ${netCashflowPct}%`}
            style={{ width: `${netCashflowPct}%`, background: '#10b981', transition: 'width 0.5s' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span> Input Costs
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fb923c' }}></span> Existing Obligations
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Net Seasonal Cashflow
          </span>
        </div>
      </div>
    </div>
  );
}
