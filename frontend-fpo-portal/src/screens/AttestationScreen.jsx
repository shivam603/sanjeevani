import React, { useState } from 'react';

export default function AttestationScreen({
  pendingDeliveries = [],
  auditLogs = [],
  onAttestDelivery,
}) {
  const [attestingId, setAttestingId] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleAttest = async (delivery) => {
    setAttestingId(delivery.transaction_id);
    try {
      if (onAttestDelivery) {
        await onAttestDelivery(delivery.transaction_id, 'FPO_Admin_Kailas', 'Weighing slip & delivery verified');
        setSuccessToast(`Attestation recorded for ${delivery.farmer_name} (${delivery.crop_name}). Audit log entry created.`);
        setTimeout(() => setSuccessToast(null), 4000);
      }
    } finally {
      setAttestingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            background: 'linear-gradient(90deg, #059669, #10b981)',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 700,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
          }}
        >
          ⚖️ {successToast}
        </div>
      )}

      {/* Header Info Card */}
      <div className="portal-card portal-card-emerald">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Production Attestation Engine
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              Member Harvest & Delivery Verification
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '4px', maxWidth: '750px' }}>
              FPO attestation sets <code>verified_by_fpo = true</code> on market transactions. Verified sales directly feed Model A (Creditworthiness Engine) and boost member credit scores by +8 to 14 points.
            </p>
          </div>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            {pendingDeliveries.length} Pending Attestations
          </span>
        </div>
      </div>

      {/* Pending Deliveries Queue Table */}
      <div className="portal-card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
            Pending Crop Sales & Delivery Slips
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Deliveries submitted by member farmers awaiting FPO weighing & APMC slip verification
          </p>
        </div>

        <div className="portal-table-wrap" style={{ border: 'none' }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Tx ID</th>
                <th>Farmer Name</th>
                <th>Crop Variety</th>
                <th>Quantity Sold</th>
                <th>Realized Price</th>
                <th>Total Value</th>
                <th>APMC Mandi</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Attestation Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    ✅ All member delivery records are currently verified!
                  </td>
                </tr>
              ) : (
                pendingDeliveries.map((deliv) => (
                  <tr key={deliv.transaction_id}>
                    <td>
                      <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.78rem' }}>
                        {deliv.transaction_id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{deliv.farmer_name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Slip: {deliv.delivery_slip_ref}</div>
                    </td>
                    <td>{deliv.crop_name}</td>
                    <td>{deliv.quantity_sold} Qtl</td>
                    <td>₹{deliv.realization_price}/Qtl</td>
                    <td>
                      <strong style={{ color: '#10b981' }}>{formatCurrency(deliv.total_value_inr)}</strong>
                    </td>
                    <td>{deliv.mandi_name}</td>
                    <td>{deliv.transaction_date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAttest(deliv)}
                        disabled={attestingId === deliv.transaction_id}
                      >
                        <span>✓</span>
                        <span>{attestingId === deliv.transaction_id ? 'Verifying...' : 'Attest & Verify'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div className="portal-card" style={{ padding: 0 }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
              📜 Immutable Attestation Audit Trail
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Permanent cryptographic log of who verified what delivery, for which member, and when
            </p>
          </div>
          <span className="badge" style={{ background: '#1e293b', color: '#94a3b8' }}>
            {auditLogs.length} Audit Entries
          </span>
        </div>

        <div className="portal-table-wrap" style={{ border: 'none' }}>
          <table className="portal-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Tx Reference</th>
                <th>Member / Crop</th>
                <th>Attested By</th>
                <th>Notes / Verification Basis</th>
                <th>Timestamp (UTC)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.audit_id}>
                  <td>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                      {log.audit_id.slice(0, 16)}...
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#38bdf8', fontWeight: 600 }}>{log.transaction_id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{log.farmer_name || 'Member Farmer'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{log.crop_name || 'Verified Delivery'}</div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                      👤 {log.attested_by}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{log.notes || 'Verified'}</td>
                  <td style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-low">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
