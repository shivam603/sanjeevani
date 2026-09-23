import React, { useState } from 'react';
import './styles/pwa.css';
import { useTranslation } from './i18n/LanguageContext';

import SingleSignOnPage from './components/SingleSignOnPage';
import TopNavbar from './components/TopNavbar';
import FarmerGreetingBar from './components/FarmerGreetingBar';
import CreditHealthCard from './components/CreditHealthCard';
import SafeLimitCard from './components/SafeLimitCard';
import RabiLoanHeroCard from './components/RabiLoanHeroCard';
import SovereignConsentVaultCard from './components/SovereignConsentVaultCard';
import KhannaMandiCard from './components/KhannaMandiCard';
import SowingAdvisoryCard from './components/SowingAdvisoryCard';
import DbtSubsidyTrackerCard from './components/DbtSubsidyTrackerCard';
import AgriTrustFooter from './components/AgriTrustFooter';

import RequestLoanModal from './components/RequestLoanModal';
import CallMitraModal from './components/CallMitraModal';
import MandiRatesModal from './components/MandiRatesModal';
import SatelliteFieldMapCard from './components/SatelliteFieldMapCard';
import CreditScoreSimulatorCard from './components/CreditScoreSimulatorCard';
import DownloadPassportModal from './components/DownloadPassportModal';

export default function App() {
  const { currentLang, getAdvisorySpeech } = useTranslation();

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agritrust_farmer_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeNavTab, setActiveNavTab] = useState('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Modals state
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isMitraModalOpen, setIsMitraModalOpen] = useState(false);
  const [isMandiModalOpen, setIsMandiModalOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);

  const handleLogin = (userData) => {
    if (userData.role === 'lender') {
      try {
        localStorage.setItem('agritrust_lender_user', JSON.stringify(userData));
      } catch (e) {}
      window.location.href = 'http://localhost:3002';
      return;
    }

    setUser(userData);
    if (userData.rememberMe) {
      localStorage.setItem('agritrust_farmer_user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agritrust_farmer_user');
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Multilingual Speech Synthesis
  const handleSpeak = (rate = 1.0) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = getAdvisorySpeech();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;

    // Locate matching regional voice (Hindi, Marathi, Tamil, Indian English)
    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = currentLang === 'hi' ? 'hi' : currentLang === 'mr' ? 'mr' : currentLang === 'ta' ? 'ta' : 'en';
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase().includes(targetLangCode) || v.lang.includes('IN')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSafeLimitSpeak = () => {
    handleSpeak(1.0);
  };

  const handleSelectTab = (tab) => {
    setActiveNavTab(tab);
    if (tab === 'loans') {
      document.getElementById('safe-limit-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'consent') {
      document.getElementById('consent-vault-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'mandi') {
      document.getElementById('mandi-weather-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'support') {
      setIsMitraModalOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 1. If not authenticated, show Single Sign-On and Login Page
  if (!user) {
    return <SingleSignOnPage onLoginSuccess={handleLogin} />;
  }

  // 2. If authenticated, show full home webpage with all components
  return (
    <div className="agritrust-app-wrapper">
      {/* 1. Top Navbar */}
      <TopNavbar
        activeTab={activeNavTab}
        onSelectTab={handleSelectTab}
        onTriggerSpeech={() => handleSpeak(1.0)}
        isSpeaking={isSpeaking}
        onLogout={handleLogout}
        user={user}
        onOpenPassport={() => setIsPassportModalOpen(true)}
      />

      <main className="agritrust-main-container">
        {/* 2. Farmer Identity Greeting & Audio Assistant Bar */}
        <FarmerGreetingBar
          onPlayAudio={(speed) => handleSpeak(speed)}
          isPlaying={isSpeaking}
          user={user}
        />

        {/* 3. Immersive Hero Section: Pre-Approved Rabi Sowing Loan Assistance */}
        <div id="hero-loan-section" className="hero-loan-wrapper">
          <RabiLoanHeroCard onRequestLoan={() => setIsLoanModalOpen(true)} />
        </div>

        {/* 4. Core Financial Health & Sovereign Privacy Modules */}
        <div className="main-dashboard-grid">
          {/* Card 1: Sovereign Rating & Credit Health (78 / 100) */}
          <div id="credit-health-section" className="dashboard-card-wrapper">
            <CreditHealthCard
              score={78}
              maxScore={100}
              onOpenSimulator={() => document.getElementById('score-simulator-section')?.scrollIntoView({ behavior: 'smooth' })}
              onOpenPassport={() => setIsPassportModalOpen(true)}
            />
          </div>

          {/* Card 2: Sovereign Consent Vault (Apple Privacy & Security Control) */}
          <div id="consent-vault-section" className="dashboard-card-wrapper">
            <SovereignConsentVaultCard />
          </div>

          {/* Card 3: Smart Stress-Free Cap (Safe Limit: ₹1,65,000) */}
          <div id="safe-limit-section" className="dashboard-full-width-card">
            <SafeLimitCard onSpeakLimit={handleSafeLimitSpeak} />
          </div>
        </div>

        {/* 4. Interactive Satellite Field Map & What-If Credit Score Simulator */}
        <div className="interactive-features-grid">
          {/* Option D: Interactive Satellite Field Map (NDVI Heatmap) */}
          <div id="satellite-map-section">
            <SatelliteFieldMapCard />
          </div>

          {/* Option C: What-If Credit Score & Limit Simulator */}
          <div id="score-simulator-section">
            <CreditScoreSimulatorCard
              onOpenPassport={() => setIsPassportModalOpen(true)}
            />
          </div>
        </div>

        {/* 5. Bottom 3-Card Row */}
        <div className="bottom-three-cards-grid" id="mandi-weather-section">
          {/* Card 1: Khanna Mandi Live Price */}
          <KhannaMandiCard onOpenMandiModal={() => setIsMandiModalOpen(true)} />

          {/* Card 2: Sowing Advisory & 5-Day Weather */}
          <SowingAdvisoryCard />

          {/* Card 3: DBT Subsidy Tracker & Field Mitra */}
          <DbtSubsidyTrackerCard onCallMitra={() => setIsMitraModalOpen(true)} />
        </div>
      </main>

      {/* 6. Footer */}
      <AgriTrustFooter />

      {/* Interactive Modals */}
      <RequestLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
      />

      <CallMitraModal
        isOpen={isMitraModalOpen}
        onClose={() => setIsMitraModalOpen(false)}
      />

      <MandiRatesModal
        isOpen={isMandiModalOpen}
        onClose={() => setIsMandiModalOpen(false)}
      />

      {/* Option B: Downloadable 1-Click Digital Credit Passport with QR Code */}
      <DownloadPassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        farmerData={user}
      />
    </div>
  );
}
