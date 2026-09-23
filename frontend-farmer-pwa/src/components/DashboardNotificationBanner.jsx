import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  loadStoredNotifications,
  saveStoredNotifications,
  markAsRead,
  generateSmartNotifications,
} from '../services/notificationEngine';

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
          <span>{topNotification.icon || '🔔'}</span>
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
        >
          {topNotification.actionLabel || 'View Detail'} →
        </button>

        <button
          type="button"
          className="dnb-btn-dismiss"
          onClick={handleDismiss}
          title="Mark as read"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
