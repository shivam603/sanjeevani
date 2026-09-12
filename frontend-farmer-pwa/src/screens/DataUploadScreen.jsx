import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { offlineQueue } from '../services/offlineQueue';

export default function DataUploadScreen({ isOnline, onUploadQueued }) {
  const { t } = useTranslation();
  const [activeFormTab, setActiveFormTab] = useState('receipt'); // 'receipt' | 'crop' | 'insurance'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form states
  const [receiptForm, setReceiptForm] = useState({
    mandiName: 'Lasalgaon APMC, Nashik',
    cropName: 'Red Onion (Garva)',
    quantityQuintals: '45.5',
    pricePerQuintal: '2480',
    receiptPhoto: null,
  });

  const [cropForm, setCropForm] = useState({
    cropName: 'Nashik Export Grapes',
    sowingDate: '2026-06-15',
    acreage: '2.4',
    expectedHarvestDate: '2026-11-20',
    fieldPhoto: null,
  });

  const [insuranceForm, setInsuranceForm] = useState({
    policyNumber: 'PMFBY/MH/2026/0918239',
    season: 'Kharif 2026',
    cropName: 'Soybean',
    insuredAmount: '125000',
    policyDoc: null,
  });

  const handleSimulatePhoto = (setter, currentForm, fieldName) => {
    // Generate simulated camera timestamp photo badge
    const simulatedPhotoName = `Photo_${Date.now().toString().slice(-4)}.jpg (GPS: 20.0059°N, 73.7898°E)`;
    setter({
      ...currentForm,
      [fieldName]: simulatedPhotoName,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    let formType = 'mandi_receipt';
    let payload = receiptForm;

    if (activeFormTab === 'crop') {
      formType = 'crop_cycle';
      payload = cropForm;
    } else if (activeFormTab === 'insurance') {
      formType = 'insurance_doc';
      payload = insuranceForm;
    }

    try {
      // Enqueue in offlineQueue
      const queuedItem = offlineQueue.enqueue(formType, payload);

      if (!isOnline) {
        setFeedback({
          type: 'offline',
          message: t('upload_offline_queued'),
        });
      } else {
        // If online, simulate fast network sync
        await new Promise((r) => setTimeout(r, 600));
        offlineQueue.markSynced(queuedItem.id);
        setFeedback({
          type: 'online',
          message: t('upload_online_success'),
        });
      }

      if (onUploadQueued) {
        onUploadQueued(queuedItem);
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="screen-content">
      {/* Header Card */}
      <div className="pwa-card pwa-card-emerald">
        <div className="card-title-sm">📤 {t('upload_title')}</div>
        <div className="card-title-main" style={{ fontSize: '1.25rem' }}>
          Farm Telemetry Submission
        </div>
        <p className="card-desc" style={{ marginTop: '6px' }}>
          {t('upload_subtitle')}
        </p>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          style={{
            background:
              feedback.type === 'offline'
                ? 'linear-gradient(90deg, #d97706, #b45309)'
                : 'linear-gradient(90deg, #059669, #10b981)',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 700,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {feedback.type === 'offline' ? '📶' : '✅'} {feedback.message}
        </div>
      )}

      {/* Form Tab Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: '#0f172a',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <button
          type="button"
          className={`pwa-btn ${activeFormTab === 'receipt' ? 'pwa-btn-primary' : 'pwa-btn-secondary'}`}
          style={{ minHeight: '40px', padding: '6px 8px', fontSize: '0.78rem' }}
          onClick={() => setActiveFormTab('receipt')}
        >
          🧾 {t('upload_tab_receipt')}
        </button>
        <button
          type="button"
          className={`pwa-btn ${activeFormTab === 'crop' ? 'pwa-btn-primary' : 'pwa-btn-secondary'}`}
          style={{ minHeight: '40px', padding: '6px 8px', fontSize: '0.78rem' }}
          onClick={() => setActiveFormTab('crop')}
        >
          🌱 {t('upload_tab_crop')}
        </button>
        <button
          type="button"
          className={`pwa-btn ${activeFormTab === 'insurance' ? 'pwa-btn-primary' : 'pwa-btn-secondary'}`}
          style={{ minHeight: '40px', padding: '6px 8px', fontSize: '0.78rem' }}
          onClick={() => setActiveFormTab('insurance')}
        >
          🛡️ {t('upload_tab_insurance')}
        </button>
      </div>

      {/* Dynamic Form Content */}
      <div className="pwa-card">
        <form onSubmit={handleSubmit}>
          {/* Form 1: Mandi Sale Receipt */}
          {activeFormTab === 'receipt' && (
            <>
              <div className="form-group">
                <label className="form-label">{t('upload_mandi_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptForm.mandiName}
                  onChange={(e) => setReceiptForm({ ...receiptForm, mandiName: e.target.value })}
                  placeholder={t('upload_mandi_placeholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('upload_crop_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={receiptForm.cropName}
                  onChange={(e) => setReceiptForm({ ...receiptForm, cropName: e.target.value })}
                  placeholder={t('upload_crop_placeholder')}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">{t('upload_quantity_label')}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={receiptForm.quantityQuintals}
                    onChange={(e) => setReceiptForm({ ...receiptForm, quantityQuintals: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('upload_price_label')}</label>
                  <input
                    type="number"
                    className="form-input"
                    value={receiptForm.pricePerQuintal}
                    onChange={(e) => setReceiptForm({ ...receiptForm, pricePerQuintal: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('upload_photo_label')}</label>
                <div
                  className="photo-upload-box"
                  onClick={() => handleSimulatePhoto(setReceiptForm, receiptForm, 'receiptPhoto')}
                >
                  <span style={{ fontSize: '1.8rem' }}>📷</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {receiptForm.receiptPhoto || t('upload_photo_placeholder')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Auto-attaches GPS survey coordinates & timestamp
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form 2: Crop Cycle Update */}
          {activeFormTab === 'crop' && (
            <>
              <div className="form-group">
                <label className="form-label">{t('upload_crop_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={cropForm.cropName}
                  onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                  placeholder={t('upload_crop_placeholder')}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">{t('upload_sowing_date_label')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={cropForm.sowingDate}
                    onChange={(e) => setCropForm({ ...cropForm, sowingDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('upload_acreage_label')}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={cropForm.acreage}
                    onChange={(e) => setCropForm({ ...cropForm, acreage: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('upload_expected_harvest_label')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={cropForm.expectedHarvestDate}
                  onChange={(e) => setCropForm({ ...cropForm, expectedHarvestDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('upload_photo_label')}</label>
                <div
                  className="photo-upload-box"
                  onClick={() => handleSimulatePhoto(setCropForm, cropForm, 'fieldPhoto')}
                >
                  <span style={{ fontSize: '1.8rem' }}>🌾</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {cropForm.fieldPhoto || 'Tap to take field photo for NDVI ground-truthing'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Form 3: PMFBY Insurance */}
          {activeFormTab === 'insurance' && (
            <>
              <div className="form-group">
                <label className="form-label">{t('upload_policy_no_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={insuranceForm.policyNumber}
                  onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">{t('upload_season_label')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={insuranceForm.season}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, season: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('upload_crop_label')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={insuranceForm.cropName}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, cropName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('upload_photo_label')}</label>
                <div
                  className="photo-upload-box"
                  onClick={() => handleSimulatePhoto(setInsuranceForm, insuranceForm, 'policyDoc')}
                >
                  <span style={{ fontSize: '1.8rem' }}>📄</span>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    {insuranceForm.policyDoc || 'Tap to photograph PMFBY receipt or certificate'}
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: '16px' }}>
            <button
              type="submit"
              className="pwa-btn pwa-btn-primary"
              disabled={isSubmitting}
            >
              <span>📥</span>
              <span>{isSubmitting ? 'Recording Submission...' : t('upload_submit_btn')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
