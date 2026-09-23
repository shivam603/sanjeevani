import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  generateCropSchedule,
  loadSavedCalendar,
  saveCalendarToStorage,
} from '../services/calendarEngine';
import {
  CalendarDays,
  CalendarClock,
  Wheat,
  Clock,
  Sprout,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
  Info,
  Droplets,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

function getActivityIcon(activityName, fallbackIcon, size = 16) {
  const name = (activityName || '').toLowerCase();
  if (name.includes('irrigation') || name.includes('water') || name.includes('rain')) {
    return <Droplets size={size} strokeWidth={2} />;
  }
  if (name.includes('harvest') || name.includes('heading') || name.includes('grain')) {
    return <Wheat size={size} strokeWidth={2} />;
  }
  if (name.includes('fertilizer') || name.includes('protection') || name.includes('spray')) {
    return <ShieldCheck size={size} strokeWidth={2} />;
  }
  return <Sprout size={size} strokeWidth={2} />;
}

export default function CropCalendarCard({ onOpenCalendar, user }) {
  const { t } = useTranslation();
  const userId = user?.id || 'ramesh_patel';

  // 1. Load active fields from Sanjeevani Farm Fields storage or fallback baseline
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('field-184a');
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize fields
  useEffect(() => {
    try {
      const savedFields = localStorage.getItem(`sanjeevani_farm_fields_${userId}`);
      if (savedFields) {
        const parsed = JSON.parse(savedFields);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFields(parsed);
          setSelectedFieldId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not read user farm fields:', e);
    }

    // Default fields fallback
    const defaults = [
      {
        id: 'field-184a',
        name: 'Field A (Plot #184/A)',
        crop: user?.crop || 'Wheat (HD 3086)',
        cropStage: 'Grain Filling',
        area: user?.acreage || '4.2 Acres',
      },
      {
        id: 'field-183',
        name: 'Field B (Plot #183)',
        crop: 'Mustard (Pusa Bold)',
        cropStage: 'Pod Formation',
        area: '2.8 Acres',
      },
      {
        id: 'field-185',
        name: 'Field C (Plot #185)',
        crop: 'Sugarcane (Co 0238)',
        cropStage: 'Grand Growth',
        area: '3.5 Acres',
      },
    ];
    setFields(defaults);
    setSelectedFieldId(defaults[0].id);
  }, [userId, user?.crop, user?.acreage]);

  // Load calendar for selected field
  const refreshCalendar = useCallback(() => {
    if (!selectedFieldId || fields.length === 0) return;
    setLoading(true);

    const activeField = fields.find((f) => f.id === selectedFieldId) || fields[0];
    const saved = loadSavedCalendar(userId, selectedFieldId);

    if (saved && saved.activities) {
      // Re-evaluate next activity from saved activities
      let nextAct = null;
      for (const act of saved.activities) {
        if (!act.is_completed) {
          nextAct = act;
          break;
        }
      }
      if (!nextAct && saved.activities.length > 0) {
        nextAct = saved.activities[saved.activities.length - 1];
      }
      const completedCount = saved.activities.filter((a) => a.is_completed).length;
      const progressPct = Math.round((completedCount / Math.max(1, saved.activities.length)) * 100);

      setCalendarData({
        ...saved,
        next_activity: nextAct,
        completed_count: completedCount,
        progress_percentage: progressPct,
      });
    } else {
      // Generate standard agronomic timeline
      const generated = generateCropSchedule({
        crop: activeField.crop || 'Wheat (HD 3086)',
        fieldName: activeField.name,
        currentStage: activeField.cropStage || 'Grain Filling',
      });
      saveCalendarToStorage(userId, selectedFieldId, generated);
      setCalendarData(generated);
    }
    setLoading(false);
  }, [selectedFieldId, fields, userId]);

  useEffect(() => {
    refreshCalendar();
  }, [refreshCalendar]);

  // Listen for storage changes across tabs or from modal updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.includes(`sanjeevani_crop_calendar_${userId}`)) {
        refreshCalendar();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sanjeevani_calendar_updated', refreshCalendar);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sanjeevani_calendar_updated', refreshCalendar);
    };
  }, [userId, refreshCalendar]);

  // Quick complete action directly from card
  const handleQuickComplete = (e) => {
    e.stopPropagation();
    if (!calendarData || !calendarData.next_activity) return;

    const nextActId = calendarData.next_activity.id;
    const updatedActivities = calendarData.activities.map((act) => {
      if (act.id === nextActId) {
        const nextStatus = act.is_completed ? 'UPCOMING' : 'COMPLETED';
        return {
          ...act,
          status: nextStatus,
          is_completed: !act.is_completed,
          completed_at: !act.is_completed ? new Date().toISOString() : null,
        };
      }
      return act;
    });

    // Find new next activity
    let newNext = null;
    for (const act of updatedActivities) {
      if (!act.is_completed) {
        newNext = act;
        break;
      }
    }
    if (!newNext && updatedActivities.length > 0) {
      newNext = updatedActivities[updatedActivities.length - 1];
    }

    const completedCount = updatedActivities.filter((a) => a.is_completed).length;
    const progressPct = Math.round((completedCount / Math.max(1, updatedActivities.length)) * 100);

    const updatedData = {
      ...calendarData,
      activities: updatedActivities,
      next_activity: newNext,
      completed_count: completedCount,
      progress_percentage: progressPct,
    };

    saveCalendarToStorage(userId, selectedFieldId, updatedData);
    setCalendarData(updatedData);

    // Broadcast update
    window.dispatchEvent(new CustomEvent('sanjeevani_calendar_updated'));
  };

  const activeField = fields.find((f) => f.id === selectedFieldId) || fields[0] || {};
  const nextAct = calendarData?.next_activity;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TODAY':
        return 'cc-status-badge cc-badge-today';
      case 'OVERDUE':
        return 'cc-status-badge cc-badge-overdue';
      case 'COMPLETED':
        return 'cc-status-badge cc-badge-completed';
      default:
        return 'cc-status-badge cc-badge-upcoming';
    }
  };

  return (
    <div className="crop-calendar-card-container">
      <div className="crop-calendar-card-header">
        <div className="crop-calendar-badge-group">
          <span className="crop-calendar-badge">
            <span className="live-dot" style={{ background: '#10b981' }}></span>
            {t('cc_badge') || 'PERSONALIZED CROP CALENDAR'}
          </span>
          <span className="crop-calendar-header-tag">
            {activeField.name || 'Field A'} — {activeField.crop || 'Wheat'}
          </span>
        </div>

        {/* Field Switcher Pill Tabs if multiple fields */}
        {fields.length > 1 && (
          <div className="crop-calendar-field-tabs" onClick={(e) => e.stopPropagation()}>
            {fields.map((f) => (
              <button
                key={f.id}
                className={`crop-calendar-field-pill ${selectedFieldId === f.id ? 'active' : ''}`}
                onClick={() => setSelectedFieldId(f.id)}
                type="button"
              >
                {f.name.split('(')[0].trim()}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="crop-calendar-loading">
          <div className="cc-spinner"></div>
          <span>Loading personalized schedule...</span>
        </div>
      ) : (
        <div className="crop-calendar-card-body">
          {/* Main NEXT ACTIVITY Banner */}
          <div className="crop-calendar-next-banner">
            <div className="cc-next-header-row">
              <div className="cc-next-title-group">
                <span className="cc-next-kicker" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CalendarClock size={13} strokeWidth={2} />
                  {t('cc_next_badge') || 'NEXT ACTIVITY'}
                </span>
                <h3 className="cc-next-activity-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#059669', display: 'inline-flex' }}>
                    {getActivityIcon(nextAct?.activity_name, nextAct?.icon, 18)}
                  </span>
                  <span>{nextAct?.activity_name || 'Crop Monitoring & Irrigation'}</span>
                </h3>
              </div>

              {nextAct && (
                <span className={getStatusBadgeClass(nextAct.status)}>
                  {nextAct.status === 'TODAY'
                    ? (t('cc_status_today') || 'TODAY')
                    : nextAct.status === 'OVERDUE'
                    ? (t('cc_status_overdue') || 'OVERDUE')
                    : nextAct.status === 'COMPLETED'
                    ? (t('cc_status_completed') || 'COMPLETED')
                    : (t('cc_status_upcoming') || 'UPCOMING')}
                </span>
              )}
            </div>

            <div className="cc-next-meta-grid">
              <div className="cc-meta-cell">
                <span className="cc-meta-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Wheat size={12} strokeWidth={2} />
                  {t('cc_current_stage') || 'Crop Stage'}
                </span>
                <span className="cc-meta-val">{nextAct?.crop_stage || activeField.cropStage || 'Vegetative'}</span>
              </div>
              <div className="cc-meta-cell">
                <span className="cc-meta-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} strokeWidth={2} />
                  {t('cc_due') || 'Due Date'}
                </span>
                <span className="cc-meta-val cc-due-val">
                  {nextAct?.due_label ? `${nextAct.due_label} (${nextAct.approximate_date})` : (nextAct?.approximate_date || 'Approximate')}
                </span>
              </div>
              <div className="cc-meta-cell">
                <span className="cc-meta-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Sprout size={12} strokeWidth={2} />
                  {t('cc_sowing_date') || 'Sowing Date'}
                </span>
                <span className="cc-meta-val">
                  {calendarData?.sowing_date_formatted || 'Approximate'} ({calendarData?.days_after_sowing || 0} DAS)
                </span>
              </div>
            </div>

            {nextAct?.notes && (
              <div className="cc-next-notes-preview" style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                <Lightbulb size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: '2px', color: '#b45309' }} />
                <span><strong>Note:</strong> {nextAct.notes}</span>
              </div>
            )}

            {/* Quick Action Button Bar */}
            <div className="cc-next-actions-row">
              {nextAct && (
                <button
                  type="button"
                  className={`cc-btn-quick-complete ${nextAct.is_completed ? 'completed' : ''}`}
                  onClick={handleQuickComplete}
                  title="Toggle Completion Status"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  {nextAct.is_completed ? (
                    <>
                      <RotateCcw size={13} strokeWidth={2} />
                      <span>{t('cc_reopen') || 'Reopen Task'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} strokeWidth={2.2} />
                      <span>{t('cc_mark_done') || 'Mark Complete'}</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                className="cc-btn-open-full"
                onClick={onOpenCalendar}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <CalendarDays size={14} strokeWidth={2} />
                <span>{t('cc_open_calendar') || 'View Full Crop Calendar'}</span>
                <ArrowRight size={13} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Lifecycle Micro-Timeline Preview */}
          <div className="crop-calendar-mini-timeline">
            <div className="cc-progress-header">
              <span className="cc-progress-title">
                Lifecycle Progress ({calendarData?.completed_count || 0}/{calendarData?.total_activities || 0} Tasks Done)
              </span>
              <span className="cc-progress-pct">{calendarData?.progress_percentage || 0}% Completed</span>
            </div>
            <div className="cc-progress-bar-track">
              <div
                className="cc-progress-bar-fill"
                style={{ width: `${calendarData?.progress_percentage || 0}%` }}
              ></div>
            </div>

            {/* Stage Nodes */}
            <div className="cc-stage-nodes-row">
              {calendarData?.activities?.slice(0, 6).map((act, index) => {
                const isCurrent = nextAct?.id === act.id;
                const isDone = act.is_completed;
                return (
                  <div
                    key={act.id}
                    className={`cc-timeline-step-node ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''}`}
                    title={`${act.crop_stage}: ${act.activity_name} (${act.approximate_date})`}
                    onClick={onOpenCalendar}
                  >
                    <span className="cc-step-icon">
                      {isDone ? (
                        <CheckCircle2 size={13} strokeWidth={2.4} color="#16a34a" />
                      ) : (
                        getActivityIcon(act.activity_name, act.icon, 13)
                      )}
                    </span>
                    <span className="cc-step-label">{act.crop_stage.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="crop-calendar-disclaimer-bar" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Info size={12} strokeWidth={2} style={{ flexShrink: 0 }} />
            <span>{calendarData?.disclaimer || t('cc_disclaimer')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
