import React from 'react';

export const Badge = ({
  children,
  variant = 'success', // 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'grade' | 'blue' | 'warm'
  size = 'md',
  className = '',
  style = {},
}) => {
  const badgeColors = {
    success: { bg: 'rgba(52, 211, 153, 0.14)', text: '#6ee7b7', border: 'rgba(52, 211, 153, 0.35)' },
    warning: { bg: 'rgba(251, 191, 36, 0.14)', text: '#fde68a', border: 'rgba(251, 191, 36, 0.35)' },
    danger: { bg: 'rgba(248, 113, 113, 0.14)', text: '#fca5a5', border: 'rgba(248, 113, 113, 0.35)' },
    info: { bg: 'rgba(96, 165, 250, 0.14)', text: '#93c5fd', border: 'rgba(96, 165, 250, 0.35)' },
    neutral: { bg: 'rgba(255, 255, 255, 0.08)', text: 'var(--text-secondary)', border: 'rgba(255, 255, 255, 0.16)' },
    grade: { bg: 'linear-gradient(135deg, rgba(52, 91, 138, 0.3), rgba(164, 141, 108, 0.25))', text: '#F2F2F1', border: 'rgba(255, 255, 255, 0.25)' },
    blue: { bg: 'rgba(52, 91, 138, 0.22)', text: '#dbeafe', border: 'rgba(96, 165, 250, 0.35)' },
    warm: { bg: 'rgba(84, 30, 13, 0.25)', text: '#fed7aa', border: 'rgba(164, 141, 108, 0.35)' },
  };

  const badgeSize = {
    sm: { padding: '2px 8px', fontSize: '0.72rem' },
    md: { padding: '4px 12px', fontSize: '0.80rem' },
    lg: { padding: '6px 16px', fontSize: '0.90rem' },
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
        fontWeight: 500,
        letterSpacing: '0.01em',
        background: currentTheme.bg,
        color: currentTheme.text,
        border: `1px solid ${currentTheme.border}`,
        borderRadius: 'var(--radius-pill)',
        backdropFilter: 'var(--glass-blur-sm)',
        WebkitBackdropFilter: 'var(--glass-blur-sm)',
        boxShadow: 'var(--glass-highlight)',
        ...currentSize,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
