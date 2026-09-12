import React, { useState } from 'react';

export default function SovereignConsentVaultCard({ onConsentChange }) {
  const [consentState, setConsentState] = useState('PENDING'); // 'PENDING', 'APPROVED', 'DECLINED'

  const handleAllow = () => {
    setConsentState('APPROVED');
    if (onConsentChange) onConsentChange('APPROVED');
  };

  const handleDecline = () => {
    setConsentState('DECLINED');
    if (onConsentChange) onConsentChange('DECLINED');
  };

  return (
    <div className="agritrust-card">
      {/* Category & Title with Zero Data Sharing Badge */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">
            <span style={{ marginRight: '4px' }}>🔒</span>
            DPDP ACT 2023 VERIFIED VAULT
          </div>
          <div className="card-title-main">तुमचा डेटा, तुमचा अधिकार (Sovereign Consent)</div>
        </div>

        <div className="zero-otp-pill">Zero Data Sharing Without OTP</div>
      </div>

      <div className="sovereign-vault-desc">
        You hold 100% sovereign ownership over your satellite farm boundary scans and Mandi sales slips. Revoke access anytime with single click.
      </div>

      {/* Pending Consent Card */}
      <div className="sbi-pending-consent-card">
        {/* Top line with SBI name and status */}
        <div className="sbi-card-top-row">
          <div className="sbi-name-group">
            <div className="sbi-logo-square">SBI</div>
            <div className="sbi-title-text">State Bank of India — Kisan Credit Card Wing</div>
          </div>

          {consentState === 'PENDING' && (
            <span className="pending-consent-pill">Pending Consent</span>
          )}
          {consentState === 'APPROVED' && (
            <span className="approved-consent-pill">✓ Consent Active (30 Days)</span>
          )}
          {consentState === 'DECLINED' && (
            <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
              ✕ Request Declined
            </span>
          )}
        </div>

        <div className="sbi-request-id-sub">
          Request ID: #AGR-SBI-9021 • Expires in 48 hours
        </div>

        {/* Permissions Split Grid */}
        <div className="consent-permissions-split-grid">
          {/* Permitted for Inspection */}
          <div className="consent-perm-box">
            <div className="consent-perm-box-title">
              <span>👁</span>
              <span>Permitted For Inspection:</span>
            </div>
            <div className="consent-perm-box-content">
              Crop Type (Gehu), Acreage (4.2 A), & 3–Year Mandi Sales
            </div>
          </div>

          {/* Encrypted & Masked */}
          <div className="consent-perm-box">
            <div className="consent-perm-box-title">
              <span>🔒</span>
              <span>Encrypted & Masked:</span>
            </div>
            <div className="consent-perm-box-content">
              Aadhaar number & bank savings account balance remain private
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="consent-action-buttons-row">
          {consentState === 'PENDING' ? (
            <>
              <button
                className="btn-consent-decline"
                onClick={handleDecline}
              >
                Decline (नकार)
              </button>

              <button
                className="btn-consent-allow"
                onClick={handleAllow}
              >
                <span>🛡️</span>
                <span>Allow Consent (संमती द्या)</span>
              </button>
            </>
          ) : (
            <button
              className="btn-consent-decline"
              onClick={() => setConsentState('PENDING')}
              style={{ fontSize: '12px' }}
            >
              Change Decision / Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
