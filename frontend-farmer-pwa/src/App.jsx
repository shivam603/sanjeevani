import React, { useState, useEffect } from 'react';
import './styles/pwa.css';
import { useTranslation } from './i18n/LanguageContext';
import {
  Compass,
  LayoutDashboard,
  MapPinned,
  Wheat,
  CreditCard,
  CloudSun,
  TrendingUp,
  ScanSearch,
  TriangleAlert,
  CalendarDays,
  Landmark,
  Bell,
  ShieldCheck,
  Settings,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Volume2,
  FileText,
  Droplets,
  Sprout,
  Shield,
  HelpCircle,
  RefreshCw,
  Inbox,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  CalendarClock,
  Clock,
  ExternalLink,
} from 'lucide-react';

import SingleSignOnPage from './components/SingleSignOnPage';
import Sidebar from './components/Sidebar';
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
import EarlyWarningCard from './components/EarlyWarningCard';
import CropCalendarCard from './components/CropCalendarCard';
import CropCalendarModal from './components/CropCalendarModal';
import DashboardNotificationBanner from './components/DashboardNotificationBanner';
import NotificationCenterModal from './components/NotificationCenterModal';
import LenderTerminalApp from './lender/LenderTerminalApp';
import { loadStoredNotifications } from './services/notificationEngine';

// Feature configuration dictionary for secondary panel header and metadata
const FEATURE_CONFIG = {
  'discover': {
    title: 'Quick Access & Discover Hub',
    category: 'Sovereign Control',
    icon: Compass,
    badge: 'Hub Active',
  },
  'overview': {
    title: 'Financial Health & Sovereign Credit Overview',
    category: 'Core Finance',
    icon: LayoutDashboard,
    badge: 'Score 78/100 Verified',
  },
  'my-farm': {
    title: 'My Farm & Sentinel-2 Satellite Sentinel',
    category: 'Spatial Intelligence',
    icon: MapPinned,
    badge: 'Sentinel-2 10m NDVI',
  },
  'crops': {
    title: 'Crop Management & Agronomic Lifecycle',
    category: 'Crop Science',
    icon: Wheat,
    badge: 'Wheat HD-3086 Active',
  },
  'loans': {
    title: 'Safe Borrowing & Sovereign Credit Limit',
    category: 'Lending & Credit',
    icon: CreditCard,
    badge: '₹1,65,000 Safe Limit',
  },
  'weather': {
    title: 'Agro-Meteorology & Rainfall Forecast',
    category: 'Farm Intelligence',
    icon: CloudSun,
    badge: 'Hyperlocal 5-Day Live',
  },
  'mandi': {
    title: 'Mandi Market Intelligence & APMC Rates',
    category: 'Trade & Liquidity',
    icon: TrendingUp,
    badge: 'Khanna APMC Live',
  },
  'crop-doctor': {
    title: 'Crop Doctor & Pest Health Diagnostics',
    category: 'Plant Protection',
    icon: ScanSearch,
    badge: 'AI Stress Scanner',
  },
  'risk-alerts': {
    title: 'Predictive Agro-Meteorological Risk Alerts',
    category: 'Early Warning',
    icon: TriangleAlert,
    badge: 'Active Risk Radar',
  },
  'calendar': {
    title: 'Personalized Crop Lifecycle Calendar',
    category: 'Farm Planning',
    icon: CalendarDays,
    badge: 'Stage 3: CRI Active',
  },
  'schemes': {
    title: 'Government Schemes & DBT Grant Tracker',
    category: 'Public Grants',
    icon: Landmark,
    badge: 'PM-KISAN Verified',
  },
  'consent': {
    title: 'Sovereign Consent & Data Permissions Vault',
    category: 'Privacy & Security',
    icon: ShieldCheck,
    badge: 'Zero-Knowledge Vault',
  },
};

