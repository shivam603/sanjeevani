import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function CallMitraModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title">🌾 {t('modal_mitra_title')}</div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f7fbf8', border: '1px solid #e1efe4', borderRadius: '12px', padding: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#13532f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            👨‍🌾
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#112618' }}>{t('dbt_mitra_name')}</div>
            <div style={{ fontSize: '12px', color: '#5b7362' }}>{t('dbt_mitra_role')}</div>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>● {t('sa_village')} Sector</div>
          </div>
        </div>

        <p style={{ fontSize: '12.5px', color: '#64748b' }}>
          {t('modal_mitra_subtitle')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href="tel:+919822041829"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#13532f',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            <span>📞 {t('modal_mitra_call_now')} (+91 98220 41829)</span>
          </a>

          <a
            href="https://wa.me/919822041829?text=Namaste%20Sachin%20ji,%20I%20need%20assistance%20with%20my%20AgriTrust%20wheat%20crop%20advisory"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#25D366',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            <span>💬 {t('modal_mitra_whatsapp')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
