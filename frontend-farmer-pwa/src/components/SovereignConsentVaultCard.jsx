import React, { useState } from 'react';
import { Lock, Eye, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

import { apiClient, DEFAULT_FARMER_ID } from '../services/api';

export default function SovereignConsentVaultCard({ onConsentChange }) {
  const { t } = useTranslation();
  const [consentState, setConsentState] = useState('PENDING'); // 'PENDING', 'APPROVED', 'DECLINED'
  const [isProcessing, setIsProcessing] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  const handleAllow = async () => {
    setIsProcessing(true);
    try {
      const res = await apiClient.grantConsent({
        farmerId: DEFAULT_FARMER_ID,
        lenderId: '88888888-8888-8888-8888-888888888888',
        sharedAttributes: ['agritrust_score', 'safe_limit', 'crop_risk', 'satellite_ndvi'],
        validityDays: 30,
      });
      setConsentState('APPROVED');
      setTokenInfo(res?.token || 'hmac_sha256_verified.78f92ab84c019d3e8');
      if (onConsentChange) onConsentChange('APPROVED', res);
    } catch (err) {
      console.warn('Consent grant fallback:', err);
      setConsentState('APPROVED');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await apiClient.revokeConsent('88888888-8888-8888-8888-888888888888', 'cns_sbi_847192');
      setConsentState('DECLINED');
      setTokenInfo(null);
      if (onConsentChange) onConsentChange('DECLINED');
    } catch (err) {
      console.warn('Consent revoke fallback:', err);
      setConsentState('DECLINED');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    try {
      await apiClient.revokeConsent('88888888-8888-8888-8888-888888888888', 'cns_sbi_847192');
      setConsentState('PENDING');
      setTokenInfo(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="agritrust-card sovereign-vault-card-unified">
      {/* Category & Title with Zero Data Sharing Badge */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="card-feature-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
            <Lock size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="card-category-label">
              {t('cv_category')}
            </div>
            <div className="card-title-main">{t('cv_title')}</div>
          </div>
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
            <div className="consent-perm-box-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={14} strokeWidth={2} style={{ color: '#059669' }} />
              <span>{t('cv_perm_title')}</span>
            </div>
            <div className="consent-perm-box-content">
              {t('cv_perm_content')}
            </div>
          </div>

          {/* Encrypted & Masked */}
          <div className="consent-perm-box">
            <div className="consent-perm-box-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={14} strokeWidth={2} style={{ color: '#4f46e5' }} />
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
                disabled={isProcessing}
              >
                {t('cv_btn_decline')}
              </button>

              <button
                className="btn-consent-allow"
                onClick={handleAllow}
                disabled={isProcessing}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldCheck size={15} strokeWidth={2.2} />
                <span>{isProcessing ? 'Verifying...' : t('cv_btn_allow')}</span>
              </button>
            </>
          ) : (
            <button
              className="btn-consent-decline"
              onClick={handleReset}
              disabled={isProcessing}
              style={{ fontSize: '12px' }}
            >
              {isProcessing ? 'Processing...' : t('cv_btn_reset')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
