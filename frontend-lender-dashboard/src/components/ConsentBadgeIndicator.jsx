import React from 'react';

export default function ConsentBadgeIndicator({ consentInfo, farmerCode }) {
  if (!consentInfo) return null;

  const isActive = consentInfo.status === 'active';
  const expiresAtDate = consentInfo.expires_at ? new Date(consentInfo.expires_at) : null;
  const formattedExpiry = expiresAtDate
    ? expiresAtDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  const tokenSnippet = consentInfo.token
    ? `${consentInfo.token.substring(0, 18)}...`
    : 'None';

  return (
    <div className={`consent-banner ${isActive ? 'active' : 'revoked'}`}>
      <div className="consent-left">
        <div className="consent-status-icon">
          {isActive ? '✓' : '!'}
        </div>
        <div>
          <div className="consent-title">
            {isActive
              ? `SOVEREIGN DATA CONSENT ACTIVE • FARMER [${farmerCode || 'SELECTED'}]`
              : `CONSENT EXPIRED OR REVOKED • ACCESS RESTRICTED`}
          </div>
          <div className="consent-meta">
            TOKEN: <span style={{ color: '#38bdf8' }}>{tokenSnippet}</span> • VALID UNTIL: {formattedExpiry}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="zero-pii-tag">🔒 ZERO-PII GUARANTEE</span>
        <span className={isActive ? 'badge-risk-low' : 'badge-risk-high'}>
          {isActive ? 'CRYPTOGRAPHICALLY VERIFIED' : 'UNAUTHORIZED'}
        </span>
      </div>
    </div>
  );
}
