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
    {
      id: 'agritrust_score',
      icon: '📊',
      title: 'AgriTrust Credit Score',
      tag: '0–100 Rating',
      sub: 'Composite sovereign credit health rating',
    },
    {
      id: 'safe_limit',
      icon: '💳',
      title: 'Borrowing Capacity',
      tag: '₹ Max Limit',
      sub: 'Underwritten safe seasonal debt ceiling',
    },
    {
      id: 'crop_risk',
      icon: '🌱',
      title: 'Crop & Climate Risk',
      tag: 'Model C Matrix',
      sub: 'Drought, flood & temperature resilience',
    },
    {
      id: 'satellite_ndvi',
      icon: '🛰️',
      title: 'Satellite Biomass Index',
      tag: 'Sentinel-2 Telemetry',
      sub: '10m vegetation density & vigor telemetry',
    },
    {
      id: 'cash_flow',
      icon: '📈',
      title: 'Net Cashflow & DSCR',
      tag: 'Model B Engine',
      sub: 'Seasonal cash revenue & repayment coverage',
    },
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
      setSuccessMsg(`Consent handshake initiated! Request #${created.request_id || created.id}. Awaiting sovereign farmer authorization on KisanCred PWA.`);
      loadRequests();
    } catch (err) {
      alert(`Error creating consent request: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="consent-hub-screen">
      {/* Level 1: Screen Header with Status & Privacy Badges */}
      <header className="consent-hub-header">
        <div className="consent-hub-title-group">
          <div className="consent-gateway-status">
            <span className="gateway-dot" />
            <span>Consent gateway active</span>
          </div>
          <h1 className="consent-hub-heading">
            Sovereign Data<br />Consent Hub
          </h1>
          <p className="consent-hub-subtext">
            Initiate time-bound, purpose-specific cryptographic consent handshakes for sovereign agricultural underwriting.
          </p>
        </div>

        <div className="consent-hub-trust-badges">
          <div className="trust-pill">
            <span className="trust-icon">🔒</span>
            <span>DPDP Act 2023 Aligned</span>
          </div>
          <div className="trust-pill">
            <span className="trust-icon">✓</span>
            <span>Purpose-Specific</span>
          </div>
          <div className="trust-pill">
            <span className="trust-icon">✓</span>
            <span>Time-Bound (30d)</span>
          </div>
          <div className="trust-pill">
            <span className="trust-icon">✓</span>
            <span>Consent-Gated Handshake</span>
          </div>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="consent-success-banner">
          <span className="success-icon">✓</span>
          <span className="success-text">{successMsg}</span>
          <button
            type="button"
            className="success-dismiss-btn"
            onClick={() => setSuccessMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Level 2 & 3: Two-Column Spatial Consent Request Composition */}
      <form onSubmit={handleCreateRequest} className="consent-request-grid">
        {/* Left Column: Consent Request Parameters */}
        <div className="consent-glass-panel consent-params-panel">
          <div className="panel-header">
            <span className="panel-eyebrow">HANDSHAKE PARAMETERS</span>
            <h2 className="panel-title">Consent Request</h2>
            <p className="panel-desc">Configure target farmer identity, loan purpose, and validity window.</p>
          </div>

          <div className="panel-fields-list">
            {/* Target Farmer */}
            <div className="glass-field-block">
              <label className="glass-field-label">TARGET FARMER</label>
              <div className="glass-input-wrapper">
                <span className="glass-field-leading-icon">👤</span>
                <div className="glass-field-input-box">
                  <span className="glass-input-sublabel">Farmer ID or Code</span>
                  <input
                    type="text"
                    className="glass-control-input"
                    value={farmerId}
                    onChange={(e) => setFarmerId(e.target.value)}
                    placeholder="UUID or Farmer Code (e.g. NSK-103)"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Loan Purpose */}
            <div className="glass-field-block">
              <label className="glass-field-label">LOAN FACILITY</label>
              <div className="glass-input-wrapper">
                <span className="glass-field-leading-icon">💳</span>
                <div className="glass-field-input-box">
                  <span className="glass-input-sublabel">Assessment Purpose</span>
                  <input
                    type="text"
                    className="glass-control-input"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    placeholder="e.g. Kisan Credit Card Seasonal Limit"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Validity Duration */}
            <div className="glass-field-block">
              <label className="glass-field-label">VALIDITY PERIOD</label>
              <div className="glass-input-wrapper">
                <span className="glass-field-leading-icon">⏱️</span>
                <div className="glass-field-input-box">
                  <span className="glass-input-sublabel">Time-Bound Expiration</span>
                  <div className="validity-input-inline">
                    <input
                      type="number"
                      min="1"
                      max="90"
                      className="glass-control-input validity-num"
                      value={validityDays}
                      onChange={(e) => setValidityDays(e.target.value)}
                      required
                    />
                    <span className="validity-tag">days authorization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Scopes (Data Permissions Visualization) */}
        <div className="consent-glass-panel consent-scopes-panel">
          <div className="panel-header-row">
            <div>
              <span className="panel-eyebrow">TELEMETRY ACCESS</span>
              <h2 className="panel-title">Data Permissions</h2>
              <p className="panel-desc">Select only the information required for this underwriting request.</p>
            </div>
            <div className="scope-count-badge">
              <span className="scope-count-num">0{selectedScopes.length}</span>
              <span className="scope-count-text">scopes selected</span>
              <span className="scope-count-sub">Minimum necessary</span>
            </div>
          </div>

          {/* Floating Glass Permission Tiles */}
          <div className="scope-tiles-grid">
            {availableScopes.map((scope) => {
              const isSelected = selectedScopes.includes(scope.id);
              return (
                <button
                  type="button"
                  key={scope.id}
                  onClick={() => handleScopeToggle(scope.id)}
                  className={`scope-glass-tile ${isSelected ? 'selected' : ''}`}
                >
                  <div className="tile-top-row">
                    <span className="tile-icon">{scope.icon}</span>
                    <span className={`tile-check-indicator ${isSelected ? 'checked' : ''}`}>
                      {isSelected && (
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="tile-content">
                    <span className="tile-title">{scope.title}</span>
                    <span className="tile-tag">{scope.tag}</span>
                    <span className="tile-desc">{scope.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="dispatch-action-row">
            <div className="compliance-inline-badge">
              <span className="lock-dot">🔒</span>
              <span>DPDP Act 2023 Consent-Gated Push Handshake</span>
            </div>

            <button
              type="submit"
              className="dispatch-primary-cta"
              disabled={isSubmitting || selectedScopes.length === 0}
            >
              <span>{isSubmitting ? 'Dispatching...' : 'Dispatch Consent Request'}</span>
              <span className="cta-arrow">→</span>
            </button>
          </div>
        </div>
      </form>

      {/* Level 4: Recent Consent Requests Tracker */}
      <section className="recent-requests-section">
        <div className="tracker-header-row">
          <div>
            <span className="tracker-eyebrow">AUDIT & LOG</span>
            <h2 className="tracker-title">Recent Consent Requests</h2>
            <p className="tracker-subtitle">
              Live authorization status of pending and granted sovereign access tokens ({requests.length})
            </p>
          </div>
          <button
            type="button"
            className={`glass-refresh-btn ${loading ? 'spinning' : ''}`}
            onClick={loadRequests}
            title="Refresh requests"
            aria-label="Refresh requests"
          >
            ↻
          </button>
        </div>

        {loading ? (
          <div className="tracker-status-box">
            <div className="tracker-spinner" />
            <span>Synchronizing cryptographic consent ledger...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="tracker-status-box">
            <span>No consent requests logged yet. Dispatch a new handshake above.</span>
          </div>
        ) : (
          <div className="tracker-glass-list">
            <div className="tracker-list-header">
              <span className="col-req">REQUEST</span>
              <span className="col-farmer">FARMER</span>
              <span className="col-purpose">PURPOSE</span>
              <span className="col-scopes">DATA SCOPES</span>
              <span className="col-status">STATUS</span>
              <span className="col-date">INITIATED</span>
            </div>

            <div className="tracker-list-body">
              {requests.map((r) => {
                const dateStr = new Date(r.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                const isApproved = r.status === 'APPROVED' || r.status === 'GRANTED';
                const isPending = r.status === 'PENDING';
                const isRejected = r.status === 'REJECTED';

                return (
                  <div key={r.request_id || r.id} className="tracker-row-item">
                    <div className="col-req">
                      <span className="req-id-badge">
                        #{String(r.request_id || r.id).substring(0, 8)}
                      </span>
                    </div>

                    <div className="col-farmer">
                      <span className="farmer-id-pill" title={r.farmer_id}>
                        👤 {String(r.farmer_id).substring(0, 10)}...
                      </span>
                    </div>

                    <div className="col-purpose">
                      <span className="purpose-text">{r.loan_purpose}</span>
                    </div>

                    <div className="col-scopes">
                      <div className="scopes-chip-wrap">
                        {(r.requested_attributes || []).slice(0, 3).map((attr) => (
                          <span key={attr} className="scope-micro-chip">
                            {attr.replace('agritrust_', '').replace('satellite_', '')}
                          </span>
                        ))}
                        {(r.requested_attributes || []).length > 3 && (
                          <span className="scope-micro-chip more">
                            +{(r.requested_attributes || []).length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-status">
                      <span
                        className={`status-glass-pill ${
                          isApproved ? 'status-granted' : isPending ? 'status-pending' : isRejected ? 'status-rejected' : 'status-expired'
                        }`}
                      >
                        <span className="status-dot-indicator" />
                        {isApproved ? 'Granted' : isPending ? 'Pending' : isRejected ? 'Rejected' : 'Expired'}
                      </span>
                    </div>

                    <div className="col-date">
                      <span className="date-caption">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
