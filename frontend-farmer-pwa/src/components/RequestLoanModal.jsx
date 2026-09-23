import React, { useState } from 'react';
import { CheckCircle2, BadgeCheck, X } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function RequestLoanModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 900);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isSuccess && <CheckCircle2 size={18} strokeWidth={2.2} style={{ color: '#10B981' }} />}
            <span>{isSuccess ? t('rl_pill') : t('modal_loan_title')}</span>
          </div>
          <button className="modal-close-btn" onClick={handleClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '10px 0', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <BadgeCheck size={36} strokeWidth={2} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#13532f' }}>
              {t('modal_loan_success')}
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Sanction reference <strong>#AGR-RABI-2025-9941</strong>. {t('rl_dbt_note')}.
            </p>
            <button
              className="rabi-request-loan-btn"
              onClick={handleClose}
              style={{ alignSelf: 'center', marginTop: '6px' }}
            >
              OK
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f4faf5', border: '1px solid #e1efe4', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{t('modal_loan_amount')}:</span>
                <strong style={{ color: '#13532f', fontSize: '16px' }}>{t('rl_sanctioned_val')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{t('rl_rate_label')}:</span>
                <strong>{t('rl_rate_val')} ({t('rl_rate_sub')})</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{t('rl_tenure_label')}:</span>
                <strong>{t('rl_tenure_val')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>{t('modal_loan_disburse_to')}:</span>
                <strong>Bank of Baroda (...4019)</strong>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
              {t('modal_loan_subtitle')}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-consent-decline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('modal_loan_cancel')}
              </button>
              <button
                className="rabi-request-loan-btn"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? '...' : t('modal_loan_confirm_btn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
