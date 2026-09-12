import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function BottomNav({ activeTab, onSelectTab, pendingUploadCount = 0 }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', labelKey: 'nav_dashboard', icon: '📊' },
    { id: 'insights', labelKey: 'nav_insights', icon: '💡' },
    { id: 'consent', labelKey: 'nav_consent', icon: '🛡️' },
    { id: 'upload', labelKey: 'nav_upload', icon: '📤', badge: pendingUploadCount },
    { id: 'fpo', labelKey: 'nav_fpo', icon: '🌾' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{t(item.labelKey)}</span>

            {/* Offline Pending Badge */}
            {item.badge > 0 && (
              <span className="nav-badge-count" title={`${item.badge} offline uploads queued`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
