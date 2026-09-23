import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  CloudSun,
  TrendingUp,
  TriangleAlert,
  Leaf,
  Landmark,
  CalendarClock,
  Bell,
  ArrowRight,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  loadStoredNotifications,
  saveStoredNotifications,
  markAsRead,
  generateSmartNotifications,
} from '../services/notificationEngine';

function getNotificationIcon(notif) {
  const cat = notif?.category;
  const icon = notif?.icon;

  if (cat === 'WEATHER' || icon === 'CloudRain' || icon === '🌧️') {
    return icon === 'CloudSun' || icon === '☀️' ? (
      <CloudSun size={20} strokeWidth={2} />
    ) : (
      <CloudRain size={20} strokeWidth={2} />
    );
  }
  if (cat === 'MARKET' || icon === 'TrendingUp' || icon === '💰') {
    return <TrendingUp size={20} strokeWidth={2} />;
  }
  if (cat === 'RISK' || icon === 'TriangleAlert' || icon === '⚠️') {
    return <TriangleAlert size={20} strokeWidth={2} />;
  }
  if (cat === 'CROP' || icon === 'Leaf' || icon === '🌾') {
    return <Leaf size={20} strokeWidth={2} />;
  }
  if (cat === 'SCHEME' || icon === 'Landmark' || icon === '🏛️') {
    return <Landmark size={20} strokeWidth={2} />;
  }
  if (cat === 'CALENDAR' || icon === 'CalendarClock' || icon === '📅') {
    return <CalendarClock size={20} strokeWidth={2} />;
  }
  return <Bell size={20} strokeWidth={2} />;
}

export default function DashboardNotificationBanner({
  user,
  onOpenNotificationCenter,
  onNavigateToSection,
}) {
  const { t } = useTranslation();
  const userId = user?.id || 'ramesh_patel';

  const [topNotification, setTopNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync notifications and find top unread high-priority item
  const updateBanner = () => {
    let list = loadStoredNotifications(userId);

    // If storage is empty, initialize smart notifications from local context
    if (!list || list.length === 0) {
      let fields = [];
      try {
        const savedFields = localStorage.getItem(`sanjeevani_farm_fields_${userId}`);
        if (savedFields) fields = JSON.parse(savedFields);
      } catch (e) {}

      let calendarData = null;
      try {
        const savedCal = localStorage.getItem(`sanjeevani_crop_calendar_${userId}_field-184a`);
        if (savedCal) calendarData = JSON.parse(savedCal);
      } catch (e) {}

      list = generateSmartNotifications({
        userId,
        user,
        fields,
        calendarData,
        existingNotifications: [],
      });
      saveStoredNotifications(userId, list);
    }

    const unread = list.filter((n) => !n.read);
    setUnreadCount(unread.length);

    // Find the highest priority unread notification (HIGH preferred, then MEDIUM)
    const topItem = unread.find((n) => n.priority === 'HIGH') || unread[0] || null;
    setTopNotification(topItem);
  };

  useEffect(() => {
    updateBanner();

    const handleUpdate = () => updateBanner();
    window.addEventListener('sanjeevani_notifications_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('sanjeevani_notifications_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [userId]);

  if (!topNotification) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    markAsRead(userId, topNotification.id);
  };

  const handleAction = () => {
    markAsRead(userId, topNotification.id);
    if (onNavigateToSection && topNotification.targetSection) {
      onNavigateToSection(topNotification.targetSection);
    }
  };

  const isHighRisk = topNotification.priority === 'HIGH';

  return (
    <div className={`dashboard-notif-banner ${isHighRisk ? 'high-risk' : ''}`}>
      <div className="dnb-left" onClick={handleAction} style={{ cursor: 'pointer' }}>
        <div className="dnb-icon-box">
          {getNotificationIcon(topNotification)}
        </div>

        <div className="dnb-content">
          <div className="dnb-title-row">
            <span
              className={`dnb-priority-tag ${
                topNotification.priority === 'HIGH' ? 'priority-high' : 'priority-medium'
              }`}
            >
              {topNotification.category} • {topNotification.priority}
            </span>
            <h4 className="dnb-title">{topNotification.title}</h4>
          </div>
          <p className="dnb-desc">{topNotification.description}</p>
        </div>
      </div>

      <div className="dnb-right">
        <button
          type="button"
          className="dnb-btn-action"
          onClick={handleAction}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>{topNotification.actionLabel || 'View Detail'}</span>
          <ArrowRight size={14} strokeWidth={2} />
        </button>

        <button
          type="button"
          className="dnb-btn-dismiss"
          onClick={handleDismiss}
          title="Mark as read"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
