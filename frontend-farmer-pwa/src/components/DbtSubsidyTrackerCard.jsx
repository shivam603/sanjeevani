import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Landmark,
  ShieldCheck,
  Wheat,
  CreditCard,
  Building2,
  Phone,
  BadgeCheck,
  ExternalLink,
} from 'lucide-react';

export default function DbtSubsidyTrackerCard({ onCallMitra }) {
  const { t } = useTranslation();

  const dbtItems = [
    {
      scheme: 'PM-KISAN DBT',
      amount: '₹2,000',
      status: 'Credited',
      badgeClass: 'dbt-badge-success',
      desc: '17th Installment direct credit to Bank of Baroda (...4019).',
      officialUrl: 'https://pmkisan.gov.in',
      officialPortal: 'pmkisan.gov.in',
      icon: Landmark,
    },
    {
      scheme: 'PMFBY Rabi Insurance',
      amount: '₹1,42,800 Coverage',
      status: 'Active Policy',
      badgeClass: 'dbt-badge-active',
      desc: 'Policy #PB-RABI-9012 • 4.2 Acres Wheat protected against hail & unseasonal rain.',
      officialUrl: 'https://pmfby.gov.in',
      officialPortal: 'pmfby.gov.in',
      icon: ShieldCheck,
    },
    {
      scheme: 'Fertilizer Direct Subsidy',
      amount: 'Direct Subsidy',
      status: 'e-PoS Linked',
      badgeClass: 'dbt-badge-info',
      desc: 'Aadhaar authenticated allocation for Neem Coated Urea & DAP.',
      officialUrl: 'https://urvarak.nic.in',
      officialPortal: 'urvarak.nic.in',
      icon: Wheat,
    },
    {
      scheme: 'KCC 3% Interest Subvention',
      amount: '4.0% Net Rate',
      status: 'Eligible',
      badgeClass: 'dbt-badge-warning',
      desc: 'Prompt repayment subvention verified with Khanna FPO cluster.',
      officialUrl: 'https://agricoop.nic.in',
      officialPortal: 'agricoop.nic.in',
      icon: CreditCard,
    },
  ];

  return (
    <div className="agritrust-card dbt-card-enhanced" style={{ gap: '12px' }}>
      {/* 1. Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="card-feature-icon-box">
            <Landmark size={18} strokeWidth={2.2} />
          </div>
          <span className="card-category-label">{t('dbt_category')}</span>
        </div>

        <span className="green-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <BadgeCheck size={13} strokeWidth={2.2} />
          {t('dbt_verified')}
        </span>
      </div>

      {/* 2. Main Headline */}
      <div className="dbt-amount-heading" style={{ margin: '2px 0' }}>
        {t('dbt_heading')}
      </div>

      {/* 3. Bank Account & Aadhaar Mapping Bar */}
      <div className="dbt-bank-mapping-strip">
        <span className="dbt-bank-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <Building2 size={16} strokeWidth={2} />
        </span>
        <div className="dbt-bank-text">
          <strong>Bank of Baroda</strong> • A/C Ending in <strong>...4019</strong>
        </div>
        <span className="dbt-npci-badge">NPCI Active</span>
      </div>

      {/* 4. Structured DBT Scheme Status Bars */}
      <div className="dbt-status-bars-list">
        {dbtItems.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="dbt-scheme-row-bar">
              <div className="dbt-scheme-left">
                <span className="dbt-scheme-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={16} strokeWidth={2} />
                </span>
                <div className="dbt-scheme-info">
                  <div className="dbt-scheme-title-row">
                    <span className="dbt-scheme-name">{item.scheme}</span>
                    <span className={`dbt-status-pill ${item.badgeClass}`}>{item.status}</span>
                  </div>
                  <div className="dbt-scheme-desc">
                    {item.desc}
                    {item.officialUrl && (
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: '6px', color: '#059669', fontSize: '11px', textDecoration: 'none', fontWeight: 600 }}
                      >
                        Official Portal ({item.officialPortal}) <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <span className="dbt-scheme-amount">{item.amount}</span>
            </div>
          );
        })}
      </div>

      {/* Regulatory Informational Disclaimer */}
      <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35, background: 'rgba(255,255,255,0.6)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
        * Informational status tracking aggregated from public DBT MIS portals. Official benefit approvals and fund disbursements are managed exclusively by respective central/state department authorities.
      </div>

      {/* 5. Field Mitra Profile Bar */}
      <div className="dbt-mitra-profile-footer" style={{ marginTop: 'auto', paddingTop: '10px' }}>
        <div className="dbt-mitra-identity">
          <div className="dbt-mitra-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          <div>
            <div className="dbt-mitra-name-text">{t('dbt_mitra_name')}</div>
            <div className="dbt-mitra-role-text">{t('dbt_mitra_role')}</div>
          </div>
        </div>

        <button
          className="btn-call-mitra"
          onClick={onCallMitra}
          title={t('dbt_call_btn')}
          type="button"
        >
          <Phone size={14} strokeWidth={2} />
          <span>{t('dbt_call_btn')}</span>
        </button>
      </div>
    </div>
  );
}
