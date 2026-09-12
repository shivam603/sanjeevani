import React, { useState, useEffect } from 'react';
import { fetchUnderwritingDossier } from '../services/api';
import ConsentBadgeIndicator from '../components/ConsentBadgeIndicator';
import CashFlowChart from '../components/CashFlowChart';
import PriceScenarioChart from '../components/PriceScenarioChart';
import CropRiskMatrix from '../components/CropRiskMatrix';
import DecisionModal from '../components/DecisionModal';

export default function FarmerDetailScreen({ farmerId, consentToken, onBack, onDecisionLogged }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);

  useEffect(() => {
    if (!farmerId) return;
    setLoading(true);
    setError(null);
    fetchUnderwritingDossier(farmerId, consentToken)
      .then((data) => setDossier(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [farmerId, consentToken]);

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Decrypting sovereign telemetry & running Model B/C/D engines...
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="terminal-card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3 style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>
          Access Denied / Underwriting Error
        </h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {error || 'Unable to retrieve underwriting dossier.'}
        </p>
        <button className="btn-secondary" onClick={onBack}>
          ← Return to Consented Portfolio
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Back button & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back to Portfolio
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-success"
            onClick={() => setIsDecisionModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>⚖️</span> Record Underwriting Decision
          </button>
        </div>
      </div>

      {/* Screen Requirement 1: Prominent Consent Status Banner */}
      <ConsentBadgeIndicator
        consentInfo={dossier.consent_info}
        farmerCode={dossier.farmer_code}
      />

      {/* Underwriting Dossier Header Card */}
      <div className="terminal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Underwriting Dossier: Farmer [{dossier.farmer_code}]
              </h2>
              <span className="badge-grade">{dossier.score_grade}</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              PASSPORT ID: {dossier.passport_id} • FARMER ID: {dossier.farmer_id}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="stat-box" style={{ minWidth: '130px', textAlign: 'center' }}>
              <span className="stat-label">AgriTrust Score</span>
              <span className="stat-value" style={{ color: '#38bdf8' }}>{dossier.agritrust_score}</span>
              <span className="stat-subtext">Scale: 0–100</span>
            </div>

            <div className="stat-box" style={{ minWidth: '130px', textAlign: 'center' }}>
              <span className="stat-label">Data Confidence</span>
              <span className="stat-value" style={{ color: '#10b981' }}>{Math.round(dossier.data_confidence * 100)}%</span>
              <span className="stat-subtext">3 Verified Sources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Model B: Cashflow Engine & Repayment Capacity */}
      <CashFlowChart cashFlow={dossier.cash_flow} />

      {/* Model D: AGMARKNET Price Scenarios (Base, Optimistic, Downside) */}
      <PriceScenarioChart priceProjections={dossier.price_projections} />

      {/* Model C: Crop-specific Risk Breakdown */}
      <CropRiskMatrix cropRisk={dossier.crop_risk} />

      {/* Stage 4: Plain-Language Institutional Underwriting Memorandum */}
      {dossier.lender_explanation && (
        <div className="terminal-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <span>📑</span> Stage 4 — Credit Committee Underwriting Memorandum
              </h3>
              <p className="card-subtitle">
                Algorithmic plain-language synthesis of SHAP attributions, satellite biomass, and default probability
              </p>
            </div>
            <span className="badge-grade">AUDIENCE: INSTITUTIONAL LENDER</span>
          </div>

          <div className="memorandum-box">
            <p className="memo-summary">
              {dossier.lender_explanation.summary}
            </p>

            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Key Quantitative Underwriting Metrics
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Probability of Default:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {dossier.lender_explanation.key_metrics?.probability_of_default_pct}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Debt Service Coverage:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {dossier.lender_explanation.key_metrics?.dscr}x
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Safe Credit Boundary:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    ₹{Number(dossier.lender_explanation.key_metrics?.safe_credit_boundary_inr || 0).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Biomass Remote Sensing:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                    {dossier.lender_explanation.key_metrics?.satellite_biomass_verified ? 'Verified (Sentinel-2)' : 'Unverified'}
                  </div>
                </div>
              </div>
            </div>

            {dossier.lender_explanation.underwriting_covenants && (
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Recommended Sanction Covenants & Pre-Disbursement Conditions
                </div>
                <ul className="covenants-list">
                  {dossier.lender_explanation.underwriting_covenants.map((cov, idx) => (
                    <li key={idx} className="covenant-item">
                      {cov}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {isDecisionModalOpen && (
        <DecisionModal
          dossier={dossier}
          onClose={() => setIsDecisionModalOpen(false)}
          onSubmit={onDecisionLogged}
        />
      )}
    </div>
  );
}
