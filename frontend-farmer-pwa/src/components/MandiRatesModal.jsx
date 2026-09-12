import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function MandiRatesModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const rates = [
    { crop: 'Wheat (Gehu - HD 3086)', modal: '₹2,275 / Qtl', min: '₹2,220', max: '₹2,340', msp: '₹2,125', trend: '+₹150' },
    { crop: 'Mustard (Sarson / Rai)', modal: '₹5,450 / Qtl', min: '₹5,300', max: '₹5,600', msp: '₹5,650', trend: '+₹80' },
    { crop: 'Gram (Desi Chana)', modal: '₹5,800 / Qtl', min: '₹5,650', max: '₹5,950', msp: '₹5,440', trend: '+₹120' },
    { crop: 'Barley (Jau)', modal: '₹1,980 / Qtl', min: '₹1,900', max: '₹2,050', msp: '₹1,850', trend: '+₹30' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title">🏬 {t('modal_mandi_title')}</div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-6px' }}>
          {t('modal_mandi_subtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rates.map((r, i) => (
            <div
              key={i}
              style={{
                background: '#f8faf8',
                border: '1px solid #e2ece3',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#112618' }}>{r.crop}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                  Min: {r.min} &bull; Max: {r.max} &bull; {t('modal_mandi_msp')}: {r.msp}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#13532f' }}>{r.modal}</div>
                <span className="green-tag-pill">{r.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn-consent-decline"
          onClick={onClose}
          style={{ alignSelf: 'flex-end', marginTop: '6px' }}
        >
          {t('modal_mandi_close')}
        </button>
      </div>
    </div>
  );
}
