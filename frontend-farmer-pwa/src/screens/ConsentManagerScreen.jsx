import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function ConsentManagerScreen({ lenders = [], onGrantConsent, onRevokeConsent }) {
  const { t } = useTranslation();
  const [activeToggles, setActiveToggles] = useState({});
  const [processingLenderId, setProcessingLenderId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Available attributes with plain-language disclosure
  const CONSENT_ATTRIBUTES = [
    {
      id: 'agritrust_score',
      nameKey: 'attr_agritrust_score',
      descKey: 'attr_agritrust_score_desc',
      defaultActive: true,
    },
    {
      id: 'safe_limit',
      nameKey: 'attr_safe_limit',
      descKey: 'attr_safe_limit_desc',
      defaultActive: true,
    },
    {
      id: 'crop_risk',
      nameKey: 'attr_crop_risk',
      descKey: 'attr_crop_risk_desc',
      defaultActive: true,
    },
    {
      id: 'satellite_ndvi',
      nameKey: 'attr_satellite_ndvi',
      descKey: 'attr_satellite_ndvi_desc',
      defaultActive: false,
    },
    {
      id: 'market_history',
      nameKey: 'attr_market_history',
      descKey: 'attr_market_history_desc',
      defaultActive: false,
    },
  ];

  const getLenderAttributes = (lender) => {
    return activeToggles[lender.lender_id] || lender.shared_attributes || ['agritrust_score', 'safe_limit'];
  };

  const handleToggleAttribute = (lenderId, attrId) => {
    const current = activeToggles[lenderId] || ['agritrust_score', 'safe_limit'];
    const updated = current.includes(attrId)
      ? current.filter((id) => id !== attrId)
      : [...current, attrId];

    setActiveToggles({
      ...activeToggles,
      [lenderId]: updated,
    });
  };

  const handleGrant = async (lender) => {
    setProcessingLenderId(lender.lender_id);
    const attributesToShare = getLenderAttributes(lender);

    try {
      if (onGrantConsent) {
        await onGrantConsent({
          lenderId: lender.lender_id,
          sharedAttributes: attributesToShare,
          validityDays: 30,
        });
        setSuccessMessage(`Consent granted to ${lender.name} for 30 days.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } finally {
      setProcessingLenderId(null);
    }
  };

  const handleRevoke = async (lender) => {
    setProcessingLenderId(lender.lender_id);
    try {
      if (onRevokeConsent) {
        await onRevokeConsent(lender.lender_id, lender.consent_id);
        setSuccessMessage(`Consent revoked from ${lender.name}. Access terminated immediately.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } finally {
      setProcessingLenderId(null);
    }
  };

  return (
    <div className="screen-content">
      {/* Toast Notification */}
      {successMessage && (
        <div
          style={{
            background: 'linear-gradient(90deg, #059669, #10b981)',
            color: '#ffffff',
            padding: '10px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          }}
        >
          🛡️ {successMessage}
        </div>
      )}

      {/* Sovereign Notice Card */}
      <div className="pwa-card pwa-card-emerald">
        <div className="card-title-sm">🔐 {t('consent_title')}</div>
        <div className="card-title-main" style={{ fontSize: '1.3rem' }}>
          Sovereign Data Governance
        </div>
        <p className="card-desc" style={{ marginTop: '6px' }}>
          {t('consent_subtitle')}
        </p>

        {/* Zero-PII Guarantee Box */}
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#34d399',
            lineHeight: 1.35,
          }}
        >
          🔒 <strong>{t('consent_zero_pii_notice')}</strong>
        </div>
      </div>

      {/* Lender Consent Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {lenders.map((lender) => {
          const isActive = lender.status === 'active';
          const isRevoked = lender.status === 'revoked';
          const isExpired = lender.status === 'expired';
          const isProcessing = processingLenderId === lender.lender_id;
          const currentAttrs = getLenderAttributes(lender);

          return (
            <div
              key={lender.lender_id}
              className={`consent-lender-card ${isActive ? 'active' : ''}`}
            >
              {/* Lender Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{lender.logo || '🏦'}</span>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
                      {lender.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {lender.branch}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {isActive && (
                  <span className="badge-pill badge-active">
                    ● {t('consent_active_badge')}
                  </span>
                )}
                {isRevoked && (
                  <span className="badge-pill badge-revoked">
                    ✕ {t('consent_revoked_badge')}
                  </span>
                )}
                {isExpired && (
                  <span className="badge-pill badge-expired">
                    ⏳ {t('consent_expired_badge')}
                  </span>
                )}
                {!isActive && !isRevoked && !isExpired && (
                  <span className="badge-pill" style={{ background: '#1e293b', color: '#94a3b8' }}>
                    ○ Inactive
                  </span>
                )}
              </div>

              {/* Validity Details & Cryptographic Token */}
              {isActive && (
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.35)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                    <span>{t('consent_valid_until')}:</span>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                      {lender.expires_at ? new Date(lender.expires_at).toLocaleDateString() : 'In 30 Days'}
                    </span>
                  </div>
                  {lender.token && (
                    <div style={{ wordBreak: 'break-all', color: '#38bdf8', fontSize: '0.72rem', marginTop: '2px' }}>
                      🔑 <strong>{t('consent_token_label')}:</strong> {lender.token}
                    </div>
                  )}
                </div>
              )}

              {/* Granular Attribute Toggles Section */}
              <div style={{ marginTop: '4px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  What this lender can see:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {CONSENT_ATTRIBUTES.map((attr) => {
                    const isChecked = currentAttrs.includes(attr.id);
                    return (
                      <div key={attr.id} className="attribute-toggle-row">
                        <div className="attr-info">
                          <span className="attr-name">{t(attr.nameKey)}</span>
                          <span className="attr-desc">{t(attr.descKey)}</span>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAttribute(lender.lender_id, attr.id)}
                            disabled={isProcessing}
                          />
                          <span className="slider" />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Grant or Revoke */}
              <div style={{ marginTop: '8px' }}>
                {isActive ? (
                  <button
                    type="button"
                    className="pwa-btn pwa-btn-danger"
                    onClick={() => handleRevoke(lender)}
                    disabled={isProcessing}
                  >
                    <span>🛑</span>
                    <span>{isProcessing ? 'Revoking Access...' : t('consent_revoke_btn')}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pwa-btn pwa-btn-primary"
                    onClick={() => handleGrant(lender)}
                    disabled={isProcessing}
                  >
                    <span>🤝</span>
                    <span>{isProcessing ? 'Signing Consent...' : t('consent_grant_btn')}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
