import React from 'react';

export const Badge = ({
  children,
  variant = 'success', // 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'grade'
  size = 'md',
  className = '',
  style = {},
}) => {
  const badgeColors = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    danger: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
    info: { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
    neutral: { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', border: 'rgba(148, 163, 184, 0.3)' },
    grade: { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(59, 130, 246, 0.25))', text: '#6ee7b7', border: '#10b981' },
  };

  const badgeSize = {
    sm: { padding: '2px 8px', fontSize: '0.72rem', borderRadius: '6px' },
    md: { padding: '4px 12px', fontSize: '0.82rem', borderRadius: '8px' },
    lg: { padding: '6px 16px', fontSize: '0.92rem', borderRadius: '10px' },
  };

  const currentTheme = badgeColors[variant] || badgeColors.success;
  const currentSize = badgeSize[size] || badgeSize.md;

  return (
    <span
      className={`kisan-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: currentTheme.bg,
        color: currentTheme.text,
        border: `1px solid ${currentTheme.border}`,
        ...currentSize,
        ...style,
      }}
    >
      {children}
    </span>
  );
};
