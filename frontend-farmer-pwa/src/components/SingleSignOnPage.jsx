import React, { useState } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function SingleSignOnPage({ onLoginSuccess }) {
  const { t, currentLang, setCurrentLang } = useTranslation();

  // Active user role tab: 'farmer' or 'lender'
  const [activeRole, setActiveRole] = useState('farmer');

  // Lender Institution Type: 'bank', 'ngo', 'nbfc', 'coop'
  const [lenderType, setLenderType] = useState('bank');

  // Form states - Farmer
  const [farmerMobile, setFarmerMobile] = useState('9876543210');
  const [farmerPin, setFarmerPin] = useState('1234');

  // Form states - Lender
  const [lenderEmail, setLenderEmail] = useState('vikram.mehta@sbi.co.in');
  const [lenderOrgName, setLenderOrgName] = useState('State Bank of India — Agri Division');
  const [lenderPassword, setLenderPassword] = useState('underwrite2025');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.label || 'English';

  // Vernacular voice guidance
  const handleSpeechHelp = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const helpTexts = {
      en: activeRole === 'farmer'
        ? "Welcome to Sanjeevani AgriTrust. You are on the Farmer Passbook portal. Enter your 10-digit mobile number and 4-digit MPIN, or switch to Lender terminal above."
        : "Institutional Underwriting Gateway. Select your institution category such as Commercial Bank, NGO or MFI, then enter your institutional credentials.",
      hi: activeRole === 'farmer'
        ? "संजीवनी एग्रीट्रस्ट में आपका स्वागत है। आप किसान पासबुक पोर्टल पर हैं। अपना १० अंकों का मोबाइल नंबर और ४ अंकों का एमपिन दर्ज करें, अथवा ऊपर दिए गए ऋणदाता पोर्टल का चयन करें।"
        : "संस्थागत ऋणदाता टर्मिनल। अपने संस्थान का प्रकार जैसे वाणिज्यिक बैंक, एनजीओ या एमएफआई चुनें, और अपने लॉगिन विवरण दर्ज करें।",
      mr: activeRole === 'farmer'
        ? "संजीवनी ॲग्रीट्रस्टमध्ये आपले स्वागत आहे. आपण शेतकरी पासबुक पोर्टलवर आहात. आपला १० अंकी मोबाईल नंबर आणि ४ अंकी एमपिन टाका, किंवा वरील कर्जदार पोर्टल निवडा."
        : "संस्थात्मक कर्जदाता टर्मिनल. आपल्या संस्थेचा प्रकार निवडा, उदा. बँक किंवा एनजीओ, आणि आपले लॉगिन तपशील प्रविष्ट करा.",
      ta: activeRole === 'farmer'
        ? "சஞ்சீவனி அக்ரிட்ரஸ்ட்டிற்கு நல்வரவு. நீங்கள் உழவர் பாஸ்புக் போர்ட்டலில் உள்ளீர்கள். உங்கள் 10 இலக்க மொபைல் எண் மற்றும் 4 இலக்க MPIN உள்ளிடவும்."
        : "நிறுவன கடன் வழங்குநர் போர்டல். வங்கி அல்லது தன்னார்வ தொண்டு நிறுவனம் போன்ற உங்கள் அமைப்பின் வகையைத் தேர்ந்தெடுத்து உள்நுழையவும்.",
    };

    const text = helpTexts[currentLang] || helpTexts.en;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const vernacularVoice = voices.find(
      (v) => v.lang.includes(currentLang) || v.lang.includes('IN')
    );
    if (vernacularVoice) utterance.voice = vernacularVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Change Role Handler
  const handleRoleChange = (role) => {
    setActiveRole(role);
    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle Lender Type Change
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

  // Farmer Form Submit
  const handleFarmerSubmit = (e) => {
    e.preventDefault();
    if (!farmerMobile.trim() || !farmerPin.trim()) {
      setErrorMsg(t('login_error_empty'));
      return;
    }
    if (farmerPin.length < 4) {
      setErrorMsg(t('login_error_invalid'));
      return;
    }

    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const userData = {
      role: 'farmer',
      id: farmerMobile.trim(),
      name: farmerMobile.includes('001') || farmerMobile === '9876543210' ? 'Ramesh Patel' : 'Farmer Member',
      fpo: 'Khanna FPO',
      cluster: 'Village Bhadson, Ludhiana Cluster',
      acreage: '4.2 Acres',
      crop: 'Wheat (HD 3086)',
      rememberMe,
    };

    onLoginSuccess(userData);
  };

  // Lender Form Submit
  const handleLenderSubmit = (e) => {
    e.preventDefault();
    if (!lenderEmail.trim() || !lenderPassword.trim()) {
      setErrorMsg('Please enter your institutional email and password.');
      return;
    }

    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const lenderData = {
      role: 'lender',
      lenderType,
      email: lenderEmail.trim(),
      institutionName: lenderOrgName,
      officerName: lenderType === 'ngo' ? 'Anita Desai' : lenderType === 'coop' ? 'Manjit Singh' : 'Vikram Mehta',
      officerRole: lenderType === 'ngo' ? 'Community Credit Coordinator' : lenderType === 'coop' ? 'Cooperative Credit Officer' : 'Lead Agri Underwriter • Maharashtra Hub',
      rememberMe,
    };

    onLoginSuccess(lenderData);
  };

  // 1-Click Demo Login
  const handleDemoLogin = () => {
    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    if (activeRole === 'farmer') {
      setFarmerMobile('9876543210');
      setFarmerPin('1234');
      onLoginSuccess({
        role: 'farmer',
        id: '9876543210',
        name: 'Ramesh Patel',
        fpo: 'Khanna FPO',
        cluster: 'Village Bhadson, Ludhiana Cluster',
        acreage: '4.2 Acres',
        crop: 'Wheat (HD 3086)',
        rememberMe: true,
      });
    } else {
      onLoginSuccess({
        role: 'lender',
        lenderType: lenderType || 'bank',
        email: lenderEmail,
        institutionName: lenderOrgName,
        officerName: lenderType === 'ngo' ? 'Anita Desai' : 'Vikram Mehta',
        officerRole: lenderType === 'ngo' ? 'Community Credit Coordinator' : 'Lead Agri Underwriter • Maharashtra Hub',
        rememberMe: true,
      });
    }
  };

  return (
    <div className="login-screen-wrapper">
      {/* Top Header Bar */}
      <header className="login-top-bar">
        <div className="login-brand-group">
          <span className="nav-brand-dot"></span>
          <div>
            <div className="login-brand-title">SANJEEVANI • AGRITRUST</div>
            <div className="login-brand-sub">Unified Sovereign Agricultural Credit & Underwriting Gateway</div>
          </div>
        </div>

        <div className="login-top-tools">
          {/* Audio Vernacular Assistant */}
          <button
            type="button"
            className={`login-voice-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={handleSpeechHelp}
            title={t('login_listen_btn')}
          >
            <span>🔊</span>
            <span>{isSpeaking ? t('nav_stop_listen') : t('login_listen_btn')}</span>
          </button>

          {/* Multilingual Selector */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="login-lang-btn"
              onClick={() => setShowLangMenu(!showLangMenu)}
              aria-label="Select Language"
            >
              <span>🌐</span>
              <span>{currentLangLabel.split(' ')[0]}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {showLangMenu && (
              <div className="login-lang-dropdown">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`login-lang-option ${currentLang === lang.code ? 'selected' : ''}`}
                  >
                    <span>{lang.label}</span>
                    {currentLang === lang.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="login-main-container">
        <div className="login-card sso-card-enhanced">
          {/* Master Role Selector (Farmer vs Lender) */}
          <div className="sso-role-tabs-container">
            <button
              type="button"
              className={`sso-role-tab ${activeRole === 'farmer' ? 'active-farmer' : ''}`}
              onClick={() => handleRoleChange('farmer')}
            >
              <span className="sso-role-icon">🌾</span>
              <div className="sso-role-text-box">
                <span className="sso-role-name">Farmer Portal</span>
                <span className="sso-role-desc">Passbook, Credit Health & Mandi</span>
              </div>
            </button>

            <button
              type="button"
              className={`sso-role-tab ${activeRole === 'lender' ? 'active-lender' : ''}`}
              onClick={() => handleRoleChange('lender')}
            >
              <span className="sso-role-icon">🏦</span>
              <div className="sso-role-text-box">
                <span className="sso-role-name">Lender Portal</span>
                <span className="sso-role-desc">Bank, NGO / MFI Underwriting</span>
              </div>
            </button>
          </div>

          {/* Header Title Section */}
          <div className="login-header-section">
            <div className={`login-badge-pill ${activeRole === 'lender' ? 'lender-badge-pill' : ''}`}>
              <span>{activeRole === 'farmer' ? '🌾' : '🏛️'}</span>
              <span>
                {activeRole === 'farmer'
                  ? t('login_badge')
                  : 'Institutional Credit & Risk Underwriting Terminal'}
              </span>
            </div>
            <h1 className="login-card-title">
              {activeRole === 'farmer'
                ? t('login_title')
                : 'Sanjeevani Institutional Desk'}
            </h1>
            <p className="login-card-subtitle">
              {activeRole === 'farmer'
                ? t('login_subtitle')
                : 'Consent-governed zero-PII underwriting terminal for banks, NGOs, and cooperatives.'}
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="login-error-box">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* ROLE 1: FARMER LOGIN FORM                                 */}
          {/* ========================================================= */}
          {activeRole === 'farmer' ? (
            <form onSubmit={handleFarmerSubmit} className="login-form-body">
              {/* Mobile / ID Field */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="farmer-id-input">
                  {t('login_label_id')}
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">📱</span>
                  <input
                    id="farmer-id-input"
                    type="text"
                    className="login-text-input"
                    value={farmerMobile}
                    onChange={(e) => setFarmerMobile(e.target.value)}
                    placeholder={t('login_placeholder_id')}
                    required
                  />
                </div>
              </div>

              {/* MPIN / Password Field */}
              <div className="login-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="login-input-label" htmlFor="farmer-pin-input">
                    {t('login_label_pin')}
                  </label>
                  <button
                    type="button"
                    className="login-toggle-pw-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">🔒</span>
                  <input
                    id="farmer-pin-input"
                    type={showPassword ? 'text' : 'password'}
                    className="login-text-input"
                    value={farmerPin}
                    onChange={(e) => setFarmerPin(e.target.value)}
                    placeholder={t('login_placeholder_pin')}
                    maxLength={12}
                    required
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="login-remember-row">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span className={`custom-glass-check ${rememberMe ? 'checked' : ''}`}>
                    {rememberMe && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.2L4.8 9L10 3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span>{t('login_remember_me')}</span>
                </label>
                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                  Demo MPIN: 1234
                </span>
              </div>

              {/* Submit Button */}
              <button type="submit" className="login-submit-btn">
                <span>{t('login_btn_submit')}</span>
                <span>→</span>
              </button>

              <div className="login-divider-row">
                <span>OR</span>
              </div>

              {/* 1-Click Demo Login */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="login-demo-btn"
              >
                <span>🚀</span>
                <span>{t('login_btn_demo')}</span>
              </button>
            </form>
          ) : (
            /* ========================================================= */
            /* ROLE 2: LENDER / INSTITUTIONAL LOGIN FORM                 */
            /* ========================================================= */
            <form onSubmit={handleLenderSubmit} className="login-form-body">
              {/* Institution Type Selector (Bank vs NGO / MFI vs NBFC vs Coop) */}
              <div className="login-input-group">
                <label className="login-input-label">
                  Institution Classification
                </label>
                <div className="lender-type-selector-grid">
                  <button
                    type="button"
                    className={`lender-type-chip ${lenderType === 'bank' ? 'active' : ''}`}
                    onClick={() => handleLenderTypeChange('bank')}
                  >
                    <span className="chip-icon">🏦</span>
                    <span className="chip-label">Scheduled Bank</span>
                    <span className="chip-sub">SBI / HDFC / PNB</span>
                  </button>

                  <button
                    type="button"
                    className={`lender-type-chip ${lenderType === 'ngo' ? 'active' : ''}`}
                    onClick={() => handleLenderTypeChange('ngo')}
                  >
                    <span className="chip-icon">🤝</span>
                    <span className="chip-label">NGO / MFI / Trust</span>
                    <span className="chip-sub">PRADAN / Self-Help</span>
                  </button>

                  <button
                    type="button"
                    className={`lender-type-chip ${lenderType === 'nbfc' ? 'active' : ''}`}
                    onClick={() => handleLenderTypeChange('nbfc')}
                  >
                    <span className="chip-icon">💼</span>
                    <span className="chip-label">Agri NBFC</span>
                    <span className="chip-sub">Samunnati / Nabkisan</span>
                  </button>

                  <button
                    type="button"
                    className={`lender-type-chip ${lenderType === 'coop' ? 'active' : ''}`}
                    onClick={() => handleLenderTypeChange('coop')}
                  >
                    <span className="chip-icon">🌱</span>
                    <span className="chip-label">Cooperative Society</span>
                    <span className="chip-sub">PACS / DCCB</span>
                  </button>
                </div>
              </div>

              {/* Organization Name Field */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="lender-org-input">
                  Financial Institution Name
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">🏛️</span>
                  <input
                    id="lender-org-input"
                    type="text"
                    className="login-text-input"
                    value={lenderOrgName}
                    onChange={(e) => setLenderOrgName(e.target.value)}
                    placeholder="e.g. State Bank of India — Agri Hub"
                    required
                  />
                </div>
              </div>

              {/* Officer Email */}
              <div className="login-input-group">
                <label className="login-input-label" htmlFor="lender-email-input">
                  Underwriter Official Work Email
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">✉️</span>
                  <input
                    id="lender-email-input"
                    type="email"
                    className="login-text-input"
                    value={lenderEmail}
                    onChange={(e) => setLenderEmail(e.target.value)}
                    placeholder="officer@institution.org"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="login-input-label" htmlFor="lender-pw-input">
                    Underwriter Security Token / Password
                  </label>
                  <button
                    type="button"
                    className="login-toggle-pw-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <span className="login-input-icon">🔐</span>
                  <input
                    id="lender-pw-input"
                    type={showPassword ? 'text' : 'password'}
                    className="login-text-input"
                    value={lenderPassword}
                    onChange={(e) => setLenderPassword(e.target.value)}
                    placeholder="Enter institutional credentials"
                    required
                  />
                </div>
              </div>

              {/* Remember Desk */}
              <div className="login-remember-row">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span className={`custom-glass-check ${rememberMe ? 'checked' : ''}`}>
                    {rememberMe && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.2L4.8 9L10 3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span>Remember terminal desk</span>
                </label>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '3px 10px', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.25)', fontWeight: 600 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }}></span>
                  HSM Cryptographic Key Verified
                </span>
              </div>

              {/* Submit Lender Button */}
              <button type="submit" className="login-submit-btn lender-submit-btn">
                <span>Access Underwriting Desk ({lenderType.toUpperCase()})</span>
                <span>→</span>
              </button>

              <div className="login-divider-row">
                <span>OR</span>
              </div>

              {/* 1-Click Lender Demo */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="login-demo-btn lender-demo-btn"
              >
                <span>🚀</span>
                <span>1-Click Demo Underwriting Desk ({lenderType === 'ngo' ? 'NGO Livelihood' : 'SBI Bank'})</span>
              </button>
            </form>
          )}

          {/* Security and Compliance Footer */}
          <div className="login-card-footer">
            <div className="login-shield-icon">🛡️</div>
            <div className="login-compliance-text">
              {activeRole === 'farmer'
                ? t('login_trust_footer')
                : 'RBI NBFC-AA Master Directives • DPDP Act 2023 Consent Audit Trail • Multi-Tier Bank & NGO Underwriting Framework'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
