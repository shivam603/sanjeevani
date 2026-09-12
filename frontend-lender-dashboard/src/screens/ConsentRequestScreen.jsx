import React, { useState, useEffect } from 'react';
import { fetchConsentRequests, createConsentRequest } from '../services/api';

export default function ConsentRequestScreen() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [farmerId, setFarmerId] = useState('5fa85f64-5717-4562-b3fc-2c963f66afa8'); // Pre-fill with farmer NSK-103
  const [loanPurpose, setLoanPurpose] = useState('Kisan Credit Card Season Limit Assessment');
  const [validityDays, setValidityDays] = useState(30);
  const [selectedScopes, setSelectedScopes] = useState([
    'agritrust_score',
    'safe_limit',
    'crop_risk',
    'satellite_ndvi',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const availableScopes = [
    { id: 'agritrust_score', label: 'AgriTrust Credit Score (0-100)' },
    { id: 'safe_limit', label: 'Safe Borrowing Capacity (₹)' },
    { id: 'crop_risk', label: 'Model C Crop & Climate Risk Matrix' },
    { id: 'satellite_ndvi', label: 'Sentinel-2 Satellite Biomass Index' },
    { id: 'cash_flow', label: 'Model B Net Cashflow & DSCR Engine' },
  ];

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchConsentRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching consent requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleScopeToggle = (scopeId) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((s) => s !== scopeId) : [...prev, scopeId]
    );
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      const created = await createConsentRequest({
        farmer_id: farmerId,
        loan_purpose: loanPurpose,
        requested_validity_days: Number(validityDays),
        requested_attributes: selectedScopes,
      });
      setSuccessMsg(`Consent request initiated! Request ID: ${created.request_id}. Pending farmer authorization on KisanCred PWA.`);
      loadRequests();
    } catch (err) {
      alert(`Error creating consent request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Sovereign Data Consent Request Hub
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Initiate time-bound, purpose-specific consent requests. Once approved by the farmer in their mobile PWA, underwriting access is cryptographically activated.
        </p>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', color: '#10b981', padding: '14px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem' }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Initiation Form */}
      <div className="terminal-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <span>✍️</span> Initiate Consent Request (Stage 5/6 Gated Handshake)
            </h3>
            <p className="card-subtitle">
              Dispatches push consent prompt to farmer's KisanCred PWA Consent Manager
            </p>
          </div>
          <span className="badge-grade">DPDP COMPLIANT</span>
        </div>

        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Target Farmer ID or Code</label>
              <input
                type="text"
                className="form-input"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                placeholder="UUID or Farmer Code (e.g. NSK-103)"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loan Facility Purpose</label>
              <input
                type="text"
                className="form-input"
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                placeholder="E.g. Kisan Credit Card Seasonal Limit"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Requested Validity Period (Days)</label>
              <input
                type="number"
                min="1"
                max="90"
                className="form-input"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Requested Telemetry Scopes (Minimum Necessary)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '4px' }}>
              {availableScopes.map((scope) => (
                <label
                  key={scope.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'var(--bg-surface)',
                    border: selectedScopes.includes(scope.id) ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedScopes.includes(scope.id)}
                    onChange={() => handleScopeToggle(scope.id)}
                  />
                  <span>{scope.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Dispatching...' : '🚀 Dispatch Sovereign Consent Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Requests History Table */}
      <div className="terminal-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <span>📋</span> Consent Request Tracker ({requests.length})
            </h3>
            <p className="card-subtitle">
              Live authorization status of pending and granted sovereign access tokens
            </p>
          </div>
          <button className="btn-secondary" onClick={loadRequests} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading consent requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No consent requests logged yet.
          </div>
        ) : (
          <div className="terminal-table-container">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Farmer ID</th>
                  <th>Loan Purpose</th>
                  <th>Requested Scopes</th>
                  <th>Status</th>
                  <th>Initiated Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const dateStr = new Date(r.created_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={r.request_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {r.request_id}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {r.farmer_id.substring(0, 16)}...
                      </td>
                      <td>{r.loan_purpose}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {(r.requested_attributes || []).join(', ')}
                      </td>
                      <td>
                        <span className={r.status === 'APPROVED' ? 'badge-status-approved' : 'badge-status-pending'}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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
