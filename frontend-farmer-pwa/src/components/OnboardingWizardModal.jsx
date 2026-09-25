import React, { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  MapPin,
  Maximize2,
  Wheat,
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Sprout,
} from 'lucide-react';

export default function OnboardingWizardModal({ isOpen, onClose, onComplete, initialUser }) {
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    location: initialUser?.cluster || 'Village Bhadson, Ludhiana Cluster, Punjab',
    farmSize: initialUser?.acreage || '4.2 Acres',
    fieldName: 'Plot #184/A (North Parcel)',
    crop: initialUser?.crop || 'Wheat (HD 3086)',
    sowingDate: '2025-11-10',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Completed all 5 steps
      const updatedUser = {
        ...initialUser,
        cluster: formData.location,
        acreage: formData.farmSize,
        crop: formData.crop,
        sowingDate: formData.sowingDate,
        hasCompletedOnboarding: true,
      };
      if (onComplete) {
        onComplete(updatedUser);
      }
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '24px' }}
      >
        {/* Top Header */}
        <div className="modal-header-row" style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sprout size={18} strokeWidth={2.4} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                FARM SETUP WIZARD
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                Welcome to SANJEEVANI
              </div>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close setup modal">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Progress Bar (5 Steps) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && '1. Your Location'}
              {step === 2 && '2. Farm Size'}
              {step === 3 && '3. Add Field'}
              {step === 4 && '4. Select Crop'}
              {step === 5 && '5. Sowing Date'}
            </span>
          </div>
          <div style={{ height: '5px', width: '100%', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(step / 5) * 100}%`,
                background: '#10b981',
                borderRadius: '999px',
                transition: 'width 0.25s ease',
              }}
            ></div>
          </div>
        </div>

        {/* Step Body */}
        <div style={{ minHeight: '190px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px' }}>
                <MapPin size={18} />
                <span>Where is your farm located?</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                This connects your field to the nearest APMC Mandi, Sentinel-2 satellite pass, and hyperlocal weather radar.
              </p>
              <input
                type="text"
                className="input-custom-field"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Village Bhadson, Ludhiana Cluster, Punjab"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px' }}>
                <Maximize2 size={18} />
                <span>Total Farm Size (in Acres)</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Used to compute your scale of finance, safe credit limit, and DAP fertilizer requirements.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['2.5 Acres', '4.2 Acres', '6.0 Acres', '10.5 Acres'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, farmSize: size })}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      borderRadius: '8px',
                      border: formData.farmSize === size ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: formData.farmSize === size ? '#ecfdf5' : '#ffffff',
                      color: formData.farmSize === size ? '#065f46' : '#334155',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px' }}>
                <Sprout size={18} />
                <span>Name your primary field or plot</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Give this plot a recognizable name so you can track soil moisture and NDVI vegetation index independently.
              </p>
              <input
                type="text"
                value={formData.fieldName}
                onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                placeholder="e.g. Field A (Plot #184/A)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px' }}>
                <Wheat size={18} />
                <span>Select Primary Sown Crop</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Sanjeevani loads specific GDD (Growing Degree Day) models and mandi benchmarks for this crop.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { name: 'Wheat (HD 3086)', season: 'Rabi • Certified High Yield' },
                  { name: 'Mustard (Pusa Bold)', season: 'Rabi • High Oil Content' },
                  { name: 'Sugarcane (Co 0238)', season: 'Annual • Cash Crop' },
                ].map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setFormData({ ...formData, crop: c.name })}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: formData.crop === c.name ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: formData.crop === c.name ? '#ecfdf5' : '#ffffff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: formData.crop === c.name ? '#065f46' : '#1e293b' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{c.season}</div>
                    </div>
                    {formData.crop === c.name && <CheckCircle2 size={16} color="#059669" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '14px' }}>
                <Calendar size={18} />
                <span>Sowing Date</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
                Used to pinpoint your Crown Root Initiation (CRI) irrigation window, flowering schedule, and harvest readiness.
              </p>
              <input
                type="date"
                value={formData.sowingDate}
                onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '11.5px', color: '#059669', background: '#ecfdf5', padding: '8px 12px', borderRadius: '8px' }}>
                ✓ Stage calculated: <strong>Day 22 (Crown Root Initiation)</strong>. First irrigation and nitrogen top-dressing recommended now.
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
          {step > 1 ? (
            <button
              type="button"
              className="btn-consent-decline"
              onClick={handleBack}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px' }}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            className="rabi-request-loan-btn"
            onClick={handleNext}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <span>{step === 5 ? 'Launch Personalized Farm' : 'Continue'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
