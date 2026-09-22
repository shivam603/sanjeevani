import React, { useState } from 'react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'gold' | 'danger' | 'blue' | 'warm'
  size = 'md',        // 'sm' | 'md' | 'lg'
  onClick,
  disabled = false,
  fullWidth = false,
  icon = null,
  className = '',
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    border: '1px solid transparent',
    borderRadius: 'var(--radius-pill)',
    backdropFilter: 'var(--glass-blur-sm)',
    WebkitBackdropFilter: 'var(--glass-blur-sm)',
    transition: 'all var(--transition-glass-fast)',
    textDecoration: 'none',
    width: fullWidth ? '100%' : 'auto',
    transform: isActive && !disabled ? 'scale(0.97)' : isHovered && !disabled ? 'translateY(-1px)' : 'none',
    userSelect: 'none',
  };

  const sizeStyles = {
    sm: { padding: '7px 14px', fontSize: '0.82rem' },
    md: { padding: '10px 20px', fontSize: '0.90rem' },
    lg: { padding: '13px 26px', fontSize: '1.0rem' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, rgba(242, 242, 241, 0.95) 0%, rgba(183, 170, 156, 0.9) 100%)',
      color: '#0E0C0B',
      border: '1px solid rgba(255, 255, 255, 0.7)',
      boxShadow: '0 4px 16px rgba(255, 255, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
      fontWeight: 600,
    },
    secondary: {
      background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
      color: 'var(--text-primary)',
      border: isHovered ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(255, 255, 255, 0.16)',
      boxShadow: 'var(--glass-highlight), 0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    outline: {
      background: isHovered ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid rgba(255, 255, 255, 0.22)',
      boxShadow: isHovered ? 'var(--glass-highlight)' : 'none',
    },
    gold: {
      background: isHovered
        ? 'linear-gradient(135deg, rgba(164, 141, 108, 0.85) 0%, rgba(84, 30, 13, 0.85) 100%)'
        : 'linear-gradient(135deg, rgba(164, 141, 108, 0.65) 0%, rgba(84, 30, 13, 0.65) 100%)',
      color: '#F2F2F1',
      border: '1px solid rgba(164, 141, 108, 0.45)',
      boxShadow: 'var(--glass-highlight), 0 4px 18px rgba(164, 141, 108, 0.25)',
      fontWeight: 600,
    },
    danger: {
      background: isHovered ? 'rgba(248, 113, 113, 0.25)' : 'rgba(248, 113, 113, 0.15)',
      color: '#fca5a5',
      border: '1px solid rgba(248, 113, 113, 0.35)',
      boxShadow: '0 4px 14px rgba(248, 113, 113, 0.2)',
    },
    blue: {
      background: isHovered
        ? 'linear-gradient(135deg, rgba(52, 91, 138, 0.85) 0%, rgba(34, 63, 99, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(52, 91, 138, 0.65) 0%, rgba(34, 63, 99, 0.75) 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(96, 165, 250, 0.4)',
      boxShadow: 'var(--glass-highlight), 0 4px 20px rgba(52, 91, 138, 0.35)',
      fontWeight: 500,
    },
    warm: {
      background: isHovered
        ? 'linear-gradient(135deg, rgba(84, 30, 13, 0.85) 0%, rgba(161, 78, 50, 0.75) 100%)'
        : 'linear-gradient(135deg, rgba(84, 30, 13, 0.65) 0%, rgba(161, 78, 50, 0.55) 100%)',
      color: '#FFFFFF',
      border: '1px solid rgba(164, 141, 108, 0.45)',
      boxShadow: 'var(--glass-highlight), 0 4px 20px rgba(84, 30, 13, 0.3)',
      fontWeight: 500,
    },
  };

  const combinedStyle = {
    ...baseStyles,
    ...(sizeStyles[size] || sizeStyles.md),
    ...(variantStyles[variant] || variantStyles.primary),
    ...style,
  };

  return (
    <button
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
      className={`liquid-glass-btn kisan-btn ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
