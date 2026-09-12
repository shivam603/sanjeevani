import React, { useState } from 'react';

export default function BulkFinancingScreen({ bulkData }) {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleExportDossier = () => {
    const dataStr = JSON.stringify(bulkData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sanjeevani_FPO_Bank_Financing_Dossier_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const covenants = bulkData?.covenants || [
    '100% of member crop deliveries must be routed through FPO APMC accounts',
    'Continuous Sentinel-2 NDVI satellite monitoring with monthly health validation',
    'Mandatory PMFBY crop insurance enrolment for all active credit lines',
    'FPO collective credit default reserve funded at 5% of disbursed portfolio',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {downloadSuccess && (
        <div
          style={{
            background: 'linear-gradient(90deg, #059669, #10b981)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 700,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          }}
        >
          📥 Bank Underwriting Dossier successfully generated and downloaded!
        </div>
      )}

      {/* Executive Hero Brief */}
      <div className="portal-card portal-card-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Institutional Group Financing View
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              Bank & NBFC Credit Committee Dossier
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '4px', maxWidth: '750px' }}>
              Executive risk profile presented to partner banks (SBI Agri, HDFC Rural, NABARD) for negotiating collective Kisan Credit Card limits and group interest rate subventions.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportDossier}
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <span>📥</span>
            <span>Export Bank Dossier</span>
          </button>
        </div>
      </div>

      {/* Underwriting Metrics Grid */}
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-box-label">🏦 Total Borrowing Capacity</div>
          <div className="stat-box-val" style={{ color: '#38bdf8' }}>
            {formatCurrency(bulkData?.aggregate_safe_credit_limit || 148000000)}
          </div>
          <div className="stat-box-sub">Across 482 member farmers</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">💼 Projected Repayment Capacity</div>
          <div className="stat-box-val" style={{ color: '#10b981' }}>
            {formatCurrency(bulkData?.aggregate_repayment_capacity || 192000000)}
          </div>
          <div className="stat-box-sub">Calibrated against historical yields</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">📉 Mean Probability of Default</div>
          <div className="stat-box-val" style={{ color: '#10b981' }}>
            {bulkData?.mean_default_probability_pct || 4.2}%
          </div>
          <div className="stat-box-sub">Benchmark: 8.5% for standalone unorganized farmers</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">📊 Debt Service Coverage (DSCR)</div>
          <div className="stat-box-val" style={{ color: '#34d399' }}>
            {bulkData?.dscr_mean || 1.65}x
          </div>
          <div className="stat-box-sub">Robust cashflow debt service capability</div>
        </div>
      </div>

      {/* Negotiation Terms & Rate Subvention */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {/* Collective Credit Advantage */}
        <div className="portal-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            🎯 Group Financing Subvention Terms
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '14px' }}>
            Due to verified satellite NDVI validation and collective FPO marketing, this cluster qualifies for preferential interest rate pricing.
          </p>

          <div
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, textTransform: 'uppercase' }}>
                Interest Rate Subvention
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
                -{bulkData?.proposed_interest_subvention_pct || 1.25}% p.a.
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Saves cluster ~₹18.5 Lakhs annually in interest charges
              </div>
            </div>
            <span className="badge badge-low" style={{ fontSize: '0.8rem' }}>
              Pre-Approved
            </span>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🛡️</span>
              <span><strong>First-Loss Default Guarantee:</strong> FPO covers 5% default reserve.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📡</span>
              <span><strong>Continuous Telemetry:</strong> Weekly NDVI updates shared with participating lender.</span>
            </div>
          </div>
        </div>

        {/* Covenants Checklist */}
        <div className="portal-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            📋 Underwriting Covenants & Commitments
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '14px' }}>
            Binding institutional governance covenants agreed upon by FPO Board of Directors
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {covenants.map((cov, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                }}
              >
                <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: '0.82rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                  {cov}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
