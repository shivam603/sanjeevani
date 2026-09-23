import React, { useState, useEffect } from 'react';
import {
  Bell,
  CloudRain,
  CloudSun,
  TrendingUp,
  TriangleAlert,
  Leaf,
  Landmark,
  CalendarClock,
  Check,
  X,
  Inbox,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  loadStoredNotifications,
  saveStoredNotifications,
  markAsRead,
  toggleReadStatus,
  markAllAsRead,
  generateSmartNotifications,
} from '../services/notificationEngine';

function getNotificationIcon(notif) {
  const cat = notif?.category;
  const icon = notif?.icon;

  if (cat === 'WEATHER' || icon === 'CloudRain' || icon === '🌧️') {
    return icon === 'CloudSun' || icon === '☀️' ? (
      <CloudSun size={18} strokeWidth={2} />
    ) : (
      <CloudRain size={18} strokeWidth={2} />
    );
  }
  if (cat === 'MARKET' || icon === 'TrendingUp' || icon === '💰') {
    return <TrendingUp size={18} strokeWidth={2} />;
  }
  if (cat === 'RISK' || icon === 'TriangleAlert' || icon === '⚠️') {
    return <TriangleAlert size={18} strokeWidth={2} />;
  }
  if (cat === 'CROP' || icon === 'Leaf' || icon === '🌾') {
    return <Leaf size={18} strokeWidth={2} />;
  }
  if (cat === 'SCHEME' || icon === 'Landmark' || icon === '🏛️') {
    return <Landmark size={18} strokeWidth={2} />;
  }
  if (cat === 'CALENDAR' || icon === 'CalendarClock' || icon === '📅') {
    return <CalendarClock size={18} strokeWidth={2} />;
  }
  return <Bell size={18} strokeWidth={2} />;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  user,
  onNavigateToSection,
}) {
  const { t } = useTranslation();
  const userId = user?.id || 'ramesh_patel';

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'high'

  const refreshList = () => {
    let list = loadStoredNotifications(userId);
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
    setNotifications(list);
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    const handleUpdate = () => refreshList();
    window.addEventListener('sanjeevani_notifications_updated', handleUpdate);
    return () => {
      window.removeEventListener('sanjeevani_notifications_updated', handleUpdate);
    };
  }, [userId]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    markAllAsRead(userId);
    refreshList();
  };

  const handleToggleRead = (e, notifId) => {
    e.stopPropagation();
    toggleReadStatus(userId, notifId);
    refreshList();
  };

  const handleItemClick = (notif) => {
    markAsRead(userId, notif.id);
    refreshList();
    onClose();
    if (onNavigateToSection && notif.targetSection) {
      setTimeout(() => {
        onNavigateToSection(notif.targetSection);
      }, 150);
    }
  };

  // Filter items
  const filtered = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    if (filter === 'high') return item.priority === 'HIGH';
    return true;
  });

  // Group by Today vs Earlier
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayItems = [];
  const earlierItems = [];

  filtered.forEach((item) => {
    const itemDateStr = item.timestamp ? item.timestamp.split('T')[0] : todayDateStr;
    if (itemDateStr === todayDateStr) {
      todayItems.push(item);
    } else {
      earlierItems.push(item);
    }
  });

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Recent';
    const date = new Date(isoString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const renderNotificationCard = (item) => (
    <div
      key={item.id}
      className={`nc-item-card ${item.read ? 'read' : 'unread'} ${
        item.priority === 'HIGH' ? 'priority-high' : ''
      }`}
      onClick={() => handleItemClick(item)}
    >
      <div className="nc-item-icon-box">
        {getNotificationIcon(item)}
      </div>

      <div className="nc-item-content">
        <div className="nc-item-top">
          <span className="nc-category-badge">{item.category}</span>
          <span className={`nc-priority-dot ${item.priority.toLowerCase()}`}>
            {item.priority}
          </span>
        </div>

        <h4 className="nc-item-title">{item.title}</h4>
        <p className="nc-item-desc">{item.description}</p>

        <div className="nc-item-bottom">
          <div className="nc-meta-tags">
            {item.fieldName && <span className="nc-field-tag">{item.fieldName}</span>}
            <span>{formatRelativeTime(item.timestamp)}</span>
          </div>

          <div className="nc-item-actions">
            <button
              type="button"
              className="nc-read-toggle-btn"
              onClick={(e) => handleToggleRead(e, item.id)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              {item.read ? (
                'Mark unread'
              ) : (
                <>
                  <Check size={12} strokeWidth={2.4} />
                  <span>Read</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="nc-drawer-overlay" onClick={onClose}>
      <div className="nc-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="nc-header">
          <div className="nc-title-row">
            <Bell size={18} strokeWidth={2} style={{ color: '#059669' }} />
            <h3 className="nc-title">Notification Center</h3>
            {unreadCount > 0 && <span className="nc-unread-pill">{unreadCount}</span>}
          </div>

          <div className="nc-header-tools">
            {unreadCount > 0 && (
              <button
                type="button"
                className="nc-btn-mark-all"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              className="nc-close-btn"
              onClick={onClose}
              aria-label="Close"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="nc-filters-row">
          <button
            type="button"
            className={`nc-filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            className={`nc-filter-chip ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            className={`nc-filter-chip ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High Priority ({notifications.filter((n) => n.priority === 'HIGH').length})
          </button>
        </div>

        {/* Notification list grouped by Today & Earlier */}
        <div className="nc-body">
          {filtered.length === 0 ? (
            <div className="nc-empty">
              <div className="nc-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <Inbox size={42} strokeWidth={1.5} style={{ color: '#94a3b8' }} />
              </div>
              <h4>No notifications</h4>
              <p>You are all caught up with your farm activities and alerts.</p>
            </div>
          ) : (
            <>
              {todayItems.length > 0 && (
                <div className="nc-group">
                  <div className="nc-group-title">Today</div>
                  <div className="nc-list">{todayItems.map(renderNotificationCard)}</div>
                </div>
              )}

              {earlierItems.length > 0 && (
                <div className="nc-group">
                  <div className="nc-group-title">Earlier</div>
                  <div className="nc-list">{earlierItems.map(renderNotificationCard)}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
