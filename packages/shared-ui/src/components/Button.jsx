import React from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'gold' | 'danger'
  size = 'md',        // 'sm' | 'md' | 'lg'
  onClick,
  disabled = false,
  fullWidth = false,
  icon = null,
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    transition: 'all var(--transition-normal)',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
  };

  const sizeStyles = {
    sm: { padding: '6px 14px', fontSize: '0.85rem' },
    md: { padding: '10px 20px', fontSize: '0.95rem' },
    lg: { padding: '14px 28px', fontSize: '1.05rem', borderRadius: 'var(--radius-md)' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
      color: '#ffffff',
      boxShadow: '0 4px 14px var(--color-primary-glow)',
    },
    secondary: {
      background: 'var(--bg-surface-elevated)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-brand)',
      border: '1px solid var(--color-primary-light)',
    },
    gold: {
      background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-accent))',
      color: '#0f172a',
      boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
      color: '#ffffff',
    },
  };

  const combinedStyle = {
    ...baseStyles,
    ...(sizeStyles[size] || sizeStyles.md),
    ...(variantStyles[variant] || variantStyles.primary),
  };

  return (
    <button
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
      className={`kisan-btn ${className}`}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
};
