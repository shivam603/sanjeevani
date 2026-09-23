import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SovereignConsentVaultCard({ onConsentChange }) {
  const { t } = useTranslation();
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
    <div className="agritrust-card sovereign-vault-card-unified">
      {/* Category & Title with Zero Data Sharing Badge */}
      <div className="card-header-line">
        <div>
          <div className="card-category-label">
            <span style={{ marginRight: '4px' }}>🔒</span>
            {t('cv_category')}
          </div>
          <div className="card-title-main">{t('cv_title')}</div>
        </div>

        <div className="zero-otp-pill">{t('cv_zero_otp')}</div>
      </div>

      <div className="sovereign-vault-desc">
        {t('cv_desc')}
      </div>

      {/* Pending Consent Card */}
      <div className="sbi-pending-consent-card">
        {/* Top line with SBI name and status */}
        <div className="sbi-card-top-row">
          <div className="sbi-name-group">
            <div className="sbi-logo-square">SBI</div>
            <div className="sbi-title-text">{t('cv_sbi_title')}</div>
          </div>

          {consentState === 'PENDING' && (
            <span className="pending-consent-pill">{t('cv_pending_pill')}</span>
          )}
          {consentState === 'APPROVED' && (
            <span className="approved-consent-pill">{t('cv_active_pill')}</span>
          )}
          {consentState === 'DECLINED' && (
            <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '3px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
              {t('cv_declined_pill')}
            </span>
          )}
        </div>

        <div className="sbi-request-id-sub">
          {t('cv_request_id')}
        </div>

        {/* Permissions Split Grid */}
        <div className="consent-permissions-split-grid">
          {/* Permitted for Inspection */}
          <div className="consent-perm-box">
            <div className="consent-perm-box-title">
              <span>👁</span>
              <span>{t('cv_perm_title')}</span>
            </div>
            <div className="consent-perm-box-content">
              {t('cv_perm_content')}
            </div>
          </div>

          {/* Encrypted & Masked */}
          <div className="consent-perm-box">
            <div className="consent-perm-box-title">
              <span>🔒</span>
              <span>{t('cv_mask_title')}</span>
            </div>
            <div className="consent-perm-box-content">
              {t('cv_mask_content')}
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
                {t('cv_btn_decline')}
              </button>

              <button
                className="btn-consent-allow"
                onClick={handleAllow}
              >
                <span>🛡️</span>
                <span>{t('cv_btn_allow')}</span>
              </button>
            </>
          ) : (
            <button
              className="btn-consent-decline"
              onClick={() => setConsentState('PENDING')}
              style={{ fontSize: '12px' }}
            >
              {t('cv_btn_reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
