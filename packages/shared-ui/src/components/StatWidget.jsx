import React from 'react';

export const StatWidget = ({
  label,
  value,
  change,
  isPositive = true,
  icon = null,
  accentColor = '#10b981',
}) => {
  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{label}</span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
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
      <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
        {value}
      </div>
      {change && (
        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: isPositive ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
          <span style={{ color: '#64748b' }}>vs last season</span>
        </div>
      )}
    </div>
  );
};
