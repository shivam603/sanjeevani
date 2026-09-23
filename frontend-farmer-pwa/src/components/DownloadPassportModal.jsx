import React, { useEffect } from 'react';
import { Printer, X, Wheat, CreditCard, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function DownloadPassportModal({ isOpen, onClose, farmerData }) {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const name = farmerData?.name || t('farmer_name_display');
  const fpo = farmerData?.fpo || t('fpo_member_tag');

  return (
    <div className="agritrust-modal-overlay" onClick={onClose}>
      <div
        className="agritrust-modal-content passport-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Bar (Screen Only - Hidden in Print) */}
        <div className="passport-modal-actions-bar screen-only">
          <div className="passport-actions-left">
            <span className="passport-badge-live">● DPDP ACT 2023 COMPLIANT</span>
            <span className="passport-hash-pill">SHA256: 8a4c..d83a</span>
          </div>
          <div className="passport-actions-right">
            <button
              className="passport-print-btn"
              onClick={handlePrint}
              title={t('pass_print_btn')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} strokeWidth={2} />
              <span>{t('pass_print_btn')}</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* PRINTABLE PASSPORT SHEET (Rendered on screen & prints as A4 dossier) */}
        <div className="passport-printable-sheet" id="passport-document">
          {/* Passport Top Banner */}
          <div className="passport-sheet-header">
            <div className="passport-header-logos">
              <div className="passport-govt-emblem">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#13532f">
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5 10 5 10-5-5-2.5-5 2.5z" />
                </svg>
              </div>
              <div>
                <div className="passport-super-title">GOVERNMENT OF INDIA • DIGITAL AGRISTACK PUBLIC REPOSITORY</div>
                <div className="passport-org-title">AgriTrust Sovereign Credit Infrastructure</div>
              </div>
            </div>
            <div className="passport-doc-badge">
              <div className="passport-doc-code">PASS #78492019-D83A</div>
              <div className="passport-doc-validity">{t('pass_validity')}</div>
            </div>
          </div>

          <div className="passport-divider-line"></div>

          {/* Certificate Title */}
          <div className="passport-main-title-block">
            <h1 className="passport-title-text">{t('pass_modal_title')}</h1>
            <div className="passport-subtitle-text">
              Zero-PII Tamper-Proof Financial & Multi-Spectral Satellite Land Dossier
            </div>
          </div>

          {/* Farmer & Land Demographics Card */}
          <div className="passport-section-box">
            <div className="passport-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wheat size={16} strokeWidth={2} style={{ color: '#13532f' }} />
              <span>I. CADASTRAL & FARMER IDENTIFICATION (ZERO-PII)</span>
            </div>
            <div className="passport-demographics-grid">
              <div className="passport-field-item">
                <span className="p-field-label">Farmer Name</span>
                <span className="p-field-value">{name}</span>
              </div>
              <div className="passport-field-item">
                <span className="p-field-label">Farmer ID</span>
                <span className="p-field-value">FMR-PB-LDH-0042</span>
              </div>
              <div className="passport-field-item">
                <span className="p-field-label">Cadastral Plot #</span>
                <span className="p-field-value">184/A (4.20 Acres)</span>
              </div>
              <div className="passport-field-item">
                <span className="p-field-label">Crop & Strain</span>
                <span className="p-field-value">Rabi Wheat (HD 3086)</span>
              </div>
              <div className="passport-field-item">
                <span className="p-field-label">Village & District</span>
                <span className="p-field-value">Bhadson, Ludhiana, Punjab</span>
              </div>
              <div className="passport-field-item">
                <span className="p-field-label">FPO Affiliation</span>
                <span className="p-field-value">{fpo}</span>
              </div>
            </div>
          </div>

          {/* Financial Capacity & Credit Health Grid */}
          <div className="passport-section-box">
            <div className="passport-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={16} strokeWidth={2} style={{ color: '#13532f' }} />
              <span>II. VERIFIED CREDIT CAPACITY & CEILING SUMMARY</span>
            </div>
            <div className="passport-score-limit-grid">
              {/* Score Box */}
              <div className="passport-stat-cell">
                <div className="p-stat-title">{t('ch_category')}</div>
                <div className="p-stat-huge score-color">78 <span className="p-stat-unit">/ 100</span></div>
                <div className="p-stat-sub">Tier-1 Low Risk Sovereign Standing</div>
              </div>

              {/* Limit Box */}
              <div className="passport-stat-cell">
                <div className="p-stat-title">{t('sl_title')}</div>
                <div className="p-stat-huge limit-color">₹1,65,000</div>
                <div className="p-stat-sub">Maximum Safe Borrowing Ceiling</div>
              </div>

              {/* Headroom Box */}
              <div className="passport-stat-cell">
                <div className="p-stat-title">{t('sl_free_label')}</div>
                <div className="p-stat-huge headroom-color">₹1,20,000</div>
                <div className="p-stat-sub">Current Borrowed: ₹45,000 (SBI KCC)</div>
              </div>
            </div>
          </div>

          {/* Machine Learning Model Explainability (TreeSHAP) */}
          <div className="passport-section-box">
            <div className="passport-section-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} strokeWidth={2} style={{ color: '#13532f' }} />
              <span>III. XAI MODEL EXPLAINABILITY (TREESHAP FEATURE CONTRIBUTIONS)</span>
            </div>
            <div className="passport-shap-table">
              <div className="shap-row positive">
                <span className="shap-sign">+14 pts</span>
                <span className="shap-desc">100% On-time KCC Repayment History (2022–2024 cycles)</span>
                <span className="shap-source">RBI-CIBIL Agri Mapper</span>
              </div>
              <div className="shap-row positive">
                <span className="shap-sign">+12 pts</span>
                <span className="shap-desc">Verified Khanna APMC Mandi Sales Volume (42.0 Quintals Wheat)</span>
                <span className="shap-source">e-NAM APMC Feed</span>
              </div>
              <div className="shap-row positive">
                <span className="shap-sign">+8 pts</span>
                <span className="shap-desc">Sentinel-2 Multi-Spectral Biomass Health (Peak NDVI 0.74)</span>
                <span className="shap-source">ISRO/ESA Satellite</span>
              </div>
              <div className="shap-row positive">
                <span className="shap-sign">+6 pts</span>
                <span className="shap-desc">Enrolled in Pradhan Mantri Fasal Bima Yojana (PMFBY)</span>
                <span className="shap-source">PMFBY Portal</span>
              </div>
              <div className="shap-row neutral">
                <span className="shap-sign">-2 pts</span>
                <span className="shap-desc">Micro-climate rainfall deficit (-8% below historical average)</span>
                <span className="shap-source">IMD Ludhiana Radar</span>
              </div>
            </div>
          </div>

          {/* Cryptographic QR Code Verification & Seals */}
          <div className="passport-footer-verification-box">
            {/* Inline Precision SVG QR Code */}
            <div className="passport-qr-wrapper">
              <svg
                width="110"
                height="110"
                viewBox="0 0 140 140"
                className="passport-qr-svg"
              >
                {/* Background */}
                <rect width="140" height="140" fill="#ffffff" rx="8" />

                {/* Top-Left Finder Square */}
                <rect x="12" y="12" width="36" height="36" fill="#13532f" rx="4" />
                <rect x="18" y="18" width="24" height="24" fill="#ffffff" rx="2" />
                <rect x="24" y="24" width="12" height="12" fill="#13532f" rx="1" />

                {/* Top-Right Finder Square */}
                <rect x="92" y="12" width="36" height="36" fill="#13532f" rx="4" />
                <rect x="98" y="18" width="24" height="24" fill="#ffffff" rx="2" />
                <rect x="104" y="24" width="12" height="12" fill="#13532f" rx="1" />

                {/* Bottom-Left Finder Square */}
                <rect x="12" y="92" width="36" height="36" fill="#13532f" rx="4" />
                <rect x="18" y="98" width="24" height="24" fill="#ffffff" rx="2" />
                <rect x="24" y="104" width="12" height="12" fill="#13532f" rx="1" />

                {/* Timing patterns & Matrix sync bits */}
                <g fill="#13532f">
                  <rect x="52" y="20" width="6" height="6" />
                  <rect x="64" y="20" width="6" height="6" />
                  <rect x="76" y="20" width="6" height="6" />
                  <rect x="20" y="52" width="6" height="6" />
                  <rect x="20" y="64" width="6" height="6" />
                  <rect x="20" y="76" width="6" height="6" />

                  {/* Data payload bits */}
                  <rect x="52" y="36" width="6" height="6" />
                  <rect x="62" y="36" width="6" height="6" />
                  <rect x="72" y="46" width="6" height="6" />
                  <rect x="82" y="36" width="6" height="6" />
                  <rect x="52" y="52" width="8" height="8" rx="1" />
                  <rect x="66" y="52" width="8" height="8" rx="1" />
                  <rect x="80" y="52" width="8" height="8" rx="1" />
                  <rect x="94" y="52" width="8" height="8" rx="1" />
                  <rect x="52" y="66" width="8" height="8" rx="1" />
                  <rect x="66" y="66" width="8" height="8" rx="1" />
                  <rect x="80" y="66" width="8" height="8" rx="1" />
                  <rect x="94" y="66" width="8" height="8" rx="1" />
                  <rect x="108" y="66" width="8" height="8" rx="1" />
                  <rect x="36" y="80" width="8" height="8" rx="1" />
                  <rect x="52" y="80" width="8" height="8" rx="1" />
                  <rect x="66" y="80" width="8" height="8" rx="1" />
                  <rect x="80" y="80" width="8" height="8" rx="1" />
                  <rect x="94" y="80" width="8" height="8" rx="1" />
                  <rect x="108" y="80" width="8" height="8" rx="1" />
                  <rect x="52" y="94" width="8" height="8" rx="1" />
                  <rect x="66" y="94" width="8" height="8" rx="1" />
                  <rect x="80" y="94" width="8" height="8" rx="1" />
                  <rect x="94" y="94" width="8" height="8" rx="1" />
                  <rect x="108" y="94" width="8" height="8" rx="1" />
                  <rect x="122" y="94" width="8" height="8" rx="1" />
                  <rect x="52" y="108" width="6" height="6" />
                  <rect x="66" y="108" width="6" height="6" />
                  <rect x="80" y="108" width="6" height="6" />
                  <rect x="94" y="108" width="6" height="6" />
                  <rect x="108" y="108" width="6" height="6" />
                  <rect x="122" y="108" width="6" height="6" />
                  <rect x="52" y="122" width="6" height="6" />
                  <rect x="70" y="122" width="6" height="6" />
                  <rect x="88" y="122" width="6" height="6" />
                  <rect x="104" y="122" width="6" height="6" />
                  <rect x="122" y="122" width="6" height="6" />
                </g>

                {/* Center Badge Dot */}
                <circle cx="70" cy="70" r="7" fill="#15803d" />
                <circle cx="70" cy="70" r="3" fill="#ffffff" />
              </svg>
              <div className="passport-qr-code-text">sanjeevani.gov.in/verify</div>
            </div>

            {/* Verification Metadata & Signatures */}
            <div className="passport-verification-meta">
              <div className="p-meta-title">{t('pass_qr_title')}</div>
              <div className="p-meta-desc">{t('pass_qr_desc')}</div>

              <div className="passport-signoff-row">
                <div className="passport-sign-box">
                  <div className="sign-signature">Sachin Shinde</div>
                  <div className="sign-role">Khanna FPO Field Mitra #412</div>
                </div>

                <div className="passport-sign-box">
                  <div className="sign-signature digital-seal">✓ DIGITALLY VERIFIED</div>
                  <div className="sign-role">Lead District Manager (SBI Ludhiana)</div>
                </div>
              </div>

              <div className="p-meta-legal">
                {t('pass_auth_officer')} • {t('pass_watermark')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
