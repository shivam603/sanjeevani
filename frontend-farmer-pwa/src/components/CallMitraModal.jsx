import React from 'react';

export default function CallMitraModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <div className="modal-title">🌾 FPO Field Mitra Support</div>
          <button className="modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#f7fbf8', border: '1px solid #e1efe4', borderRadius: '12px', padding: '16px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#13532f', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            👨‍🌾
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#112618' }}>Sachin Shinde</div>
            <div style={{ fontSize: '12px', color: '#5b7362' }}>Senior Extension Officer • सह्याद्री / खन्ना FPO</div>
            <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '2px' }}>● Available on Field (Bhadson Sector)</div>
          </div>
        </div>

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
            <span>📞 Call Sachin Shinde (+91 98220 41829)</span>
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
            <span>💬 Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
