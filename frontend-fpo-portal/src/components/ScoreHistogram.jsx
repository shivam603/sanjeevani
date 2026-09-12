import React from 'react';

export default function ScoreHistogram({ distribution = {} }) {
  const tiers = [
    { label: '0–49 (High Risk)', count: distribution.tier_0_49 || 38, color: '#f43f5e', grade: 'Grade C' },
    { label: '50–69 (Moderate)', count: distribution.tier_50_69 || 116, color: '#f59e0b', grade: 'Grade B' },
    { label: '70–79 (Prime)', count: distribution.tier_70_79 || 194, color: '#10b981', grade: 'Grade A' },
    { label: '80–89 (Super Prime)', count: distribution.tier_80_89 || 102, color: '#34d399', grade: 'Grade AA' },
    { label: '90–100 (Elite)', count: distribution.tier_90_100 || 32, color: '#38bdf8', grade: 'Grade AAA' },
  ];

  const maxCount = Math.max(...tiers.map((t) => t.count), 1);

  return (
    <div className="portal-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            AgriTrust Score Distribution
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Cluster frequency distribution across 482 active member farmers
          </p>
        </div>
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
          74.2 Mean Score
        </span>
      </div>

      {/* Histogram Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tiers.map((tier, idx) => {
          const percentage = Math.round((tier.count / 482) * 100);
          const barWidth = Math.round((tier.count / maxCount) * 100);

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{tier.label}</span>
                <span style={{ color: tier.color, fontWeight: 700 }}>
                  {tier.count} farmers ({percentage}%)
                </span>
              </div>

              {/* Bar track */}
              <div style={{ width: '100%', height: '12px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    background: tier.color,
                    borderRadius: '6px',
                    transition: 'width 0.8s ease',
                    boxShadow: `0 0 10px ${tier.color}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
