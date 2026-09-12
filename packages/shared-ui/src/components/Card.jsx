import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  style = {},
  variant = 'glass', // 'glass' | 'elevated' | 'outlined'
  ...props
}) => {
  const cardStyles = {
    glass: {
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
    },
    elevated: {
      background: '#1e293b',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
    },
    outlined: {
      background: '#0f172a',
      border: '1px solid rgba(16, 185, 129, 0.25)',
    },
  };

  const containerStyle = {
    borderRadius: '16px',
    padding: '24px',
    color: '#f8fafc',
    position: 'relative',
    overflow: 'hidden',
    ...(cardStyles[variant] || cardStyles.glass),
    ...style,
  };

  return (
    <div style={containerStyle} className={`kisan-card ${className}`} {...props}>
      {(title || headerAction) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px', margin: 0 }}>{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
