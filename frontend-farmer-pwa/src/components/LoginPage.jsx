import React, { useState } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../i18n/LanguageContext';

export default function LoginPage({ onLogin }) {
  const { t, currentLang, setCurrentLang } = useTranslation();

  const [mobileOrId, setMobileOrId] = useState('9876543210');
  const [pin, setPin] = useState('1234');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang)?.label || 'English';

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
      en: "Welcome to AgriTrust. Enter your ten-digit mobile number or Farmer ID and four-digit security MPIN to access your passbook. Or click the 1-Click Demo Login button.",
      hi: "एग्रीट्रस्ट किसान पासबुक में आपका स्वागत है। अपनी पासबुक देखने के लिए अपना दस अंकों का मोबाइल नंबर और चार अंकों का सुरक्षा एमपिन दर्ज करें, अथवा १-क्लिक डेमो लॉगिन बटन दबाएं।",
      mr: "ॲग्रीट्रस्ट शेतकरी पासबुकमध्ये आपले स्वागत आहे. आपले पासबुक उघडण्यासाठी आपला १० अंकी मोबाईल नंबर आणि ४ अंकी सुरक्षा एमपिन टाका, किंवा १-क्लिक डेमो बटण दाबा.",
      ta: "அக்ரிட்ரஸ்ட் உழவர் பாஸ்புக்கிற்கு நல்வரவு. உங்கள் பத்து இலக்க மொபைல் எண் மற்றும் நான்கு இலக்க பாதுகாப்பு MPIN-ஐ உள்ளிட்டு உள்நுழையவும், அல்லது 1-கிளிக் டெமோ பொத்தானை அழுத்தவும்.",
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobileOrId.trim() || !pin.trim()) {
      setErrorMsg(t('login_error_empty'));
      return;
    }

    // Accept demo or any reasonable credentials
    if (pin.length < 4) {
      setErrorMsg(t('login_error_invalid'));
      return;
    }

    setErrorMsg('');
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    onLogin({
      id: mobileOrId.trim(),
      name: mobileOrId.includes('001') || mobileOrId === '9876543210' ? 'Ramesh Patel' : 'Farmer Member',
      fpo: 'Khanna FPO',
      cluster: 'Village Bhadson, Ludhiana Cluster',
      acreage: '4.2 Acres',
      crop: 'Wheat (HD 3086)',
      rememberMe,
    });
  };

  const handleDemoLogin = () => {
    setMobileOrId('9876543210');
    setPin('1234');
    setErrorMsg('');
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    onLogin({
      id: '9876543210',
      name: 'Ramesh Patel',
      fpo: 'Khanna FPO',
      cluster: 'Village Bhadson, Ludhiana Cluster',
      acreage: '4.2 Acres',
      crop: 'Wheat (HD 3086)',
      rememberMe: true,
    });
  };

  return (
    <div className="login-screen-wrapper">
      {/* Top Bar on Login Screen */}
      <header className="login-top-bar">
        <div className="login-brand-group">
          <span className="nav-brand-dot"></span>
          <div>
            <div className="login-brand-title">{t('app_name')}</div>
            <div className="login-brand-sub">{t('brand_subtitle')}</div>
          </div>
        </div>

        <div className="login-top-tools">
          {/* Vernacular Voice Help */}
          <button
            type="button"
            className={`login-voice-btn ${isSpeaking ? 'active-speaking' : ''}`}
            onClick={handleSpeechHelp}
            title={t('login_listen_btn')}
          >
            <span>🔊</span>
            <span>{isSpeaking ? t('nav_stop_listen') : t('login_listen_btn')}</span>
          </button>

          {/* Language Picker Dropdown */}
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

      {/* Main Login Card Container */}
      <main className="login-main-container">
        <div className="login-card">
          {/* Top Badge */}
          <div className="login-header-section">
            <div className="login-badge-pill">
              <span>🌾</span>
              <span>{t('login_badge')}</span>
            </div>
            <h1 className="login-card-title">{t('login_title')}</h1>
            <p className="login-card-subtitle">{t('login_subtitle')}</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="login-error-box">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form-body">
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
                  value={mobileOrId}
                  onChange={(e) => setMobileOrId(e.target.value)}
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
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="login-input-wrapper">
                <span className="login-input-icon">🔒</span>
                <input
                  id="farmer-pin-input"
                  type={showPin ? 'text' : 'password'}
                  className="login-text-input"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder={t('login_placeholder_pin')}
                  maxLength={12}
                  required
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="login-remember-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('login_remember_me')}</span>
              </label>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Default MPIN: 1234</span>
            </div>

            {/* Primary Submit Button */}
            <button type="submit" className="login-submit-btn">
              <span>{t('login_btn_submit')}</span>
              <span>→</span>
            </button>

            {/* Divider */}
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

          {/* Security & Compliance Footer */}
          <div className="login-card-footer">
            <div className="login-shield-icon">🛡️</div>
            <div className="login-compliance-text">
              {t('login_trust_footer')}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
