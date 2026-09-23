import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';
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
  LogOut,
  Sprout,
  FileText,
  X,
  ArrowUpRight,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  unreadCount = 0,
  isOpen = false,
  onClose,
  onLogout,
  onOpenPassport,
}) {
  const { t } = useTranslation();

  const farmerName = user?.name || t('farmer_name_display') || 'Ramesh Patel';
  const fpoName = user?.fpo || t('fpo_member_tag') || 'Khanna FPO Member';
  const acreage = user?.acreage || '4.2 Acres';
  const crop = user?.crop || 'Wheat (HD 3086)';

  const handleNavClick = (tabId) => {
    onSelectTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const navGroups = [
    {
      groupKey: 'nav_section_main',
      defaultTitle: 'MAIN',
      items: [
        { id: 'discover', labelKey: 'nav_discover', icon: Compass, defaultLabel: 'Quick Access / Discover' },
        { id: 'overview', labelKey: 'nav_overview', icon: LayoutDashboard, defaultLabel: 'Dashboard' },
        { id: 'my-farm', labelKey: 'nav_my_farm', icon: MapPinned, defaultLabel: 'My Farm' },
        { id: 'crops', labelKey: 'nav_crops', icon: Wheat, defaultLabel: 'My Crops' },
        { id: 'loans', labelKey: 'nav_loans', icon: CreditCard, defaultLabel: 'Loans & Limit' },
      ],
    },
    {
      groupKey: 'nav_section_intel',
      defaultTitle: 'FARM INTELLIGENCE',
      items: [
        { id: 'weather', labelKey: 'nav_weather', icon: CloudSun, defaultLabel: 'Weather' },
        { id: 'mandi', labelKey: 'nav_mandi', icon: TrendingUp, defaultLabel: 'Mandi & Market' },
        { id: 'crop-doctor', labelKey: 'nav_crop_doctor', icon: ScanSearch, defaultLabel: 'Crop Doctor' },
        { id: 'risk-alerts', labelKey: 'nav_risk_alerts', icon: TriangleAlert, defaultLabel: 'Risk Alerts' },
      ],
    },
    {
      groupKey: 'nav_section_plan',
      defaultTitle: 'PLANNING',
      items: [
        { id: 'calendar', labelKey: 'nav_crop_calendar', icon: CalendarDays, defaultLabel: 'Crop Calendar' },
        { id: 'schemes', labelKey: 'nav_schemes', icon: Landmark, defaultLabel: 'Government Schemes' },
      ],
    },
    {
      groupKey: 'nav_section_comm',
      defaultTitle: 'COMMUNICATION & TRUST',
      items: [
        {
          id: 'notifications',
          labelKey: 'nav_notifications',
          icon: Bell,
          defaultLabel: 'Notifications',
          badge: unreadCount > 0 ? unreadCount : null,
        },
        { id: 'consent', labelKey: 'nav_consent', icon: ShieldCheck, defaultLabel: 'Consent Vault' },
      ],
    },
  ];

  return (
    <aside
      className={`agritrust-sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}
      aria-label="Sidebar Navigation"
    >
      {/* 1. Sidebar Brand Header */}
      <div className="sidebar-brand-header">
        <div
          className="sidebar-brand-group"
          onClick={() => handleNavClick('discover')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleNavClick('discover')}
          aria-label="SANJEEVANI Quick Access & Discover"
        >
          <div className="sidebar-brand-icon-box">
            <Sprout size={20} strokeWidth={2.4} className="sidebar-brand-icon" />
          </div>
          <div className="sidebar-brand-text">
            <div className="sidebar-brand-row">
              <span className="sidebar-brand-title">{t('app_name')}</span>
              <span className="sidebar-brand-badge">Farmer</span>
            </div>
            <div className="sidebar-brand-subtitle">Sovereign Credit</div>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="sidebar-mobile-close-btn"
          onClick={onClose}
          aria-label="Close Navigation Drawer"
        >
          <X size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* 2. Farmer Identity Card */}
      <div className="sidebar-farmer-card">
        <div className="sidebar-farmer-top">
          <div className="sidebar-farmer-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <div className="sidebar-farmer-meta">
            <div className="sidebar-farmer-name" title={farmerName}>{farmerName}</div>
            <div className="sidebar-farmer-fpo" title={fpoName}>{fpoName}</div>
          </div>
        </div>

        <div className="sidebar-farmer-badges">
          <span className="sidebar-pill-badge">{acreage}</span>
          <span className="sidebar-pill-badge green-tint">{crop}</span>
        </div>

        {onOpenPassport && (
          <button
            type="button"
            className="sidebar-passport-quick-btn"
            onClick={() => {
              if (onClose) onClose();
              onOpenPassport();
            }}
          >
            <FileText size={15} strokeWidth={2} />
            <span>{t('pass_btn_nav') || 'Credit Passport'}</span>
            <ArrowUpRight size={14} className="sidebar-btn-arrow" strokeWidth={2.2} />
          </button>
        )}
      </div>

      {/* 3. Navigation Links List */}
      <nav className="sidebar-nav-container">
        {navGroups.map((group) => (
          <div key={group.groupKey} className="sidebar-nav-group">
            <div className="sidebar-group-title">
              {t(group.groupKey) || group.defaultTitle}
            </div>

            <ul className="sidebar-items-list">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="sidebar-item-icon">
                        <IconComponent size={19} strokeWidth={isActive ? 2.3 : 2} />
                      </span>
                      <span className="sidebar-item-label">
                        {t(item.labelKey) || item.defaultLabel}
                      </span>

                      {item.badge != null && (
                        <span className="sidebar-badge-count">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 4. Sidebar Bottom Sticky Footer (Settings & Logout) */}
      <div className="sidebar-bottom-footer">
        <button
          type="button"
          className={`sidebar-footer-btn ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => handleNavClick('support')}
        >
          <span className="sidebar-item-icon">
            <Settings size={18} strokeWidth={2} />
          </span>
          <span className="sidebar-item-label">{t('nav_settings') || 'Settings & Support'}</span>
        </button>

        {onLogout && (
          <button
            type="button"
            className="sidebar-footer-btn logout-action"
            onClick={() => {
              if (onClose) onClose();
              onLogout();
            }}
          >
            <span className="sidebar-item-icon">
              <LogOut size={18} strokeWidth={2} />
            </span>
            <span className="sidebar-item-label">{t('nav_logout') || 'Log Out'}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
