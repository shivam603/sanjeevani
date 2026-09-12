import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function KhannaMandiCard({ onOpenMandiModal }) {
  const { t } = useTranslation();

  return (
    <div className="agritrust-card" style={{ gap: '12px' }}>
      {/* Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>🏬</span>
          <span className="card-category-label">{t('km_category')}</span>
        </div>

        <span className="green-tag-pill">{t('km_diff')}</span>
      </div>

      {/* Big Price */}
      <div className="mandi-big-price-text">
        {t('km_price')} <span style={{ fontSize: '18px', fontWeight: 600 }}>{t('km_unit')}</span>
      </div>

      {/* Body Description */}
      <p className="mandi-card-body-text">
        {t('km_desc')}
      </p>

      {/* Footer */}
      <div className="mandi-card-footer-row">
        <span className="mandi-arrivals-note">{t('km_arrivals')}</span>
        <button
          onClick={onOpenMandiModal}
          style={{
            background: 'none',
            border: 'none',
            color: '#15803d',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t('km_btn')}
        </button>
      </div>
    </div>
  );
}
