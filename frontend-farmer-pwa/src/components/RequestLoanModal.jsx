import React, { useState } from 'react';

export default function RequestLoanModal({ isOpen, onClose }) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title">
            {isSuccess ? '✅ कर्ज मंजूर (Loan Approved)' : 'रब्बी पेरणी कर्ज सहाय्य (Request Rabi Loan)'}
          </div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {isSuccess ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '48px' }}>🎉</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#13532f' }}>
              ₹45,000 DBT Disbursal Initiated!
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Sanction reference <strong>#AGR-RABI-2025-9941</strong> generated. Amount is being credited to your Bank of Baroda (A/C ...4019) under the 4.0% Govt. Interest Subvention scheme.
            </p>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px', fontSize: '12px', color: '#15803d' }}>
              No branch visit needed. Repayment scheduled for May 2026 post-harvest.
            </div>
            <button
              className="rabi-request-loan-btn"
              onClick={onClose}
              style={{ alignSelf: 'center', marginTop: '6px' }}
            >
              पूर्ण झाले (Done)
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: '#f4faf5', border: '1px solid #e1efe4', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Sanction Amount:</span>
                <strong style={{ color: '#13532f', fontSize: '16px' }}>₹45,000</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Interest Rate:</span>
                <strong>4.0% p.a. (Govt. Subvention)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Repayment Type:</span>
                <strong>Bullet (May 2026)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Target Bank Account:</span>
                <strong>Bank of Baroda (...4019)</strong>
              </div>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.4 }}>
              By confirming, you authorize direct benefit transfer into your Aadhaar-linked account under your AgriTrust Pre-Approved Credit Passport headroom.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                className="btn-consent-decline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                रद्द करा (Cancel)
              </button>
              <button
                className="rabi-request-loan-btn"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'प्रक्रिया सुरू आहे...' : 'कर्ज मंजूर करा (Confirm Loan)'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
