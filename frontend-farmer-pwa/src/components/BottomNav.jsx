import React from 'react';
import {
  LayoutDashboard,
  Lightbulb,
  ShieldCheck,
  Upload,
  Wheat,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

export default function BottomNav({ activeTab, onSelectTab, pendingUploadCount = 0 }) {
  const { t } = useTranslation();

  const navItems = [
    { id: 'dashboard', labelKey: 'nav_dashboard', icon: LayoutDashboard },
    { id: 'insights', labelKey: 'nav_insights', icon: Lightbulb },
    { id: 'consent', labelKey: 'nav_consent', icon: ShieldCheck },
    { id: 'upload', labelKey: 'nav_upload', icon: Upload, badge: pendingUploadCount },
    { id: 'fpo', labelKey: 'nav_fpo', icon: Wheat },
  ];

  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelectTab(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="nav-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconComponent size={19} strokeWidth={isActive ? 2.3 : 1.9} />
            </span>
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
