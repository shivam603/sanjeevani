import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  style = {},
  variant = 'glass', // 'glass' | 'elevated' | 'outlined' | 'warm' | 'blue'
  ...props
}) => {
  const cardStyles = {
    glass: {
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      boxShadow: 'var(--glass-highlight), var(--glass-shadow-md)',
    },
    elevated: {
      background: 'var(--glass-bg-elevated)',
      backdropFilter: 'var(--glass-blur-lg)',
      WebkitBackdropFilter: 'var(--glass-blur-lg)',
      border: '1px solid rgba(255, 255, 255, 0.22)',
      boxShadow: 'var(--glass-highlight-prominent), var(--glass-shadow-lg), var(--glass-shadow-ambient)',
    },
    outlined: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'var(--glass-blur-sm)',
      WebkitBackdropFilter: 'var(--glass-blur-sm)',
      border: '1px solid rgba(164, 141, 108, 0.35)',
      boxShadow: 'var(--glass-highlight)',
    },
    warm: {
      background: 'linear-gradient(135deg, rgba(84, 30, 13, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(164, 141, 108, 0.4)',
      boxShadow: 'var(--glass-highlight), var(--glass-shadow-warm)',
    },
    blue: {
      background: 'linear-gradient(135deg, rgba(52, 91, 138, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid rgba(96, 165, 250, 0.35)',
      boxShadow: 'var(--glass-highlight), var(--glass-shadow-ambient)',
    },
  };

  const containerStyle = {
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    color: 'var(--text-primary)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform var(--transition-glass), box-shadow var(--transition-glass), border-color var(--transition-glass)',
    ...(cardStyles[variant] || cardStyles.glass),
    ...style,
  };

  return (
    <div style={containerStyle} className={`liquid-glass-card kisan-card ${className}`} {...props}>
      {/* Specular Edge Highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '12%',
          right: '12%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.38) 50%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.20rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
