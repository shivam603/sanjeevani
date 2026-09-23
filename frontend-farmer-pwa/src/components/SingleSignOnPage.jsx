import React, { useState } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function SingleSignOnPage({ onLoginSuccess }) {
  const { t, currentLang, setCurrentLang } = useTranslation();

  // Active user role tab: 'farmer' or 'lender'
  const [activeRole, setActiveRole] = useState('farmer');

  // Lender Institution Type: 'bank', 'ngo', 'nbfc', 'coop'
  const [lenderType, setLenderType] = useState('bank');

  // Form states - Farmer Login
  const [farmerMobile, setFarmerMobile] = useState('9876543210');
  const [farmerPin, setFarmerPin] = useState('1234');

  // Farmer Mode & Method States
  const [farmerAuthMode, setFarmerAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [farmerLoginMethod, setFarmerLoginMethod] = useState('mpin'); // 'mpin' | 'otp'

  // OTP Login States
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(30);

  // Farmer Sign Up States
  const [signupName, setSignupName] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupCluster, setSignupCluster] = useState('Village Bhadson, Ludhiana Cluster');
  const [signupAcreage, setSignupAcreage] = useState('3.5 Acres');
  const [signupCrop, setSignupCrop] = useState('Wheat (HD 3086)');
  const [signupPin, setSignupPin] = useState('');
  const [signupConfirmPin, setSignupConfirmPin] = useState('');
  const [showSignupPin, setShowSignupPin] = useState(false);
  const [signupConsent, setSignupConsent] = useState(true);

  // Form states - Lender
  const [lenderEmail, setLenderEmail] = useState('vikram.mehta@sbi.co.in');
  const [lenderOrgName, setLenderOrgName] = useState('State Bank of India — Agri Division');
  const [lenderPassword, setLenderPassword] = useState('underwrite2025');

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer = null;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpSent, otpCountdown]);

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

  // Farmer Form Submit (MPIN)
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

    let farmerName = 'Farmer Member';
    let cluster = 'Village Bhadson, Ludhiana Cluster';
    let acreage = '4.2 Acres';
    let crop = 'Wheat (HD 3086)';
    let fpo = 'Khanna FPO';

    // Check registered accounts in localStorage
    try {
      const stored = localStorage.getItem('agritrust_registered_farmers');
      if (stored) {
        const list = JSON.parse(stored);
        const found = list.find((u) => u.mobile === farmerMobile.trim() || u.id === farmerMobile.trim());
        if (found) {
          if (found.pin && found.pin !== farmerPin.trim()) {
            setErrorMsg('Invalid MPIN for registered account. Please check your MPIN.');
            return;
          }
          farmerName = found.name || farmerName;
          cluster = found.cluster || cluster;
          acreage = found.acreage || acreage;
          crop = found.crop || crop;
          fpo = found.fpo || fpo;
        }
      }
    } catch (err) {
      console.error(err);
    }

    if (farmerMobile.includes('001') || farmerMobile === '9876543210') {
      farmerName = 'Ramesh Patel';
    }

    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const userData = {
      role: 'farmer',
      id: farmerMobile.trim(),
      name: farmerName,
      fpo,
      cluster,
      acreage,
      crop,
      rememberMe,
    };

    onLoginSuccess(userData);
  };

  // Farmer OTP Send Handler
  const handleSendOtp = () => {
    const cleanMobile = farmerMobile.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number to receive OTP.');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    setOtpCountdown(30);
  };

  // Farmer OTP Verify Handler
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const cleanMobile = farmerMobile.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!otpValue.trim() || otpValue.trim().length < 4) {
      setErrorMsg(t('login_error_invalid_otp') || 'Please enter the 4-digit verification OTP.');
      return;
    }

    let farmerName = 'Farmer Member';
    let cluster = 'Village Bhadson, Ludhiana Cluster';
    let acreage = '4.2 Acres';
    let crop = 'Wheat (HD 3086)';
    let fpo = 'Khanna FPO';

    if (cleanMobile.includes('001') || cleanMobile === '9876543210') {
      farmerName = 'Ramesh Patel';
    } else {
      try {
        const stored = localStorage.getItem('agritrust_registered_farmers');
        if (stored) {
          const list = JSON.parse(stored);
          const found = list.find((u) => u.mobile === cleanMobile || u.id === cleanMobile);
          if (found) {
            farmerName = found.name || farmerName;
            cluster = found.cluster || cluster;
            acreage = found.acreage || acreage;
            crop = found.crop || crop;
            fpo = found.fpo || fpo;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const userData = {
      role: 'farmer',
      id: cleanMobile,
      name: farmerName,
      fpo,
      cluster,
      acreage,
      crop,
      rememberMe,
    };

    onLoginSuccess(userData);
  };

  // Farmer Sign Up Handler
  const handleFarmerSignup = (e) => {
    e.preventDefault();
    if (!signupName.trim() || !signupMobile.trim() || !signupPin.trim()) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }
    if (signupMobile.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (signupPin.trim().length < 4) {
      setErrorMsg('Security MPIN must be at least 4 digits.');
      return;
    }
    if (signupPin.trim() !== signupConfirmPin.trim()) {
      setErrorMsg('MPIN and Confirm MPIN do not match.');
      return;
    }
    if (!signupConsent) {
      setErrorMsg('Please accept the DPDPA 2023 zero-PII data consent to register your account.');
      return;
    }

    const newFarmer = {
      id: signupMobile.trim(),
      mobile: signupMobile.trim(),
      name: signupName.trim(),
      cluster: signupCluster.trim() || 'Village Bhadson, Ludhiana Cluster',
      acreage: signupAcreage.trim() || '3.5 Acres',
      crop: signupCrop.trim() || 'Wheat (HD 3086)',
      pin: signupPin.trim(),
      fpo: 'Punjab Agri Producer Co.',
      registeredAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('agritrust_registered_farmers');
      const list = stored ? JSON.parse(stored) : [];
      const filtered = list.filter((u) => u.mobile !== newFarmer.mobile);
      filtered.push(newFarmer);
      localStorage.setItem('agritrust_registered_farmers', JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to save farmer account:', err);
    }

    setErrorMsg('');
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const userData = {
      role: 'farmer',
      id: newFarmer.id,
      name: newFarmer.name,
      fpo: newFarmer.fpo,
      cluster: newFarmer.cluster,
      acreage: newFarmer.acreage,
      crop: newFarmer.crop,
      rememberMe: true,
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
          {/* ========================================================= */}
          {/* ROLE 1: FARMER PORTAL (SIGN IN & CREATE ACCOUNT)         */}
          {/* ========================================================= */}
          {activeRole === 'farmer' ? (
            <div className="farmer-auth-container">
              {/* Top Sub-Navigation: Sign In vs Create Account */}
              <div className="farmer-auth-mode-switch">
                <button
                  type="button"
                  className={`farmer-mode-pill ${farmerAuthMode === 'signin' ? 'active' : ''}`}
                  onClick={() => {
                    setFarmerAuthMode('signin');
                    setErrorMsg('');
                  }}
                >
                  <span>🔑</span>
                  <span>{t('login_tab_signin')}</span>
                </button>
                <button
                  type="button"
                  className={`farmer-mode-pill ${farmerAuthMode === 'signup' ? 'active' : ''}`}
                  onClick={() => {
                    setFarmerAuthMode('signup');
                    setErrorMsg('');
                  }}
                >
                  <span>✨</span>
                  <span>{t('login_tab_signup')}</span>
                </button>
              </div>

              {farmerAuthMode === 'signin' ? (
                <>
                  {/* Sub-Mode Toggle: MPIN vs OTP */}
                  <div className="farmer-method-toggle-row">
                    <button
                      type="button"
                      className={`farmer-method-chip ${farmerLoginMethod === 'mpin' ? 'active' : ''}`}
                      onClick={() => {
                        setFarmerLoginMethod('mpin');
                        setErrorMsg('');
                      }}
                    >
                      <span>🔒</span>
                      <span>{t('login_submode_mpin')}</span>
                    </button>
                    <button
                      type="button"
                      className={`farmer-method-chip ${farmerLoginMethod === 'otp' ? 'active' : ''}`}
                      onClick={() => {
                        setFarmerLoginMethod('otp');
                        setErrorMsg('');
                      }}
                    >
                      <span>📲</span>
                      <span>{t('login_submode_otp')}</span>
                    </button>
                  </div>

                  {farmerLoginMethod === 'mpin' ? (
                    /* MPIN LOGIN FORM */
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
                    /* OTP LOGIN FORM */
                    <form onSubmit={handleVerifyOtp} className="login-form-body">
                      {/* Mobile Field */}
                      <div className="login-input-group">
                        <label className="login-input-label" htmlFor="farmer-otp-mobile">
                          {t('login_label_id')}
                        </label>
                        <div className="login-input-wrapper">
                          <span className="login-input-icon">📱</span>
                          <input
                            id="farmer-otp-mobile"
                            type="tel"
                            className="login-text-input"
                            value={farmerMobile}
                            onChange={(e) => setFarmerMobile(e.target.value)}
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                            required
                          />
                        </div>
                      </div>

                      {!otpSent ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="login-submit-btn"
                          style={{ marginTop: '4px' }}
                        >
                          <span>📨</span>
                          <span>{t('login_btn_send_otp')}</span>
                          <span>→</span>
                        </button>
                      ) : (
                        <>
                          <div className="otp-sent-banner">
                            <div className="otp-sent-text-group">
                              <span className="otp-sent-icon">✅</span>
                              <div>
                                <div className="otp-sent-title">OTP Sent to +91 {farmerMobile}</div>
                                <div className="otp-sent-sub">
                                  Demo verification code: <strong className="otp-code-highlight">4829</strong>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="otp-autofill-btn"
                              onClick={() => setOtpValue('4829')}
                            >
                              Auto-fill 4829
                            </button>
                          </div>

                          {/* OTP Input Field */}
                          <div className="login-input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label className="login-input-label" htmlFor="farmer-otp-input">
                                {t('login_label_otp')}
                              </label>
                              <div style={{ fontSize: '12px', color: otpCountdown > 0 ? '#64748B' : '#0284C7', fontWeight: 600 }}>
                                {otpCountdown > 0 ? (
                                  <span>Resend in {otpCountdown}s</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                  >
                                    Resend OTP 🔄
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="login-input-wrapper">
                              <span className="login-input-icon">🔢</span>
                              <input
                                id="farmer-otp-input"
                                type="text"
                                className="login-text-input otp-digit-input"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                placeholder="• • • •"
                                maxLength={4}
                                autoFocus
                                required
                              />
                            </div>
                          </div>

                          <button type="submit" className="login-submit-btn">
                            <span>{t('login_btn_verify_otp')}</span>
                            <span>→</span>
                          </button>
                        </>
                      )}

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
                  )}
                </>
              ) : (
                /* FARMER SIGN UP / REGISTRATION FORM */
                <form onSubmit={handleFarmerSignup} className="login-form-body">
                  {/* Full Name */}
                  <div className="login-input-group">
                    <label className="login-input-label" htmlFor="signup-name">
                      {t('signup_name_label')} *
                    </label>
                    <div className="login-input-wrapper">
                      <span className="login-input-icon">👤</span>
                      <input
                        id="signup-name"
                        type="text"
                        className="login-text-input"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Gurpreet Singh"
                        required
                      />
                    </div>
                  </div>

                  {/* 10-Digit Mobile */}
                  <div className="login-input-group">
                    <label className="login-input-label" htmlFor="signup-mobile">
                      {t('signup_mobile_label')} *
                    </label>
                    <div className="login-input-wrapper">
                      <span className="login-input-icon">📱</span>
                      <input
                        id="signup-mobile"
                        type="tel"
                        className="login-text-input"
                        value={signupMobile}
                        onChange={(e) => setSignupMobile(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  {/* Split Row: Acreage & Crop */}
                  <div className="signup-grid-split">
                    <div className="login-input-group">
                      <label className="login-input-label" htmlFor="signup-acreage">
                        {t('signup_acreage_label')}
                      </label>
                      <div className="login-input-wrapper">
                        <span className="login-input-icon">🚜</span>
                        <input
                          id="signup-acreage"
                          type="text"
                          className="login-text-input"
                          value={signupAcreage}
                          onChange={(e) => setSignupAcreage(e.target.value)}
                          placeholder="e.g. 4.5 Acres"
                        />
                      </div>
                    </div>

                    <div className="login-input-group">
                      <label className="login-input-label" htmlFor="signup-crop">
                        {t('signup_crop_label')}
                      </label>
                      <div className="login-input-wrapper">
                        <span className="login-input-icon">🌾</span>
                        <input
                          id="signup-crop"
                          type="text"
                          className="login-text-input"
                          value={signupCrop}
                          onChange={(e) => setSignupCrop(e.target.value)}
                          placeholder="e.g. Wheat, Paddy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Village / Cluster */}
                  <div className="login-input-group">
                    <label className="login-input-label" htmlFor="signup-cluster">
                      {t('signup_cluster_label')}
                    </label>
                    <div className="login-input-wrapper">
                      <span className="login-input-icon">📍</span>
                      <input
                        id="signup-cluster"
                        type="text"
                        className="login-text-input"
                        value={signupCluster}
                        onChange={(e) => setSignupCluster(e.target.value)}
                        placeholder="Village / Tehsil / District Cluster"
                      />
                    </div>
                  </div>

                  {/* Split Row: Set MPIN & Confirm MPIN */}
                  <div className="signup-grid-split">
                    <div className="login-input-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="login-input-label" htmlFor="signup-pin">
                          {t('signup_pin_label')} *
                        </label>
                        <button
                          type="button"
                          className="login-toggle-pw-btn"
                          onClick={() => setShowSignupPin(!showSignupPin)}
                        >
                          {showSignupPin ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="login-input-wrapper">
                        <span className="login-input-icon">🔒</span>
                        <input
                          id="signup-pin"
                          type={showSignupPin ? 'text' : 'password'}
                          className="login-text-input"
                          value={signupPin}
                          onChange={(e) => setSignupPin(e.target.value)}
                          placeholder="4-digit MPIN"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>

                    <div className="login-input-group">
                      <label className="login-input-label" htmlFor="signup-confirm-pin">
                        {t('signup_confirm_pin_label')} *
                      </label>
                      <div className="login-input-wrapper">
                        <span className="login-input-icon">🛡️</span>
                        <input
                          id="signup-confirm-pin"
                          type={showSignupPin ? 'text' : 'password'}
                          className="login-text-input"
                          value={signupConfirmPin}
                          onChange={(e) => setSignupConfirmPin(e.target.value)}
                          placeholder="Repeat MPIN"
                          maxLength={6}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* DPDPA Consent Checkbox */}
                  <div className="login-remember-row" style={{ marginTop: '2px' }}>
                    <label className="login-checkbox-label" style={{ alignItems: 'flex-start', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={signupConsent}
                        onChange={(e) => setSignupConsent(e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <span className={`custom-glass-check ${signupConsent ? 'checked' : ''}`} style={{ marginTop: '2px' }}>
                        {signupConsent && (
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6.2L4.8 9L10 3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span style={{ fontSize: '11.5px', lineHeight: 1.4, color: '#475569' }}>
                        {t('signup_consent_text')}
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button type="submit" className="login-submit-btn" style={{ marginTop: '4px' }}>
                    <span>{t('signup_btn_submit')}</span>
                    <span>→</span>
                  </button>

                  {/* Switch back to sign in */}
                  <div className="auth-switch-link-row">
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      className="auth-switch-link-btn"
                      onClick={() => {
                        setFarmerAuthMode('signin');
                        setErrorMsg('');
                      }}
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}
            </div>
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
