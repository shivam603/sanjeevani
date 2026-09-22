import React, { useState } from 'react';

export default function DecisionModal({ dossier, onClose, onSubmit }) {
  if (!dossier) return null;

  const defaultAmount = dossier.cash_flow ? dossier.cash_flow.safe_credit_limit_inr : 150000;

  const [decision, setDecision] = useState('APPROVED');
  const [approvedAmount, setApprovedAmount] = useState(defaultAmount);
  const [tenureMonths, setTenureMonths] = useState(12);
  const [interestRatePct, setInterestRatePct] = useState(7.0);
  const [covenants, setCovenants] = useState('Mandatory PMFBY crop insurance policy and FPO settlement escrow');
  const [notes, setNotes] = useState('Applicant meets AgriTrust Grade A prime creditworthiness criteria.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        passport_id: dossier.passport_id,
        farmer_id: dossier.farmer_id,
        decision,
        approved_amount: decision === 'APPROVED' ? Number(approvedAmount) : 0,
        tenure_months: decision === 'APPROVED' ? Number(tenureMonths) : null,
        interest_rate_pct: decision === 'APPROVED' ? Number(interestRatePct) : null,
        covenants,
        notes,
      });
      onClose();
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14213D' }}>
              Record Institutional Underwriting Decision
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Logged against Passport ID: <strong style={{ color: '#0879C9' }}>{dossier.passport_id}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Underwriting Decision</label>
            <select
              className="form-select"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
            >
              <option value="APPROVED">APPROVED — Grant Credit Facility</option>
              <option value="REFERRED">REFERRED — Secondary Verification Required</option>
              <option value="DECLINED">DECLINED — Risk Policy Boundary Exceeded</option>
            </select>
          </div>

          {decision === 'APPROVED' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Approved Credit Limit (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tenure (Months)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={tenureMonths}
                    min="1"
                    max="60"
                    onChange={(e) => setTenureMonths(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.05"
                  className="form-input"
                  value={interestRatePct}
                  onChange={(e) => setInterestRatePct(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Mandatory Loan Covenants & Risk Mitigants</label>
            <textarea
              className="form-textarea"
              value={covenants}
              onChange={(e) => setCovenants(e.target.value)}
              placeholder="E.g. PMFBY crop insurance mandatory, disbursement via FPO input store"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Credit Committee Underwriter Notes</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter underwriting rationale..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={decision === 'APPROVED' ? 'btn-success' : 'btn-primary'}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging Decision...' : `Confirm & Log ${decision}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