export default function App() {
  const { currentLang, getAdvisorySpeech } = useTranslation();

  // Authentication State - Farmer
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agritrust_farmer_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  // Authentication State - Lender
  const [lenderUser, setLenderUser] = useState(() => {
    try {
      const stored = localStorage.getItem('agritrust_lender_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });

  const [activePortal, setActivePortal] = useState(() => {
    try {
      return localStorage.getItem('agritrust_active_portal') || 'farmer';
    } catch (e) {
      return 'farmer';
    }
  });

  // Default to 'discover' (unselected state) so heavy cards are not preloaded
  const [activeNavTab, setActiveNavTab] = useState('discover');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic context loading and error states for the secondary panel
  const [isFeatureLoading, setIsFeatureLoading] = useState(false);
  const [featureError, setFeatureError] = useState(null);

  // Sync unread notifications count for sidebar badge
  useEffect(() => {
    const updateCount = () => {
      const list = loadStoredNotifications(user?.id || 'ramesh_patel');
      const unread = list.filter((n) => !n.read).length;
      setUnreadCount(unread);
    };
    updateCount();
    window.addEventListener('sanjeevani_notifications_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('sanjeevani_notifications_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, [user?.id]);

  // Modals state
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isMitraModalOpen, setIsMitraModalOpen] = useState(false);
  const [isMandiModalOpen, setIsMandiModalOpen] = useState(false);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const handleNavigateToNotificationTarget = (targetSection) => {
    if (targetSection === 'crop-calendar-section') {
      handleSelectTab('calendar');
      return;
    }
    if (targetSection === 'dbt-mitra-section' || targetSection === 'dbt-schemes-section') {
      handleSelectTab('schemes');
      return;
    }
    if (targetSection === 'sowing-advisory-section') {
      handleSelectTab('weather');
      return;
    }
    if (targetSection === 'khanna-mandi-section' || targetSection === 'mandi-weather-section') {
      handleSelectTab('mandi');
      return;
    }
    if (targetSection === 'early-warning-section') {
      handleSelectTab('risk-alerts');
      return;
    }
    if (targetSection === 'satellite-map-section') {
      handleSelectTab('my-farm');
      return;
    }
    if (targetSection === 'safe-limit-section' || targetSection === 'hero-loan-section') {
      handleSelectTab('loans');
      return;
    }
    if (targetSection === 'consent-vault-section') {
      handleSelectTab('consent');
      return;
    }
    handleSelectTab('discover');
  };

  const handleLogin = (userData) => {
    if (userData.role === 'lender') {
      try {
        localStorage.setItem('agritrust_lender_user', JSON.stringify(userData));
        localStorage.setItem('agritrust_active_portal', 'lender');
      } catch (e) {}
      setLenderUser(userData);
      setActivePortal('lender');
      return;
    }

    setUser(userData);
    setActivePortal('farmer');
    try {
      localStorage.setItem('agritrust_active_portal', 'farmer');
    } catch (e) {}
    if (userData.rememberMe) {
      localStorage.setItem('agritrust_farmer_user', JSON.stringify(userData));
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('agritrust_farmer_user');
    localStorage.setItem('agritrust_active_portal', 'farmer');
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleLenderLogout = () => {
    setLenderUser(null);
    localStorage.removeItem('agritrust_lender_user');
    localStorage.setItem('agritrust_active_portal', 'farmer');
    setActivePortal('farmer');
  };

  const handleSwitchToLender = () => {
    const activeLender = lenderUser || {
      role: 'lender',
      lenderType: 'bank',
      email: 'vikram.mehta@sbi.co.in',
      institutionName: 'State Bank of India — Agri Division',
      officerName: 'Vikram Mehta',
      officerRole: 'Lead Agri Underwriter • Maharashtra Hub',
      rememberMe: true,
    };
    setLenderUser(activeLender);
    setActivePortal('lender');
    try {
      localStorage.setItem('agritrust_lender_user', JSON.stringify(activeLender));
      localStorage.setItem('agritrust_active_portal', 'lender');
    } catch (e) {}
  };

  const handleSwitchToFarmer = () => {
    if (!user) {
      const demoFarmer = {
        role: 'farmer',
        id: '9876543210',
        name: 'Ramesh Patel',
        fpo: 'Khanna FPO',
        cluster: 'Village Bhadson, Ludhiana Cluster',
        acreage: '4.2 Acres',
        crop: 'Wheat (HD 3086)',
        rememberMe: true,
      };
      setUser(demoFarmer);
      try {
        localStorage.setItem('agritrust_farmer_user', JSON.stringify(demoFarmer));
      } catch (e) {}
    }
    setActivePortal('farmer');
    try {
      localStorage.setItem('agritrust_active_portal', 'farmer');
    } catch (e) {}
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

  // Navigation tab switcher with dynamic lazy transition
  const handleSelectTab = (tab) => {
    // Quick Modals trigger shortcuts
    if (tab === 'notifications') {
      setIsNotificationCenterOpen(true);
      return;
    }
    if (tab === 'support') {
      setIsMitraModalOpen(true);
      return;
    }

    const targetTab = tab || 'discover';
    setFeatureError(null);
    setIsFeatureLoading(true);
    setActiveNavTab(targetTab);

    const scrollArea = document.getElementById('agritrust-scroll-area');
    if (scrollArea) {
      scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Dynamic micro-delay to give a responsive, context-aware lazy-load feel
    setTimeout(() => {
      setIsFeatureLoading(false);
    }, 240);
  };

  // 1. If currently in institutional lender portal
  if (activePortal === 'lender' && lenderUser) {
    return (
      <LenderTerminalApp
        lenderUser={lenderUser}
        onLogout={handleLenderLogout}
        onSwitchToFarmer={handleSwitchToFarmer}
      />
    );
  }

  // 2. If not authenticated as farmer, show Single Sign-On and Login Page
  if (!user) {
    return <SingleSignOnPage onLoginSuccess={handleLogin} />;
  }

  const activeConfig = FEATURE_CONFIG[activeNavTab] || {
    title: 'Farm Feature',
    category: 'Intelligence',
    icon: Sprout,
    badge: 'Active',
  };
  const FeatureIcon = activeConfig.icon;

  // 3. If authenticated as farmer, show full home webpage with vertical sidebar layout
  return (
    <div className="agritrust-app-layout">
      {/* 1. Left Vertical Navigation Sidebar */}
      <Sidebar
        activeTab={activeNavTab}
        onSelectTab={handleSelectTab}
        user={user}
        unreadCount={unreadCount}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenPassport={() => setIsPassportModalOpen(true)}
      />

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 2. Main Content Wrapper */}
      <div className="agritrust-main-wrapper">
        {/* Compact Application Header */}
        <TopNavbar
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSelectTab={handleSelectTab}
          onTriggerSpeech={() => handleSpeak(1.0)}
          isSpeaking={isSpeaking}
          onLogout={handleLogout}
          user={user}
          onOpenPassport={() => setIsPassportModalOpen(true)}
          onSwitchToLender={handleSwitchToLender}
          onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        />

        {/* 3. Independently Scrollable Secondary Content Area */}
        <div className="agritrust-scroll-area" id="agritrust-scroll-area">
          <main className="agritrust-main-container">
            {/* Farmer Identity Greeting & Audio Assistant Bar */}
            <FarmerGreetingBar
              onPlayAudio={(speed) => handleSpeak(speed)}
              isPlaying={isSpeaking}
              user={user}
            />

            {/* Centralized Smart Notification Engine Banner (High-Priority Unread Alerts) */}
            <DashboardNotificationBanner
              user={user}
              onOpenNotificationCenter={() => setIsNotificationCenterOpen(true)}
              onNavigateToSection={handleNavigateToNotificationTarget}
            />

            {/* =========================================================================
                CASE A: NOTHING SELECTED / DISCOVER VIEW
                Shows clean, high-utility Quick Access & Discovery view (NOT dashboard cards)
               ========================================================================= */}
            {activeNavTab === 'discover' || !activeNavTab ? (
              <div className="discover-view-container">
                {/* 1. Discover Hero Banner */}
                <div className="discover-hero-banner">
                  <div className="discover-hero-content">
                    <div className="discover-hero-top">
                      <span className="discover-hero-badge">
                        <Sparkles size={14} />
                        Sanjeevani Command Hub
                      </span>
                      <span className="discover-hero-cluster">
                        {user?.cluster || 'Village Bhadson, Ludhiana Cluster'}
                      </span>
                    </div>

                    <h1 className="discover-hero-title">
                      Namaste, {user?.name || 'Ramesh Patel'} ji!
                    </h1>
                    <p className="discover-hero-subtitle">
                      Your sovereign agricultural intelligence workspace. Select any module from the left menu to view real-time data, or use the quick access tools below.
                    </p>

                    {/* Instant Action Station Bar */}
                    <div className="discover-quick-actions-bar">
                      <button
                        type="button"
                        className="discover-action-chip accent-chip"
                        onClick={() => handleSpeak(1.0)}
                      >
                        <Volume2 size={16} />
                        <span>{isSpeaking ? 'Listening...' : 'Sunaao (Voice)'}</span>
                      </button>

                      <button
                        type="button"
                        className="discover-action-chip"
                        onClick={() => setIsMitraModalOpen(true)}
                      >
                        <PhoneCall size={15} color="#059669" />
                        <span>Call Field Mitra</span>
                      </button>

                      <button
                        type="button"
                        className="discover-action-chip"
                        onClick={() => setIsPassportModalOpen(true)}
                      >
                        <FileText size={15} color="#0284c7" />
                        <span>Credit Passport</span>
                      </button>

                      <button
                        type="button"
                        className="discover-action-chip"
                        onClick={() => setIsMandiModalOpen(true)}
                      >
                        <TrendingUp size={15} color="#b45309" />
                        <span>Khanna Mandi Rates</span>
                      </button>

                      <button
                        type="button"
                        className="discover-action-chip"
                        onClick={() => setIsLoanModalOpen(true)}
                      >
                        <CreditCard size={15} color="#7e22ce" />
                        <span>Apply Rabi Loan</span>
                      </button>

                      <button
                        type="button"
                        className="discover-action-chip"
                        onClick={() => setIsCalendarModalOpen(true)}
                      >
                        <CalendarClock size={15} color="#047857" />
                        <span>Crop Calendar</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Real-Time Farm Telemetry Snapshot (Non-duplicated summary stats) */}
                <div>
                  <div className="discover-section-header">
                    <div className="discover-section-title">
                      <Sprout size={18} color="#059669" />
                      <span>Today's Farm Telemetry & Readiness</span>
                    </div>
                    <span className="discover-section-subtitle">Real-time sensor & cluster baseline</span>
                  </div>

                  <div className="discover-telemetry-grid">
                    <div className="telemetry-card">
                      <div className="telemetry-top">
                        <div className="telemetry-icon-box green">
                          <Droplets size={16} />
                        </div>
                        <span className="telemetry-badge positive">Optimal</span>
                      </div>
                      <div>
                        <div className="telemetry-value">28% VWC</div>
                        <div className="telemetry-label">Root Zone Soil Moisture</div>
                      </div>
                    </div>

                    <div className="telemetry-card">
                      <div className="telemetry-top">
                        <div className="telemetry-icon-box amber">
                          <Clock size={16} />
                        </div>
                        <span className="telemetry-badge neutral">Favorable</span>
                      </div>
                      <div>
                        <div className="telemetry-value">4 Days Left</div>
                        <div className="telemetry-label">Ideal Sowing Window</div>
                      </div>
                    </div>

                    <div className="telemetry-card">
                      <div className="telemetry-top">
                        <div className="telemetry-icon-box sky">
                          <CloudSun size={16} />
                        </div>
                        <span className="telemetry-badge neutral">Dry Spell</span>
                      </div>
                      <div>
                        <div className="telemetry-value">15% Rain Prob.</div>
                        <div className="telemetry-label">Clear Spraying Period</div>
                      </div>
                    </div>

                    <div className="telemetry-card">
                      <div className="telemetry-top">
                        <div className="telemetry-icon-box green">
                          <TrendingUp size={16} />
                        </div>
                        <span className="telemetry-badge positive">+₹45 / qtl</span>
                      </div>
                      <div>
                        <div className="telemetry-value">₹2,325 / qtl</div>
                        <div className="telemetry-label">Khanna APMC Wheat Rate</div>
                      </div>
                    </div>

                    <div className="telemetry-card">
                      <div className="telemetry-top">
                        <div className="telemetry-icon-box purple">
                          <CreditCard size={16} />
                        </div>
                        <span className="telemetry-badge active">4% Subvention</span>
                      </div>
                      <div>
                        <div className="telemetry-value">₹1,65,000</div>
                        <div className="telemetry-label">Pre-Approved Safe Cap</div>
                      </div>
                    </div>

                    <div className="telemetry-card">
                      <div className="telemetry-top">
                        <div className="telemetry-icon-box green">
                          <ShieldCheck size={16} />
                        </div>
                        <span className="telemetry-badge positive">Encrypted</span>
                      </div>
                      <div>
                        <div className="telemetry-value">100% Sovereign</div>
                        <div className="telemetry-label">Consent Vault Security</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Feature Discovery Directory (Launchpad Grid) */}
                <div>
                  <div className="discover-section-header">
                    <div className="discover-section-title">
                      <Compass size={18} color="#0284c7" />
                      <span>Explore Farm Intelligence Modules</span>
                    </div>
                    <span className="discover-section-subtitle">Click to load dedicated live data</span>
                  </div>

                  <div className="discover-feature-grid">
                    {/* Card 1: Weather */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('weather')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <CloudSun size={22} />
                        </div>
                        <span className="feature-launcher-tag">Hyperlocal</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Weather & Rainfall Radar</div>
                        <div className="feature-launcher-desc">
                          Hyperlocal 5-day precipitation forecasts, humidity, wind vector, and ideal spray safety windows.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Open Weather <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Mandi */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('mandi')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <TrendingUp size={22} />
                        </div>
                        <span className="feature-launcher-tag">Market Live</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Mandi Price Intelligence</div>
                        <div className="feature-launcher-desc">
                          Live Khanna APMC benchmark prices, arrival volumes, sell signals, and seasonal price forecasts.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Open Mandi <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 3: Satellite Field Map */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('my-farm')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <MapPinned size={22} />
                        </div>
                        <span className="feature-launcher-tag">Sentinel-2</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Satellite NDVI Field Map</div>
                        <div className="feature-launcher-desc">
                          10m multispectral vegetation health, crop vigor heatmaps, moisture stress, and boundary survey.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          View Satellite Map <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 4: Loans & Limits */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('loans')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <CreditCard size={22} />
                        </div>
                        <span className="feature-launcher-tag">Zero Collateral</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Pre-Approved Credit & Safe Limit</div>
                        <div className="feature-launcher-desc">
                          ₹1,65,000 stress-free borrowing cap, instant 1-click disbursal, and interactive score simulator.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Check Loan Limit <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 5: Risk Alerts */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('risk-alerts')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <TriangleAlert size={22} />
                        </div>
                        <span className="feature-launcher-tag">Predictive</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Early Warning Risk Radar</div>
                        <div className="feature-launcher-desc">
                          Prioritized agro-meteorological risks: sudden frost, yellow rust vectors, and pest heat maps.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          View Risk Radar <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 6: Crop Calendar */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('calendar')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <CalendarDays size={22} />
                        </div>
                        <span className="feature-launcher-tag">Stage 3: CRI</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Personalized Crop Calendar</div>
                        <div className="feature-launcher-desc">
                          Field-tested lifecycle timeline, irrigation intervals, fertilizer split-dosages, and harvest dates.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Open Calendar <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 7: DBT Schemes */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('schemes')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <Landmark size={22} />
                        </div>
                        <span className="feature-launcher-tag">Direct Benefit</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Government Schemes & DBT</div>
                        <div className="feature-launcher-desc">
                          PM-KISAN installment verification, fertilizer subsidies, state tractor grant tracking & Field Mitra.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Track Subsidies <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 8: Consent Vault */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('consent')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <ShieldCheck size={22} />
                        </div>
                        <span className="feature-launcher-tag">Apple Privacy</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Sovereign Consent Vault</div>
                        <div className="feature-launcher-desc">
                          Granular control over who accesses your farm boundaries, yield history, and banking credit records.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Manage Vault <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 9: Crop Doctor */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('crop-doctor')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <ScanSearch size={22} />
                        </div>
                        <span className="feature-launcher-tag">AI Agronomy</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Crop Doctor & Diagnostic Map</div>
                        <div className="feature-launcher-desc">
                          Multispectral canopy analysis, pest symptom diagnosis, and customized curative spray prescriptions.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Diagnose Crops <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card 10: Financial Overview */}
                    <div
                      className="feature-launcher-card"
                      onClick={() => handleSelectTab('overview')}
                    >
                      <div className="feature-launcher-top">
                        <div className="feature-launcher-icon">
                          <LayoutDashboard size={22} />
                        </div>
                        <span className="feature-launcher-tag">Credit Health</span>
                      </div>
                      <div className="feature-launcher-info">
                        <div className="feature-launcher-title">Financial Health & Sovereign Score</div>
                        <div className="feature-launcher-desc">
                          Explore your 78/100 sovereign rating, institutional lender view, and credit limit expansion factors.
                        </div>
                      </div>
                      <div className="feature-launcher-bottom">
                        <span className="feature-launcher-cta">
                          Open Overview <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Agronomic Tip & Support Helpline */}
                <div className="discover-tip-grid">
                  <div className="discover-tip-card">
                    <Lightbulb size={22} className="discover-tip-icon" />
                    <div>
                      <div className="discover-tip-title">Daily Agronomy Recommendation (Wheat HD-3086)</div>
                      <div className="discover-tip-body">
                        <strong>Crown Root Initiation (CRI) Window:</strong> Ensure your first irrigation occurs at 21–25 days after sowing. Top-dress the first 1/3 dose of Nitrogen (45 kg Urea/acre) immediately prior to irrigation for up to 18% higher tillering density.
                      </div>
                    </div>
                  </div>

                  <div className="discover-support-card">
                    <div className="discover-support-meta">
                      <div className="discover-support-title">Kisan Toll-Free Helpline</div>
                      <div className="discover-support-phone">1800-180-1551</div>
                      <div style={{ fontSize: '11px', color: '#6366f1' }}>Free call • 6 AM – 10 PM</div>
                    </div>
                    <button
                      type="button"
                      className="discover-support-btn"
                      onClick={() => setIsMitraModalOpen(true)}
                      title="Call Field Mitra / Helpdesk"
                    >
                      <PhoneCall size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* =========================================================================
                  CASE B: FEATURE SELECTED
                  Loads ONLY the relevant feature data in the secondary panel
                 ========================================================================= */
              <div className="secondary-feature-panel">
                {/* Secondary Panel Context-Aware Header */}
                <header className="secondary-panel-header">
                  <div className="panel-header-left">
                    <button
                      type="button"
                      className="back-to-discover-btn"
                      onClick={() => handleSelectTab('discover')}
                      aria-label="Return to Quick Access & Discover View"
                    >
                      <ArrowLeft size={16} />
                      <span>Back to Quick Access</span>
                    </button>

                    <div className="panel-header-title-group">
                      <div className="panel-header-icon-box">
                        <FeatureIcon size={20} strokeWidth={2.4} />
                      </div>
                      <div className="panel-header-meta">
                        <span className="panel-header-breadcrumb">
                          SANJEEVANI / {activeConfig.category}
                        </span>
                        <h2 className="panel-header-title">
                          {activeConfig.title}
                        </h2>
                      </div>
                    </div>
                  </div>

                  <div className="panel-header-right">
                    <span className="panel-status-pill">
                      <span className="panel-status-dot" />
                      {activeConfig.badge}
                    </span>
                  </div>
                </header>

                {/* Dynamic Loading State Skeleton */}
                {isFeatureLoading ? (
                  <div className="feature-loading-skeleton" aria-busy="true">
                    <div className="skeleton-shimmer skeleton-header" />
                    <div className="skeleton-shimmer skeleton-block" />
                    <div className="skeleton-grid">
                      <div className="skeleton-shimmer skeleton-card" />
                      <div className="skeleton-shimmer skeleton-card" />
                      <div className="skeleton-shimmer skeleton-card" />
                    </div>
                    <div className="skeleton-shimmer skeleton-row" />
                  </div>
                ) : featureError ? (
                  /* Error State Fallback */
                  <div className="feature-state-box">
                    <div className="state-icon-circle error">
                      <AlertTriangle size={32} />
                    </div>
                    <div className="state-title">Unable to Load Feature Data</div>
                    <div className="state-description">
                      We encountered an issue fetching real-time telemetry for this module. Your offline cache remains secure.
                    </div>
                    <button
                      type="button"
                      className="state-action-btn"
                      onClick={() => handleSelectTab(activeNavTab)}
                    >
                      <RefreshCw size={15} />
                      <span>Retry Loading</span>
                    </button>
                  </div>
                ) : (
                  /* Feature Data Content — Loads ONLY the selected feature */
                  <div className="feature-content-container">
                    {/* 1. Overview / Dashboard Tab */}
                    {activeNavTab === 'overview' && (
                      <div className="feature-module-wrapper">
                        <div id="hero-loan-section" className="hero-loan-wrapper" style={{ marginBottom: '16px' }}>
                          <RabiLoanHeroCard onRequestLoan={() => setIsLoanModalOpen(true)} />
                        </div>

                        <div className="main-dashboard-grid">
                          <div id="credit-health-section" className="dashboard-card-wrapper">
                            <CreditHealthCard
                              score={78}
                              maxScore={100}
                              onOpenSimulator={() => handleSelectTab('loans')}
                              onOpenPassport={() => setIsPassportModalOpen(true)}
                            />
                          </div>

                          <div id="safe-limit-section" className="dashboard-full-width-card">
                            <SafeLimitCard onSpeakLimit={handleSafeLimitSpeak} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. My Farm / Satellite Sentinel Tab */}
                    {activeNavTab === 'my-farm' && (
                      <div id="satellite-map-section" className="feature-module-wrapper">
                        <SatelliteFieldMapCard user={user} />
                      </div>
                    )}

                    {/* 3. My Crops Tab */}
                    {activeNavTab === 'crops' && (
                      <div className="feature-module-wrapper">
                        <div id="crop-calendar-section" className="dashboard-full-width-card" style={{ marginBottom: '16px' }}>
                          <CropCalendarCard onOpenCalendar={() => setIsCalendarModalOpen(true)} user={user} />
                        </div>
                        <div id="sowing-advisory-section">
                          <SowingAdvisoryCard user={user} />
                        </div>
                      </div>
                    )}

                    {/* 4. Loans & Credit Limit Tab */}
                    {activeNavTab === 'loans' && (
                      <div className="feature-module-wrapper">
                        <div id="hero-loan-section" className="hero-loan-wrapper" style={{ marginBottom: '16px' }}>
                          <RabiLoanHeroCard onRequestLoan={() => setIsLoanModalOpen(true)} />
                        </div>
                        <div id="safe-limit-section" className="dashboard-full-width-card" style={{ marginBottom: '16px' }}>
                          <SafeLimitCard onSpeakLimit={handleSafeLimitSpeak} />
                        </div>
                        <div id="score-simulator-section">
                          <CreditScoreSimulatorCard
                            onOpenPassport={() => setIsPassportModalOpen(true)}
                          />
                        </div>
                      </div>
                    )}

                    {/* 5. Weather Tab */}
                    {activeNavTab === 'weather' && (
                      <div id="sowing-advisory-section" className="feature-module-wrapper">
                        <SowingAdvisoryCard user={user} />
                      </div>
                    )}

                    {/* 6. Mandi & Market Tab */}
                    {activeNavTab === 'mandi' && (
                      <div id="khanna-mandi-section" className="feature-module-wrapper">
                        <KhannaMandiCard onOpenMandiModal={() => setIsMandiModalOpen(true)} user={user} />
                      </div>
                    )}

                    {/* 7. Crop Doctor Tab */}
                    {activeNavTab === 'crop-doctor' && (
                      <div id="satellite-map-section" className="feature-module-wrapper">
                        <SatelliteFieldMapCard user={user} />
                      </div>
                    )}

                    {/* 8. Risk Alerts Tab */}
                    {activeNavTab === 'risk-alerts' && (
                      <div id="early-warning-section" className="dashboard-full-width-card feature-module-wrapper">
                        <EarlyWarningCard user={user} />
                      </div>
                    )}

                    {/* 9. Crop Calendar Tab */}
                    {activeNavTab === 'calendar' && (
                      <div id="crop-calendar-section" className="dashboard-full-width-card feature-module-wrapper">
                        <CropCalendarCard onOpenCalendar={() => setIsCalendarModalOpen(true)} user={user} />
                      </div>
                    )}

                    {/* 10. Government Schemes Tab */}
                    {activeNavTab === 'schemes' && (
                      <div id="dbt-schemes-section" className="dashboard-full-width-card feature-module-wrapper">
                        <DbtSubsidyTrackerCard onCallMitra={() => setIsMitraModalOpen(true)} />
                      </div>
                    )}

                    {/* 11. Sovereign Consent Vault Tab */}
                    {activeNavTab === 'consent' && (
                      <div id="consent-vault-section" className="dashboard-card-wrapper feature-module-wrapper">
                        <SovereignConsentVaultCard />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Footer */}
          <AgriTrustFooter />
        </div>
      </div>

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

      <DownloadPassportModal
        isOpen={isPassportModalOpen}
        onClose={() => setIsPassportModalOpen(false)}
        farmerData={user}
      />

      <CropCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        user={user}
      />

      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        user={user}
        onNavigateToSection={handleNavigateToNotificationTarget}
      />
    </div>
  );
}
