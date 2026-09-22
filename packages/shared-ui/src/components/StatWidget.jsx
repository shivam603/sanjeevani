import React from 'react';

export const StatWidget = ({
  label,
  value,
  change,
  isPositive = true,
  icon = null,
  accentColor = '#345B8A',
}) => {
  return (
    <div
      className="liquid-glass-card"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        boxShadow: 'var(--glass-highlight), var(--glass-shadow-md)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform var(--transition-glass), box-shadow var(--transition-glass)',
      }}
    >
      {/* Top Specular Shine */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.35) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
          {label}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.9rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: '0.80rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              color: isPositive ? '#6ee7b7' : '#fca5a5',
              background: isPositive ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>vs last season</span>
        </div>
      )}
    </div>
  );
};

export default StatWidget;
