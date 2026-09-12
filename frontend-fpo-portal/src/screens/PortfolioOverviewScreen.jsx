import React from 'react';
import ScoreHistogram from '../components/ScoreHistogram';
import RiskMixBar from '../components/RiskMixBar';

export default function PortfolioOverviewScreen({ summary, onNavigateTab }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const dist = summary?.score_distribution || {};
  const risk = summary?.risk_mix || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Welcome Card */}
      <div className="portal-card portal-card-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cluster Credit & Ingestion Intelligence
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {summary?.fpo_name || 'Nashik Green Agro Farmer Producer Co. Ltd.'}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px', maxWidth: '750px' }}>
              Real-time aggregation across {summary?.total_members || 482} member farmers. Calibrated against satellite NDVI vegetative growth, AGMARKNET modal prices, and FPO-attested harvest sales.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigateTab && onNavigateTab('financing')}
            >
              🏛️ Bank Dossier
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigateTab && onNavigateTab('attestation')}
            >
              ⚖️ Attest Deliveries
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <div className="stat-box">
          <div className="stat-box-label">👥 Active Member Farmers</div>
          <div className="stat-box-val">{summary?.active_members || 468}</div>
          <div className="stat-box-sub">out of {summary?.total_members || 482} enrolled</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">📈 Mean Cluster Score</div>
          <div className="stat-box-val" style={{ color: '#10b981' }}>
            {summary?.mean_agritrust_score || 74.2} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ 100</span>
          </div>
          <div className="stat-box-sub">Grade A • Prime Cluster Standing</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">💰 Verified Sales Volume</div>
          <div className="stat-box-val" style={{ color: '#38bdf8' }}>
            {formatCurrency(summary?.total_verified_volume_inr || 48200000)}
          </div>
          <div className="stat-box-sub">19,450 Quintals verified via APMC</div>
        </div>

        <div className="stat-box">
          <div className="stat-box-label">🗺️ Mapped Farmland Area</div>
          <div className="stat-box-val">
            {summary?.total_mapped_hectares || 1150} Ha
          </div>
          <div className="stat-box-sub">100% PostGIS Polygon verified</div>
        </div>
      </div>

      {/* Visual Data Distribution Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        <ScoreHistogram distribution={dist} />
        <RiskMixBar riskMix={risk} />
      </div>
    </div>
  );
}
