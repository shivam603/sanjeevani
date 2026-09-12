import React, { useState, useEffect } from 'react';
import './styles/pwa.css';

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

export default function App() {
  const [activeNavTab, setActiveNavTab] = useState('overview');
  const [currentLang, setCurrentLang] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Modals state
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isMitraModalOpen, setIsMitraModalOpen] = useState(false);
  const [isMandiModalOpen, setIsMandiModalOpen] = useState(false);

  // Speech synthesis voice narration
  const advisorySpeechText = 
    "नमस्ते रमेश पाटील. तुमची कृषी पत स्थिती १०० पैकी ७८ आहे, जी उत्कृष्ट मानली जाते. " +
    "तुमची सुरक्षित कर्ज मर्यादा १ लाख ६५ हजार रुपये आहे. रब्बी हंगामासाठी ४५ हजार रुपयांचे ४ टक्के व्याजदराचे कर्ज मंजूर आहे. " +
    "खन्ना मंडईमध्ये गव्हाचा भाव २ हजार २७५ रुपये प्रति क्विंटल स्थिर आहे.";

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

    const utterance = new SpeechSynthesisUtterance(advisorySpeechText);
    utterance.rate = rate;
    
    // Find Hindi/Marathi or fallback voice
    const voices = window.speechSynthesis.getVoices();
    const vernacularVoice = voices.find(
      (v) => v.lang.includes('hi') || v.lang.includes('mr') || v.lang.includes('IN')
    );
    if (vernacularVoice) {
      utterance.voice = vernacularVoice;
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

  return (
    <div className="agritrust-app-wrapper">
      {/* 1. Top Navbar */}
      <TopNavbar
        activeTab={activeNavTab}
        onSelectTab={handleSelectTab}
        currentLang={currentLang}
        onSelectLang={(lang) => setCurrentLang(lang)}
        onTriggerSpeech={() => handleSpeak(1.0)}
        isSpeaking={isSpeaking}
      />

      <main className="agritrust-main-container">
        {/* 2. Farmer Identity Greeting & Audio Assistant Bar */}
        <FarmerGreetingBar
          onPlayAudio={(speed) => handleSpeak(speed)}
          isPlaying={isSpeaking}
        />

        {/* 3. Main Dashboard 2-Column Grid */}
        <div className="main-dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-col">
            {/* Card 1: Sovereign Rating & Credit Health (78 / 100) */}
            <CreditHealthCard score={78} maxScore={100} />

            {/* Card 2: Smart Stress-Free Cap (Safe Limit: ₹1,65,000) */}
            <div id="safe-limit-section">
              <SafeLimitCard onSpeakLimit={handleSafeLimitSpeak} />
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-col">
            {/* Card 3: Pre-Approved Rabi Sowing Loan (Wheat Field Banner) */}
            <RabiLoanHeroCard onRequestLoan={() => setIsLoanModalOpen(true)} />

            {/* Card 4: DPDP Act 2023 Verified Vault (Sovereign Consent) */}
            <div id="consent-vault-section">
              <SovereignConsentVaultCard />
            </div>
          </div>
        </div>

        {/* 4. Bottom 3-Card Row */}
        <div className="bottom-three-cards-grid" id="mandi-weather-section">
          {/* Card 1: Khanna Mandi Live Price */}
          <KhannaMandiCard onOpenMandiModal={() => setIsMandiModalOpen(true)} />

          {/* Card 2: Sowing Advisory & 5-Day Weather */}
          <SowingAdvisoryCard />

          {/* Card 3: DBT Subsidy Tracker & Field Mitra */}
          <DbtSubsidyTrackerCard onCallMitra={() => setIsMitraModalOpen(true)} />
        </div>
      </main>

      {/* 5. Footer */}
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
    </div>
  );
}
