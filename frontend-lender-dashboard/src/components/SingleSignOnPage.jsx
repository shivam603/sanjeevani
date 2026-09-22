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
      {/* Level 1: Atmospheric Ambient Light Blooms */}
      <div className="sso-ambient-bloom sso-bloom-sage" />
      <div className="sso-ambient-bloom sso-bloom-sunlight" />
      <div className="sso-ambient-bloom sso-bloom-sky" />

      {/* Level 2: Floating Translucent Navigation Bar */}
      <header className="lender-sso-header">
        <div className="brand-section">
          <div className="brand-logo-badge">
            <span className="brand-logo-dot" />
            SANJEEVANI
          </div>
          <div className="brand-text-block">
            <h1 className="brand-title">Sanjeevani • Institutional Gateway</h1>
            <p className="brand-subtitle">Consent-Gated Sovereign Agricultural Credit Terminal</p>
          </div>
        </div>

        <div className="header-actions">
          <a
            href="http://localhost:3000"
            className="lender-external-portal-btn"
            title="Switch to Farmer Portal"
          >
            <span>Switch to Farmer Portal</span>
            <span className="external-arrow">↗</span>
          </a>
        </div>
      </header>

      {/* Main Spatial Composition */}
      <main className="lender-sso-main">
        <div className="sso-center-composition">
          {/* Role Segmented Capsule */}
          <div className="lender-sso-role-toggle">
            <button
              type="button"
              className={`role-btn ${activeRole === 'lender' ? 'active' : ''}`}
              onClick={() => setActiveRole('lender')}
            >
              <span>🏦 Institutional Underwriting Desk</span>
            </button>
            <button
              type="button"
              className={`role-btn ${activeRole === 'farmer' ? 'active' : ''}`}
              onClick={() => setActiveRole('farmer')}
            >
              <span>🌾 Farmer Passbook Portal</span>
            </button>
          </div>

          {/* Large Clean Hero Heading (Floating on the Atmospheric Canvas) */}
          <div className="sso-hero-header">
            <div className="sso-eyebrow-badge">
              <span className="eyebrow-pulse" />
              INSTITUTIONAL UNDERWRITING DESK
            </div>
            <h2 className="sso-primary-heading">Underwriting Single Sign-On</h2>
            <p className="sso-hero-description">
              Select your financial institution category to access secure agricultural credit dossiers.
            </p>
          </div>

          {errorMsg && (
            <div className="sso-error-alert">
              <span className="alert-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Level 3: Floating Translucent Glass Form Surface */}
          {activeRole === 'lender' ? (
            <form onSubmit={handleLenderSubmit} className="sso-form-surface">
              {/* 1. Institution Classification Glass Selection Group */}
              <div className="sso-field-group">
                <label className="sso-label">Institution Classification</label>
                <div className="sso-institution-list">
                  <button
                    type="button"
                    className={`sso-inst-item ${lenderType === 'bank' ? 'selected' : ''}`}
                    onClick={() => handleLenderTypeChange('bank')}
                  >
                    <span className="inst-item-emoji">🏦</span>
                    <div className="inst-item-text">
                      <span className="inst-item-title">Scheduled Commercial Bank</span>
                      <span className="inst-item-sub">Apex PSU / Private Bank (SBI, HDFC, PNB)</span>
                    </div>
                    <span className="inst-item-radio">
                      <span className="radio-dot" />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`sso-inst-item ${lenderType === 'ngo' ? 'selected' : ''}`}
                    onClick={() => handleLenderTypeChange('ngo')}
                  >
                    <span className="inst-item-emoji">🤝</span>
                    <div className="inst-item-text">
                      <span className="inst-item-title">NGO / MFI / Trust</span>
                      <span className="inst-item-sub">Microfinance & Rural Livelihood Trusts (PRADAN)</span>
                    </div>
                    <span className="inst-item-radio">
                      <span className="radio-dot" />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`sso-inst-item ${lenderType === 'nbfc' ? 'selected' : ''}`}
                    onClick={() => handleLenderTypeChange('nbfc')}
                  >
                    <span className="inst-item-emoji">💼</span>
                    <div className="inst-item-text">
                      <span className="inst-item-title">Agri NBFC / Value Chain</span>
                      <span className="inst-item-sub">Agricultural Value Chain Financing (Samunnati)</span>
                    </div>
                    <span className="inst-item-radio">
                      <span className="radio-dot" />
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`sso-inst-item ${lenderType === 'coop' ? 'selected' : ''}`}
                    onClick={() => handleLenderTypeChange('coop')}
                  >
                    <span className="inst-item-emoji">🌱</span>
                    <div className="inst-item-text">
                      <span className="inst-item-title">Cooperative Society / PACS</span>
                      <span className="inst-item-sub">District Central Cooperative Bank & Primary Agri Credit</span>
                    </div>
                    <span className="inst-item-radio">
                      <span className="radio-dot" />
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Financial Institution Floating Input */}
              <div className="sso-field-group">
                <label className="sso-label">Financial Institution</label>
                <div className="sso-input-surface">
                  <span className="sso-input-leading-icon">🏛️</span>
                  <input
                    type="text"
                    className="sso-floating-input"
                    value={lenderOrgName}
                    onChange={(e) => setLenderOrgName(e.target.value)}
                    placeholder="e.g. State Bank of India — Agri Division"
                    required
                  />
                </div>
              </div>

              {/* 3. Underwriter Work Email */}
              <div className="sso-field-group">
                <label className="sso-label">Underwriter Work Email</label>
                <div className="sso-input-surface">
                  <span className="sso-input-leading-icon">✉️</span>
                  <input
                    type="email"
                    className="sso-floating-input"
                    value={lenderEmail}
                    onChange={(e) => setLenderEmail(e.target.value)}
                    placeholder="officer.name@institution.gov.in"
                    required
                  />
                </div>
              </div>

              {/* 4. Underwriting Token / Password */}
              <div className="sso-field-group">
                <div className="sso-label-row">
                  <label className="sso-label">Underwriting Token / Password</label>
                  <button
                    type="button"
                    className="sso-pw-glass-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="sso-input-surface">
                  <span className="sso-input-leading-icon">🔑</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="sso-floating-input"
                    value={lenderPassword}
                    onChange={(e) => setLenderPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              {/* 5. Custom Rounded Glass Checkbox & Trust Badge */}
              <div className="sso-action-meta-row">
                <label className="sso-custom-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sso-native-checkbox"
                  />
                  <span className={`sso-glass-check-box ${rememberMe ? 'is-active' : ''}`}>
                    {rememberMe && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.2L4.8 9L10 3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="sso-check-text">Remember terminal desk</span>
                </label>

                <div className="sso-trust-badge">
                  <span className="sso-trust-dot" />
                  <span>HSM Cryptographic Key Verified</span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button type="submit" className="sso-primary-btn">
                <span>Enter Underwriting Terminal</span>
                <span className="sso-btn-arrow">→</span>
              </button>

              <div className="sso-or-separator">
                <span>OR</span>
              </div>

              {/* 1-Click Quick Demo Access */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="sso-demo-glass-btn"
              >
                <span>⚡ Instant Demo Access ({lenderType === 'ngo' ? 'NGO Credit Desk' : 'SBI Agri Lead'})</span>
              </button>
            </form>
          ) : (
            /* Farmer Portal Access Screen */
            <div className="sso-form-surface sso-farmer-panel">
              <div className="sso-field-group">
                <label className="sso-label">Mobile Number / Farmer ID</label>
                <div className="sso-input-surface">
                  <span className="sso-input-leading-icon">📱</span>
                  <input
                    type="text"
                    className="sso-floating-input"
                    value={farmerMobile}
                    onChange={(e) => setFarmerMobile(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
              </div>

              <div className="sso-field-group">
                <label className="sso-label">Security MPIN</label>
                <div className="sso-input-surface">
                  <span className="sso-input-leading-icon">🔒</span>
                  <input
                    type="password"
                    className="sso-floating-input"
                    value={farmerPin}
                    onChange={(e) => setFarmerPin(e.target.value)}
                    placeholder="Enter 4-digit security PIN"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleFarmerRedirect}
                className="sso-primary-btn sso-farmer-cta"
              >
                <span>Launch Farmer Dashboard (Port 3000)</span>
                <span className="sso-btn-arrow">↗</span>
              </button>
            </div>
          )}

          {/* Level 4: Supporting Glass Elements & Security Badges */}
          <div className="sso-supporting-status-pill">
            <span className="sec-status-dot" />
            <span className="sec-status-item">● Secure institutional connection</span>
            <span className="sec-bullet">•</span>
            <span className="sec-status-item">✓ HSM verified</span>
            <span className="sec-bullet">•</span>
            <span className="sec-status-item">✓ Consent gateway active</span>
          </div>

          <div className="sso-compliance-footnote">
            <span>🛡️ DPDP Act 2023 Consent Gated • Zero-PII Cryptographic Passports • Multi-Institution Underwriting Architecture</span>
          </div>
        </div>
      </main>
    </div>
  );
}
