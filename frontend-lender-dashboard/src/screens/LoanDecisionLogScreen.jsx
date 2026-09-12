import React, { useState, useEffect } from 'react';
import { fetchLoanDecisions } from '../services/api';

export default function LoanDecisionLogScreen() {
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      const data = await fetchLoanDecisions();
      setDecisions(data);
    } catch (err) {
      console.error('Error fetching loan decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  const totalDecisions = decisions.length;
  const approvedCount = decisions.filter((d) => d.decision === 'APPROVED').length;
  const approvalRate = totalDecisions > 0 ? Math.round((approvedCount / totalDecisions) * 100) : 0;
  const totalApprovedVolume = decisions
    .filter((d) => d.decision === 'APPROVED')
    .reduce((sum, d) => sum + (d.approved_amount || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Credit Committee Sanction Audit & Model Feedback Log
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          All recorded underwriter loan decisions linked directly to passport_id hashes for regulatory compliance, portfolio audit, and ML scoring model retraining loops.
        </p>
      </div>

      {/* Aggregate KPI Stats */}
      <div className="stats-grid">
        <div className="stat-box">
          <span className="stat-label">Total Underwritten</span>
          <span className="stat-value">{totalDecisions}</span>
          <span className="stat-subtext">Credit decisions recorded</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Sanction Approval Rate</span>
          <span className="stat-value" style={{ color: '#10b981' }}>{approvalRate}%</span>
          <span className="stat-subtext">{approvedCount} of {totalDecisions} approved</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Cumulative Sanctioned Exposure</span>
          <span className="stat-value" style={{ color: '#38bdf8' }}>
            ₹{totalApprovedVolume.toLocaleString('en-IN')}
          </span>
          <span className="stat-subtext">Priority sector agricultural lending</span>
        </div>

        <div className="stat-box">
          <span className="stat-label">Model Retraining Feedback</span>
          <span className="stat-value" style={{ color: '#818cf8' }}>100%</span>
          <span className="stat-subtext">Mapped to Passport ID ground-truth</span>
        </div>
      </div>

      {/* Decisions Log Table */}
      <div className="terminal-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <span>📜</span> Underwriting Sanction Records ({decisions.length})
            </h3>
            <p className="card-subtitle">
              Immutable ledger of credit decisions, sanctioned terms, and risk covenants
            </p>
          </div>
          <button className="btn-secondary" onClick={loadDecisions} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading loan decision logs...
          </div>
        ) : decisions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No underwriting decisions logged yet.
          </div>
        ) : (
          <div className="terminal-table-container">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Decision ID</th>
                  <th>Passport ID</th>
                  <th>Decision</th>
                  <th>Sanction Limit</th>
                  <th>Tenure</th>
                  <th>Interest Rate</th>
                  <th>Mandatory Covenants</th>
                  <th>Underwriter</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d) => {
                  const dateStr = new Date(d.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={d.decision_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--color-primary)' }}>
                        {d.decision_id.substring(0, 12)}...
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {d.passport_id.substring(0, 16)}...
                      </td>
                      <td>
                        <span
                          className={
                            d.decision === 'APPROVED'
                              ? 'badge-status-approved'
                              : d.decision === 'DECLINED'
                              ? 'badge-status-declined'
                              : 'badge-status-pending'
                          }
                        >
                          {d.decision}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: d.decision === 'APPROVED' ? '#10b981' : 'var(--text-muted)' }}>
                        {d.approved_amount ? `₹${Number(d.approved_amount).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {d.tenure_months ? `${d.tenure_months} Mo` : '—'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                        {d.interest_rate_pct ? `${d.interest_rate_pct}%` : '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {d.covenants || 'None specified'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {d.underwriter_id}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
