import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  CalendarClock,
  Wheat,
  Sprout,
  Droplets,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  Check,
  Clock,
  FileText,
  RotateCcw,
  ArrowRight,
  Info,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import {
  generateCropSchedule,
  loadSavedCalendar,
  saveCalendarToStorage,
  CROP_TEMPLATES,
} from '../services/calendarEngine';

function getActivityIcon(act) {
  const text = `${act?.activity_name || ''} ${act?.crop_stage || ''}`.toLowerCase();
  if (text.includes('irrigation') || text.includes('water')) {
    return <Droplets size={14} strokeWidth={2} style={{ color: '#0284c7' }} />;
  }
  if (text.includes('harvest')) {
    return <Wheat size={14} strokeWidth={2} style={{ color: '#d97706' }} />;
  }
  if (text.includes('fertilizer') || text.includes('urea') || text.includes('nutrient') || text.includes('spray')) {
    return <FlaskConical size={14} strokeWidth={2} style={{ color: '#7c3aed' }} />;
  }
  if (text.includes('weed') || text.includes('protection') || text.includes('disease') || text.includes('fungicide')) {
    return <ShieldCheck size={14} strokeWidth={2} style={{ color: '#059669' }} />;
  }
  return <Sprout size={14} strokeWidth={2} style={{ color: '#15803d' }} />;
}

