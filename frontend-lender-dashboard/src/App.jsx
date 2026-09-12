import React, { useState, useEffect } from 'react';
import TopNav from './components/TopNav';
import PortfolioSearchScreen from './screens/PortfolioSearchScreen';
import FarmerDetailScreen from './screens/FarmerDetailScreen';
import ConsentRequestScreen from './screens/ConsentRequestScreen';
import LoanDecisionLogScreen from './screens/LoanDecisionLogScreen';
import { fetchConsentRequests, fetchLoanDecisions, recordLoanDecision } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedFarmerId, setSelectedFarmerId] = useState('3fa85f64-5717-4562-b3fc-2c963f66afa6');
  const [selectedConsentToken, setSelectedConsentToken] = useState('hmac_sha256_sbi_demo.78f92ab84c019d3e8');
  const [requestCount, setRequestCount] = useState(2);
  const [decisionCount, setDecisionCount] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchConsentRequests().then((data) => setRequestCount(data.length)).catch(() => {});
    fetchLoanDecisions().then((data) => setDecisionCount(data.length)).catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleSelectFarmer = (farmerId, consentToken) => {
    setSelectedFarmerId(farmerId);
    setSelectedConsentToken(consentToken);
    setActiveTab('dossier');
  };

  const handleDecisionLogged = async (decisionPayload) => {
    try {
      const res = await recordLoanDecision(decisionPayload);
      showToast(`Underwriting decision '${res.decision}' recorded successfully against passport ${res.passport_id.substring(0, 14)}...`);
      setDecisionCount((prev) => prev + 1);
      setActiveTab('decisions');
    } catch (err) {
      alert(`Error recording loan decision: ${err.message}`);
    }
  };

  return (
    <div className="lender-app">
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        requestCount={requestCount}
        decisionCount={decisionCount}
      />

      {toastMessage && (
        <div style={{ maxWidth: '1440px', margin: '14px auto 0', padding: '0 24px', width: '100%' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '12px 18px', borderRadius: 'var(--radius-md)', fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>✓ {toastMessage}</span>
            <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        </div>
      )}

      <main className="lender-main">
        {activeTab === 'portfolio' && (
          <PortfolioSearchScreen onSelectFarmer={handleSelectFarmer} />
        )}

        {activeTab === 'dossier' && (
          <FarmerDetailScreen
            farmerId={selectedFarmerId}
            consentToken={selectedConsentToken}
            onBack={() => setActiveTab('portfolio')}
            onDecisionLogged={handleDecisionLogged}
          />
        )}

        {activeTab === 'requests' && (
          <ConsentRequestScreen />
        )}

        {activeTab === 'decisions' && (
          <LoanDecisionLogScreen />
        )}
      </main>

      <footer className="lender-footer">
        Sanjeevani • Institutional Lending Terminal • RBI / DPDP Act Compliant Consent Fabric • Powered by PostGIS & Deep Learning
      </footer>
    </div>
  );
}
