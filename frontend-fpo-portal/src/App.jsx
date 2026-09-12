import React, { useState, useEffect } from 'react';
import { fpoApi, DEFAULT_FPO_ID, SEEDED_AUDIT_LOGS } from './services/api';
import './styles/portal.css';

import TopNav from './components/TopNav';
import PortfolioOverviewScreen from './screens/PortfolioOverviewScreen';
import MemberManagementScreen from './screens/MemberManagementScreen';
import AttestationScreen from './screens/AttestationScreen';
import BulkFinancingScreen from './screens/BulkFinancingScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [fpoId] = useState(DEFAULT_FPO_ID);

  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [auditLogs, setAuditLogs] = useState(SEEDED_AUDIT_LOGS);
  const [bulkData, setBulkData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [sumRes, memRes, pendRes, bulkRes] = await Promise.all([
          fpoApi.getPortfolioSummary(fpoId),
          fpoApi.getMembers(fpoId),
          fpoApi.getPendingAttestations(fpoId),
          fpoApi.getBulkFinancingSummary(fpoId),
        ]);

        setSummary(sumRes);
        setMembers(memRes);
        setPendingDeliveries(pendRes);
        setBulkData(bulkRes);
      } catch (err) {
        console.error('Error loading FPO portal data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [fpoId]);

  // Handle member passport retrieval
  const handleFetchMemberPassport = async (farmerId) => {
    return await fpoApi.getMemberPassport(farmerId, fpoId);
  };

  // Handle flagging member for data update
  const handleFlagMember = (farmerId) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.farmer_id === farmerId
          ? {
              ...m,
              needs_data_update: true,
              missing_data_reasons: m.missing_data_reasons?.length
                ? m.missing_data_reasons
                : ['Admin flagged: Telemetry update required for upcoming Rabi loan evaluation'],
            }
          : m
      )
    );
  };

  // Handle production attestation workflow
  const handleAttestDelivery = async (transactionId, attestedBy, notes) => {
    const res = await fpoApi.attestTransaction(transactionId, attestedBy, notes, fpoId);

    // Find the attested item to update state
    const targetItem = pendingDeliveries.find((p) => p.transaction_id === transactionId);

    // Remove from pending
    setPendingDeliveries((prev) => prev.filter((p) => p.transaction_id !== transactionId));

    // Prepend to audit log
    setAuditLogs((prev) => [
      {
        audit_id: res.audit_id || 'aud_' + Date.now(),
        fpo_id: fpoId,
        transaction_id: transactionId,
        farmer_name: targetItem?.farmer_name || 'Member Farmer',
        crop_name: targetItem ? `${targetItem.crop_name} (${targetItem.quantity_sold} Qtl)` : 'Crop Delivery',
        attested_by: attestedBy,
        notes: notes || 'Verified',
        created_at: res.attested_at || new Date().toISOString(),
      },
      ...prev,
    ]);

    // Recalculate summary metrics
    setSummary((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        total_verified_volume_inr: (prev.total_verified_volume_inr || 48200000) + (targetItem?.total_value_inr || 0),
        total_volume_quintals: (prev.total_volume_quintals || 19450) + (targetItem?.quantity_sold || 0),
      };
    });
  };

  return (
    <div className="portal-container">
      {/* Top Header */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        fpoName={summary?.fpo_name}
        fpoRegion={summary?.region}
        pendingAttestationCount={pendingDeliveries.length}
      />

      {/* Main Screen Content */}
      <main className="portal-main">
        {activeTab === 'overview' && (
          <PortfolioOverviewScreen
            summary={summary}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'members' && (
          <MemberManagementScreen
            members={members}
            onFetchMemberPassport={handleFetchMemberPassport}
            onFlagMember={handleFlagMember}
          />
        )}

        {activeTab === 'attestation' && (
          <AttestationScreen
            pendingDeliveries={pendingDeliveries}
            auditLogs={auditLogs}
            onAttestDelivery={handleAttestDelivery}
          />
        )}

        {activeTab === 'financing' && (
          <BulkFinancingScreen bulkData={bulkData} />
        )}

        {/* Footer */}
        <footer style={{ marginTop: '32px', textAlign: 'center', padding: '16px', color: '#64748b', fontSize: '0.78rem' }}>
          <div>Sanjeevani • FPO Cooperative Portal v0.1.0</div>
          <div>Multi-Tenant Role-Based Access Control • PostGIS 16 • SHA-256 Audit Trail</div>
        </footer>
      </main>
    </div>
  );
}
