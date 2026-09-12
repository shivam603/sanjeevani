import React, { useState, useEffect } from 'react';
import { fetchConsentedPortfolio } from '../services/api';

export default function PortfolioSearchScreen({ onSelectFarmer }) {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [minScore, setMinScore] = useState('');
  const [riskCategory, setRiskCategory] = useState('');

  const loadPortfolio = async () => {
    setLoading(true);
    try {
      const data = await fetchConsentedPortfolio({
        crop: cropFilter,
        region: regionFilter,
        min_score: minScore,
        risk_category: riskCategory,
      });
      setFarmers(data);
    } catch (err) {
      console.error('Error loading consented portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    loadPortfolio();
  };

  const handleReset = () => {
    setCropFilter('');
    setRegionFilter('');
    setMinScore('');
    setRiskCategory('');
    fetchConsentedPortfolio({}).then(setFarmers);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Portfolio Title & Legal Gating Alert */}
      <div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Active Consented Borrower Pipeline
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Underwriting pipeline strictly restricted to farmers who have granted active, unexpired sovereign data consents to State Bank of India.
        </p>
      </div>

      {/* Filter Control Bar */}
      <form onSubmit={handleFilterSubmit} className="filter-bar">
        <div className="filter-group">
          <label className="filter-label">Target Crop</label>
          <input
            type="text"
            className="filter-input"
            placeholder="e.g. Onion, Grapes, Pomegranate"
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Region / Taluka</label>
          <input
            type="text"
            className="filter-input"
            placeholder="e.g. Nashik, Dindori, Niphad"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ maxWidth: '140px' }}>
          <label className="filter-label">Min Score</label>
          <input
            type="number"
            min="0"
            max="100"
            className="filter-input"
            placeholder="0-100"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ maxWidth: '160px' }}>
          <label className="filter-label">Risk Category</label>
          <select
            className="filter-select"
            value={riskCategory}
            onChange={(e) => setRiskCategory(e.target.value)}
          >
            <option value="">All Risk Tiers</option>
            <option value="LOW">Low Risk</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="HIGH">High Risk</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn-primary">
            🔍 Apply Filter
          </button>
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {/* Consented Farmers Table */}
      <div className="terminal-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <span>📋</span> Consented Farmers Available for Underwriting ({farmers.length})
            </h3>
            <p className="card-subtitle">
              Consent token verified • Zero-PII masked identifiers • Model A/B/C/D telemetry ready
            </p>
          </div>
          <span className="badge-grade">SBI CONSENT REPOSITORY</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Verifying cryptographic consents across distributed ledger...
          </div>
        ) : farmers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No farmers found matching these filters with active sovereign consent.
          </div>
        ) : (
          <div className="terminal-table-container">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Farmer Code</th>
                  <th>Crops Cultivated</th>
                  <th>Region</th>
                  <th>AgriTrust Score</th>
                  <th>Risk Tier</th>
                  <th>Safe Limit</th>
                  <th>Consent Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer) => {
                  const expiryDate = new Date(farmer.consent_expires_at).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={farmer.farmer_id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {farmer.farmer_code}
                      </td>
                      <td>{farmer.crop_name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{farmer.region}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                            {farmer.agritrust_score}
                          </span>
                          <span className="badge-grade">{farmer.score_grade}</span>
                        </div>
                      </td>
                      <td>
                        <span className={farmer.risk_category === 'LOW' ? 'badge-risk-low' : farmer.risk_category === 'MODERATE' ? 'badge-risk-moderate' : 'badge-risk-high'}>
                          {farmer.risk_category}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>
                        ₹{Number(farmer.safe_limit).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {expiryDate}
                      </td>
                      <td>
                        <button
                          className="btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                          onClick={() => onSelectFarmer(farmer.farmer_id, farmer.consent_token)}
                        >
                          Open Dossier →
                        </button>
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