export default function CropCalendarModal({ isOpen, onClose, user }) {
  const { t } = useTranslation();
  const userId = user?.id || 'ramesh_patel';

  // 1. Fields & Selection
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState('field-184a');

  // 2. Calendar Data & Editing State
  const [calendarData, setCalendarData] = useState(null);
  const [sowingDateInput, setSowingDateInput] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Wheat (HD 3086)');
  const [activeTab, setActiveTab] = useState('active'); // 'all' | 'active' | 'completed'

  // 3. Sub-modal / Inline Action State
  const [editingNoteActId, setEditingNoteActId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [reschedulingActId, setReschedulingActId] = useState(null);
  const [rescheduleDateDraft, setRescheduleDateDraft] = useState('');

  // Load fields on open
  useEffect(() => {
    if (!isOpen) return;

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

    const defaults = [
      {
        id: 'field-184a',
        name: 'Field A (Plot #184/A - Main)',
        crop: user?.crop || 'Wheat (HD 3086)',
        cropStage: 'Grain Filling',
        area: user?.acreage || '4.2 Acres',
      },
      {
        id: 'field-183',
        name: 'Field B (Plot #183 - North)',
        crop: 'Mustard (Pusa Bold)',
        cropStage: 'Pod Formation',
        area: '2.8 Acres',
      },
      {
        id: 'field-185',
        name: 'Field C (Plot #185 - South)',
        crop: 'Sugarcane (Co 0238)',
        cropStage: 'Grand Growth',
        area: '3.5 Acres',
      },
    ];
    setFields(defaults);
    setSelectedFieldId(defaults[0].id);
  }, [isOpen, userId, user?.crop, user?.acreage]);

  // Load or generate calendar when selected field changes
  const loadFieldCalendar = useCallback(() => {
    if (!selectedFieldId || fields.length === 0) return;

    const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];
    const cropToUse = currentField.crop || 'Wheat (HD 3086)';
    setSelectedCrop(cropToUse);

    const saved = loadSavedCalendar(userId, selectedFieldId);
    if (saved && saved.activities) {
      setCalendarData(saved);
      setSowingDateInput(saved.sowing_date || '');
    } else {
      const fresh = generateCropSchedule({
        crop: cropToUse,
        fieldName: currentField.name,
        currentStage: currentField.cropStage || 'Vegetative',
      });
      saveCalendarToStorage(userId, selectedFieldId, fresh);
      setCalendarData(fresh);
      setSowingDateInput(fresh.sowing_date);
    }
  }, [selectedFieldId, fields, userId]);

  useEffect(() => {
    if (isOpen) {
      loadFieldCalendar();
    }
  }, [isOpen, loadFieldCalendar]);

  // Handle Sowing Date Change (Recalculates timeline)
  const handleSowingDateChange = (newDateStr) => {
    if (!newDateStr) return;
    setSowingDateInput(newDateStr);

    const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];
    const fresh = generateCropSchedule({
      crop: selectedCrop,
      fieldName: currentField.name,
      currentStage: currentField.cropStage || 'Vegetative',
      sowingDateStr: newDateStr,
    });

    // If user already had custom notes or completed statuses, preserve them where matching
    if (calendarData && calendarData.activities) {
      const oldMap = new Map(calendarData.activities.map((a) => [a.id, a]));
      fresh.activities = fresh.activities.map((a) => {
        const old = oldMap.get(a.id);
        if (old) {
          return {
            ...a,
            is_completed: old.is_completed,
            status: old.is_completed ? 'COMPLETED' : a.status,
            notes: old.notes || a.notes,
            completed_at: old.completed_at,
          };
        }
        return a;
      });
      fresh.completed_count = fresh.activities.filter((a) => a.is_completed).length;
      fresh.progress_percentage = Math.round(
        (fresh.completed_count / Math.max(1, fresh.activities.length)) * 100
      );
    }

    saveCalendarToStorage(userId, selectedFieldId, fresh);
    setCalendarData(fresh);
    window.dispatchEvent(new CustomEvent('sanjeevani_calendar_updated'));
  };

  // Handle Crop Change
  const handleCropChange = (newCrop) => {
    setSelectedCrop(newCrop);
    const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];
    const fresh = generateCropSchedule({
      crop: newCrop,
      fieldName: currentField.name,
      sowingDateStr: sowingDateInput || null,
    });
    saveCalendarToStorage(userId, selectedFieldId, fresh);
    setCalendarData(fresh);
    window.dispatchEvent(new CustomEvent('sanjeevani_calendar_updated'));
  };

  // Toggle Activity Completion Status
  const handleToggleComplete = (actId) => {
    if (!calendarData) return;

    const updatedActivities = calendarData.activities.map((act) => {
      if (act.id === actId) {
        const newCompleted = !act.is_completed;
        return {
          ...act,
          is_completed: newCompleted,
          status: newCompleted ? 'COMPLETED' : 'UPCOMING',
          completed_at: newCompleted ? new Date().toISOString() : null,
        };
      }
      return act;
    });

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

    const updated = {
      ...calendarData,
      activities: updatedActivities,
      next_activity: newNext,
      completed_count: completedCount,
      progress_percentage: progressPct,
    };

    saveCalendarToStorage(userId, selectedFieldId, updated);
    setCalendarData(updated);
    window.dispatchEvent(new CustomEvent('sanjeevani_calendar_updated'));
  };

  // Note Action
  const handleOpenAddNote = (act) => {
    setEditingNoteActId(act.id);
    setNoteDraft(act.notes || '');
  };

  const handleSaveNote = () => {
    if (!editingNoteActId || !calendarData) return;

    const updatedActivities = calendarData.activities.map((act) => {
      if (act.id === editingNoteActId) {
        return { ...act, notes: noteDraft };
      }
      return act;
    });

    const updated = { ...calendarData, activities: updatedActivities };
    saveCalendarToStorage(userId, selectedFieldId, updated);
    setCalendarData(updated);
    setEditingNoteActId(null);
    setNoteDraft('');
    window.dispatchEvent(new CustomEvent('sanjeevani_calendar_updated'));
  };

  // Reschedule Action
  const handleOpenReschedule = (act) => {
    setReschedulingActId(act.id);
    setRescheduleDateDraft(act.raw_date || '');
  };

  const handleSaveReschedule = () => {
    if (!reschedulingActId || !rescheduleDateDraft || !calendarData) return;

    const targetDate = new Date(rescheduleDateDraft);
    targetDate.setHours(0, 0, 0, 0);

    const formattedDate = targetDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let dueLabel = '';
    if (diffDays === 0) dueLabel = 'Due Today';
    else if (diffDays === 1) dueLabel = 'Due Tomorrow';
    else if (diffDays > 1) dueLabel = `Due in ${diffDays} days`;
    else if (diffDays === -1) dueLabel = '1 day overdue';
    else dueLabel = `${Math.abs(diffDays)} days overdue`;

    let status = 'UPCOMING';
    if (diffDays < -3) status = 'COMPLETED';
    else if (diffDays >= -3 && diffDays < 0) status = 'OVERDUE';
    else if (diffDays === 0) status = 'TODAY';

    const updatedActivities = calendarData.activities.map((act) => {
      if (act.id === reschedulingActId) {
        return {
          ...act,
          raw_date: rescheduleDateDraft,
          approximate_date: `Estimated: ${formattedDate}`,
          due_label: dueLabel,
          status: act.is_completed ? 'COMPLETED' : status,
        };
      }
      return act;
    });

    const updated = { ...calendarData, activities: updatedActivities };
    saveCalendarToStorage(userId, selectedFieldId, updated);
    setCalendarData(updated);
    setReschedulingActId(null);
    setRescheduleDateDraft('');
    window.dispatchEvent(new CustomEvent('sanjeevani_calendar_updated'));
  };

  if (!isOpen) return null;

  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0] || {};

  // Filter activities based on tab
  const filteredActivities = (calendarData?.activities || []).filter((act) => {
    if (activeTab === 'completed') return act.is_completed;
    if (activeTab === 'active') return !act.is_completed;
    return true; // 'all'
  });

  const getStatusBadge = (act) => {
    if (act.is_completed) {
      return <span className="cc-status-badge cc-badge-completed">{t('cc_status_completed') || 'COMPLETED'}</span>;
    }
    if (act.status === 'TODAY') {
      return <span className="cc-status-badge cc-badge-today">{t('cc_status_today') || 'TODAY'}</span>;
    }
    if (act.status === 'OVERDUE') {
      return <span className="cc-status-badge cc-badge-overdue">{t('cc_status_overdue') || 'OVERDUE'}</span>;
    }
    return <span className="cc-status-badge cc-badge-upcoming">{t('cc_status_upcoming') || 'UPCOMING'}</span>;
  };

  return (
    <div className="cc-modal-overlay" onClick={onClose}>
      <div className="cc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="cc-modal-header">
          <div className="cc-modal-title-group">
            <span className="cc-modal-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sprout size={13} strokeWidth={2.2} />
              <span>{t('cc_badge') || 'PERSONALIZED CROP CALENDAR'}</span>
            </span>
            <h2 className="cc-modal-title">{t('cc_title') || 'Crop Lifecycle Timeline & Activities'}</h2>
            <p className="cc-modal-subtitle">
              {t('cc_subtitle') || 'Personalized to your field, crop, sowing date, and growth stage.'}
            </p>
          </div>
          <button type="button" className="cc-modal-close-btn" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* FLOW CONTROLS BAR: FIELD -> CROP -> SOWING DATE -> CROP STAGES */}
        <div className="cc-flow-strip">
          {/* 1. FIELD SELECTOR */}
          <div className="cc-flow-item">
            <label className="cc-flow-label">1. Field</label>
            <select
              className="cc-flow-select"
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.area || 'Plot'})
                </option>
              ))}
            </select>
          </div>

          <div className="cc-flow-arrow"><ArrowRight size={14} strokeWidth={2} /></div>

          {/* 2. CROP SELECTOR */}
          <div className="cc-flow-item">
            <label className="cc-flow-label">2. Crop</label>
            <select
              className="cc-flow-select"
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value)}
            >
              <option value="Wheat (HD 3086)">Wheat (HD 3086)</option>
              <option value="Mustard (Pusa Bold)">Mustard (Pusa Bold)</option>
              <option value="Rice (Pusa 1121)">Rice / Paddy</option>
              <option value="Sugarcane (Co 0238)">Sugarcane</option>
              <option value="Gram / Chana">Chickpea / Gram</option>
            </select>
          </div>

          <div className="cc-flow-arrow"><ArrowRight size={14} strokeWidth={2} /></div>

          {/* 3. SOWING DATE PICKER */}
          <div className="cc-flow-item">
            <label className="cc-flow-label">3. Sowing Date (Estimated)</label>
            <input
              type="date"
              className="cc-flow-input-date"
              value={sowingDateInput}
              onChange={(e) => handleSowingDateChange(e.target.value)}
            />
          </div>

          <div className="cc-flow-arrow"><ArrowRight size={14} strokeWidth={2} /></div>

          {/* 4. CURRENT STAGE DISPLAY */}
          <div className="cc-flow-item">
            <label className="cc-flow-label">4. Current Stage</label>
            <span className="cc-flow-badge-stage">
              {calendarData?.current_stage || currentField.cropStage || 'Vegetative'}
              <span className="cc-das-tag">({calendarData?.days_after_sowing || 0} DAS)</span>
            </span>
          </div>
        </div>

        {/* CROP LIFECYCLE TIMELINE VISUALIZATION */}
        <div className="cc-lifecycle-timeline-box">
          <div className="cc-timeline-banner">
            <span className="cc-timeline-heading" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Wheat size={16} strokeWidth={2} style={{ color: '#059669' }} />
              <span>Crop Growth Lifecycle Stage Pathway</span>
            </span>
            <span className="cc-timeline-stat">
              {calendarData?.completed_count || 0} of {calendarData?.total_activities || 0} stages completed (
              {calendarData?.progress_percentage || 0}%)
            </span>
          </div>

          {/* Graphical Pipeline Steps */}
          <div className="cc-stages-pipeline">
            {calendarData?.activities?.map((act, index) => {
              const isNext = calendarData?.next_activity?.id === act.id;
              const isCompleted = act.is_completed;

              return (
                <React.Fragment key={act.id}>
                  <div
                    className={`cc-pipeline-step ${isCompleted ? 'step-completed' : ''} ${isNext ? 'step-current' : ''}`}
                    title={`${act.crop_stage} — ${act.activity_name}`}
                  >
                    <div className="cc-step-bubble" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isCompleted ? <Check size={14} strokeWidth={2.5} /> : getActivityIcon(act)}
                    </div>
                    <div className="cc-step-details">
                      <span className="cc-step-name">{act.crop_stage}</span>
                      <span className="cc-step-sub">{act.approximate_date}</span>
                    </div>
                  </div>
                  {index < calendarData.activities.length - 1 && (
                    <div className={`cc-pipeline-connector ${isCompleted ? 'connector-done' : ''}`}>
                      <ArrowRight size={12} strokeWidth={2} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ACTIVITIES & TASKS SECTION */}
        <div className="cc-activities-section">
          <div className="cc-activities-toolbar">
            <div className="cc-filter-tabs">
              <button
                type="button"
                className={`cc-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                {t('cc_tab_active') || 'Active & Upcoming'} (
                {(calendarData?.activities || []).filter((a) => !a.is_completed).length})
              </button>
              <button
                type="button"
                className={`cc-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                {t('cc_tab_completed') || 'Completed History'} (
                {calendarData?.completed_count || 0})
              </button>
              <button
                type="button"
                className={`cc-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Activities ({calendarData?.total_activities || 0})
              </button>
            </div>

            <div className="cc-activities-meta">
              <span className="cc-approx-note" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Info size={13} strokeWidth={2} />
                <span>All timing dates are <strong>Estimated / Approximate</strong>.</span>
              </span>
            </div>
          </div>

          {/* Activities List */}
          <div className="cc-activities-list">
            {filteredActivities.length === 0 ? (
              <div className="cc-empty-activities">
                <span>No {activeTab} activities for this view.</span>
              </div>
            ) : (
              filteredActivities.map((act) => {
                const isEditingNote = editingNoteActId === act.id;
                const isRescheduling = reschedulingActId === act.id;

                return (
                  <div
                    key={act.id}
                    className={`cc-activity-card ${act.is_completed ? 'act-completed' : ''} ${
                      act.status === 'TODAY' ? 'act-today' : ''
                    } ${act.status === 'OVERDUE' ? 'act-overdue' : ''}`}
                  >
                    <div className="cc-act-left">
                      <div className="cc-act-check-col">
                        <button
                          type="button"
                          className={`cc-act-checkbox ${act.is_completed ? 'checked' : ''}`}
                          onClick={() => handleToggleComplete(act.id)}
                          title={act.is_completed ? 'Mark as Incomplete' : 'Mark as Completed'}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {act.is_completed ? <Check size={12} strokeWidth={2.4} /> : ''}
                        </button>
                      </div>

                      <div className="cc-act-body">
                        <div className="cc-act-header-row">
                          <span className="cc-act-icon">{getActivityIcon(act)}</span>
                          <h4 className="cc-act-title">{act.activity_name}</h4>
                          <span className="cc-act-stage-pill">{act.crop_stage}</span>
                          {getStatusBadge(act)}
                        </div>

                        <div className="cc-act-timing-row">
                          <span className="cc-act-date-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarDays size={12} strokeWidth={2} />
                            <span>{act.approximate_date}</span>
                          </span>
                          {act.due_label && (
                            <span className="cc-act-due-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} strokeWidth={2} />
                              <span>{act.due_label}</span>
                            </span>
                          )}
                          <span className="cc-act-das-pill">
                            {act.days_after_sowing} Days After Sowing
                          </span>
                        </div>

                        {/* Note Section */}
                        {act.notes && !isEditingNote && (
                          <div className="cc-act-notes-box">
                            <span className="cc-note-prefix" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <FileText size={12} strokeWidth={2} />
                              <span>Field Note:</span>
                            </span> {act.notes}
                          </div>
                        )}

                        {/* Inline Note Editor */}
                        {isEditingNote && (
                          <div className="cc-inline-note-editor">
                            <textarea
                              className="cc-note-textarea"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder={t('cc_note_placeholder') || 'Enter fertilizer, inspection details or observations...'}
                              rows={2}
                            />
                            <div className="cc-note-actions">
                              <button
                                type="button"
                                className="cc-btn-note-save"
                                onClick={handleSaveNote}
                              >
                                {t('cc_save_note_btn') || 'Save Note'}
                              </button>
                              <button
                                type="button"
                                className="cc-btn-note-cancel"
                                onClick={() => setEditingNoteActId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Inline Reschedule Editor */}
                        {isRescheduling && (
                          <div className="cc-inline-reschedule-editor">
                            <label className="cc-reschedule-label">
                              {t('cc_new_date_label') || 'Select Rescheduled Date (Approximate):'}
                            </label>
                            <div className="cc-reschedule-controls">
                              <input
                                type="date"
                                className="cc-reschedule-input"
                                value={rescheduleDateDraft}
                                onChange={(e) => setRescheduleDateDraft(e.target.value)}
                              />
                              <button
                                type="button"
                                className="cc-btn-reschedule-save"
                                onClick={handleSaveReschedule}
                              >
                                {t('cc_reschedule_btn') || 'Save New Date'}
                              </button>
                              <button
                                type="button"
                                className="cc-btn-reschedule-cancel"
                                onClick={() => setReschedulingActId(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Farmer Action Buttons */}
                    <div className="cc-act-actions">
                      <button
                        type="button"
                        className="cc-action-btn cc-btn-note"
                        onClick={() => handleOpenAddNote(act)}
                        title="Add or Edit Task Note"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={12} strokeWidth={2} />
                        <span>{act.notes ? 'Edit Note' : 'Add Note'}</span>
                      </button>

                      {!act.is_completed && (
                        <button
                          type="button"
                          className="cc-action-btn cc-btn-reschedule"
                          onClick={() => handleOpenReschedule(act)}
                          title="Reschedule approximate activity date"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CalendarClock size={12} strokeWidth={2} />
                          <span>Reschedule</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className={`cc-action-btn cc-btn-status-toggle ${act.is_completed ? 'completed' : ''}`}
                        onClick={() => handleToggleComplete(act.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {act.is_completed ? (
                          <>
                            <RotateCcw size={12} strokeWidth={2} />
                            <span>{t('cc_reopen') || 'Reopen'}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} strokeWidth={2} />
                            <span>{t('cc_mark_done') || 'Mark Done'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="cc-modal-footer">
          <div className="cc-footer-disclaimer" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={13} strokeWidth={2} style={{ color: '#d97706', flexShrink: 0 }} />
            <span>{calendarData?.disclaimer || t('cc_disclaimer')}</span>
          </div>
          <button type="button" className="cc-btn-modal-close" onClick={onClose}>
            {t('fm_close') || 'Close Calendar'}
          </button>
        </div>
      </div>
    </div>
  );
}
