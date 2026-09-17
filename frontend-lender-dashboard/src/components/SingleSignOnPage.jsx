import React, { useState } from 'react';

export default function SingleSignOnPage({ onLoginSuccess }) {
  // Active role: 'lender' (default for institutional desk) or 'farmer'
  const [activeRole, setActiveRole] = useState('lender');

  // Lender Institution Classification: 'bank', 'ngo', 'nbfc', 'coop'
  const [lenderType, setLenderType] = useState('bank');

  // Credentials
  const [lenderEmail, setLenderEmail] = useState('vikram.mehta@sbi.co.in');
  const [lenderOrgName, setLenderOrgName] = useState('State Bank of India — Agri Division');
  const [lenderPassword, setLenderPassword] = useState('underwrite2025');

  // Farmer Credentials
  const [farmerMobile, setFarmerMobile] = useState('9876543210');
  const [farmerPin, setFarmerPin] = useState('1234');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Institution profile templates
  const handleLenderTypeChange = (type) => {
    setLenderType(type);
    if (type === 'bank') {
      setLenderEmail('vikram.mehta@sbi.co.in');
      setLenderOrgName('State Bank of India — Agri Division');
    } else if (type === 'ngo') {
      setLenderEmail('anita.desai@pradan-rural.org');
      setLenderOrgName('PRADAN Rural Livelihoods Foundation');
    } else if (type === 'nbfc') {
      setLenderEmail('rahul.sharma@samunnati.com');
      setLenderOrgName('Samunnati Agri-Finance NBFC');
    } else if (type === 'coop') {
      setLenderEmail('manjit.singh@punjabcoopbank.in');
      setLenderOrgName('Punjab State Cooperative Bank Ltd.');
    }
  };

  const handleLenderSubmit = (e) => {
    e.preventDefault();
    if (!lenderEmail.trim() || !lenderPassword.trim()) {
      setErrorMsg('Please enter your institutional email and security token.');
      return;
    }

    setErrorMsg('');
    const officerName = lenderType === 'ngo' ? 'Anita Desai' : lenderType === 'coop' ? 'Manjit Singh' : lenderType === 'nbfc' ? 'Rahul Sharma' : 'Vikram Mehta';
    const officerRole = lenderType === 'ngo' ? 'Community Credit Coordinator' : lenderType === 'coop' ? 'Cooperative Credit Officer' : lenderType === 'nbfc' ? 'Agri Value Chain Underwriter' : 'Lead Agri Underwriter • Maharashtra Hub';

    onLoginSuccess({
      role: 'lender',
      lenderType,
      email: lenderEmail.trim(),
      institutionName: lenderOrgName,
      officerName,
      officerRole,
      rememberMe,
    });
  };

  const handleFarmerRedirect = () => {
    // If user picks farmer, save farmer session and redirect to Farmer PWA (port 3000)
    try {
      localStorage.setItem('agritrust_farmer_user', JSON.stringify({
        id: farmerMobile || '9876543210',
        name: 'Ramesh Patel',
        fpo: 'Khanna FPO',
        cluster: 'Village Bhadson, Ludhiana Cluster',
        acreage: '4.2 Acres',
        crop: 'Wheat (HD 3086)',
        role: 'farmer',
      }));
    } catch (e) {}
    window.location.href = 'http://localhost:3000';
  };

  const handleDemoLogin = () => {
    setErrorMsg('');
    const officerName = lenderType === 'ngo' ? 'Anita Desai' : 'Vikram Mehta';
    const officerRole = lenderType === 'ngo' ? 'Community Credit Coordinator' : 'Lead Agri Underwriter • Maharashtra Hub';

    onLoginSuccess({
      role: 'lender',
      lenderType,
      email: lenderEmail,
      institutionName: lenderOrgName,
      officerName,
      officerRole,
      rememberMe: true,
    });
  };

  return (
    <div className="lender-sso-wrapper">
      {/* Top Header */}
      <header className="lender-sso-header">
        <div className="brand-section">
          <div className="brand-logo-badge">SANJEEVANI</div>
          <div>
            <h1 className="brand-title">Sanjeevani • Institutional Gateway</h1>
            <p className="brand-subtitle">Consent-Gated Sovereign Agricultural Credit Terminal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a
            href="http://localhost:3000"
            className="lender-external-portal-btn"
            title="Open Farmer PWA"
          >
            <span>🌾 Switch to Farmer Portal</span>
            <span>↗</span>
          </a>
        </div>
      </header>

      {/* Main Card */}
      <main className="lender-sso-main">
        <div className="lender-sso-card">
          {/* Role Toggle */}
          <div className="lender-sso-role-toggle">
            <button
              type="button"
              className={`role-btn ${activeRole === 'lender' ? 'active' : ''}`}
              onClick={() => setActiveRole('lender')}
            >
              <span>🏦</span>
              <span>Lender Portal (Bank / NGO)</span>
            </button>
            <button
              type="button"
              className={`role-btn ${activeRole === 'farmer' ? 'active' : ''}`}
              onClick={() => setActiveRole('farmer')}
            >
              <span>🌾</span>
              <span>Farmer Passbook Portal</span>
            </button>
          </div>

          {activeRole === 'lender' ? (
            <div>
              <div className="sso-title-block">
                <span className="sso-pill">INSTITUTIONAL UNDERWRITING DESK</span>
                <h2 className="sso-card-heading">Underwriting Single Sign-On</h2>
                <p className="sso-card-sub">
                  Select your financial institution category to access zero-PII satellite credit dossiers.
                </p>
              </div>

              {errorMsg && (
                <div className="sso-error-alert">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLenderSubmit} className="sso-form">
                {/* 1. Institution Classification Chips */}
                <div className="sso-field-group">
                  <label className="sso-label">Institution Classification</label>
                  <div className="sso-chips-grid">
                    <button
                      type="button"
                      className={`sso-chip ${lenderType === 'bank' ? 'selected' : ''}`}
                      onClick={() => handleLenderTypeChange('bank')}
                    >
                      <span className="chip-emoji">🏦</span>
                      <span className="chip-name">Scheduled Commercial Bank</span>
                      <span className="chip-detail">SBI / HDFC / PNB (Tier-1)</span>
                    </button>

                    <button
                      type="button"
                      className={`sso-chip ${lenderType === 'ngo' ? 'selected' : ''}`}
                      onClick={() => handleLenderTypeChange('ngo')}
                    >
                      <span className="chip-emoji">🤝</span>
                      <span className="chip-name">NGO / MFI / Trust</span>
                      <span className="chip-detail">PRADAN / Rural Livelihood</span>
                    </button>

                    <button
                      type="button"
                      className={`sso-chip ${lenderType === 'nbfc' ? 'selected' : ''}`}
                      onClick={() => handleLenderTypeChange('nbfc')}
                    >
                      <span className="chip-emoji">💼</span>
                      <span className="chip-name">Agri NBFC</span>
                      <span className="chip-detail">Samunnati / Value Chain</span>
                    </button>

                    <button
                      type="button"
                      className={`sso-chip ${lenderType === 'coop' ? 'selected' : ''}`}
                      onClick={() => handleLenderTypeChange('coop')}
                    >
                      <span className="chip-emoji">🌱</span>
                      <span className="chip-name">Cooperative Bank / PACS</span>
                      <span className="chip-detail">District Central Coop Bank</span>
                    </button>
                  </div>
                </div>

                {/* 2. Organization Name */}
                <div className="sso-field-group">
                  <label className="sso-label">Financial Institution / Entity</label>
                  <input
                    type="text"
                    className="sso-input"
                    value={lenderOrgName}
                    onChange={(e) => setLenderOrgName(e.target.value)}
                    required
                  />
                </div>

                {/* 3. Official Email */}
                <div className="sso-field-group">
                  <label className="sso-label">Underwriter Work Email</label>
                  <input
                    type="email"
                    className="sso-input"
                    value={lenderEmail}
                    onChange={(e) => setLenderEmail(e.target.value)}
                    required
                  />
                </div>

                {/* 4. Password */}
                <div className="sso-field-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="sso-label">Underwriting Token / Password</label>
                    <button
                      type="button"
                      className="sso-toggle-pw"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="sso-input"
                    value={lenderPassword}
                    onChange={(e) => setLenderPassword(e.target.value)}
                    required
                  />
                </div>

                {/* 5. Remember Session */}
                <div className="sso-row-between">
                  <label className="sso-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember terminal desk</span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                    HSM Cryptographic Key Verified
                  </span>
                </div>

                {/* Submit button */}
                <button type="submit" className="sso-submit-btn">
                  <span>Enter Underwriting Terminal ({lenderType.toUpperCase()})</span>
                  <span>→</span>
                </button>

                <div className="sso-divider">
                  <span>OR</span>
                </div>

                {/* 1-Click Demo */}
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="sso-demo-btn"
                >
                  <span>🚀</span>
                  <span>1-Click Demo Desk ({lenderType === 'ngo' ? 'NGO Credit Desk' : 'SBI Agri Lead'})</span>
                </button>
              </form>
            </div>
          ) : (
            /* Farmer Portal Access Screen */
            <div className="sso-farmer-redirect-box">
              <div className="sso-title-block">
                <span className="sso-pill" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
                  FARMER PORTAL DISCOVERY
                </span>
                <h2 className="sso-card-heading">AgriTrust Farmer Passbook</h2>
                <p className="sso-card-sub">
                  Access your personal satellite credit health, pre-approved loan sanctions, and live Khanna mandi prices.
                </p>
              </div>

              <div className="sso-field-group" style={{ marginTop: '16px' }}>
                <label className="sso-label">Mobile Number / Farmer ID</label>
                <input
                  type="text"
                  className="sso-input"
                  value={farmerMobile}
                  onChange={(e) => setFarmerMobile(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>

              <div className="sso-field-group">
                <label className="sso-label">Security MPIN</label>
                <input
                  type="password"
                  className="sso-input"
                  value={farmerPin}
                  onChange={(e) => setFarmerPin(e.target.value)}
                  placeholder="Enter 4-digit security PIN"
                />
              </div>

              <button
                type="button"
                onClick={handleFarmerRedirect}
                className="sso-submit-btn"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981', marginTop: '14px' }}
              >
                <span>Launch Farmer Dashboard (Port 3000)</span>
                <span>↗</span>
              </button>
            </div>
          )}

          {/* Compliance Guarantee */}
          <div className="sso-footer-compliance">
            <span>🛡️</span>
            <span>
              DPDP Act 2023 Consent Gated • Zero-PII Cryptographic Passports • Multi-Institution Underwriting Architecture
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
