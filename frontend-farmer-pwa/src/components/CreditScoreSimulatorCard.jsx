import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  FileText,
  FlaskConical,
  Camera,
  Check,
  ArrowRight,
  RotateCcw,
  Save,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const GOALS_STORAGE_KEY = 'agritrust_score_simulator_goals';
const EMPTY_ACTIONS = { pmfby: false, earlyRepay: false, mandiSlip: false, soilTest: false, gpsPhoto: false };

function loadSavedGoals() {
  try {
    const saved = JSON.parse(localStorage.getItem(GOALS_STORAGE_KEY));
    return { ...EMPTY_ACTIONS, ...(saved?.actions || {}) };
  } catch {
    return EMPTY_ACTIONS;
  }
}

export default function CreditScoreSimulatorCard({ onOpenPassport }) {
  const { t } = useTranslation();

  const BASE_SCORE = 78;
  const BASE_LIMIT = 165000;

  const [selectedActions, setSelectedActions] = useState(loadSavedGoals);

  const [toastMessage, setToastMessage] = useState(null);

  const actions = [
    { id: 'pmfby', labelKey: 'sim_act_pmfby', points: 8, limitBoost: 15000, icon: <ShieldCheck size={16} strokeWidth={2} style={{ color: '#059669' }} /> },
    { id: 'earlyRepay', labelKey: 'sim_act_early_repay', points: 6, limitBoost: 12000, icon: <Zap size={16} strokeWidth={2} style={{ color: '#d97706' }} /> },
    { id: 'mandiSlip', labelKey: 'sim_act_mandi_slip', points: 5, limitBoost: 20000, icon: <FileText size={16} strokeWidth={2} style={{ color: '#2563eb' }} /> },
    { id: 'soilTest', labelKey: 'sim_act_soil_test', points: 4, limitBoost: 10000, icon: <FlaskConical size={16} strokeWidth={2} style={{ color: '#7c3aed' }} /> },
    { id: 'gpsPhoto', labelKey: 'sim_act_gps_photo', points: 3, limitBoost: 5000, icon: <Camera size={16} strokeWidth={2} style={{ color: '#059669' }} /> },
  ];

  const toggleAction = (id) => {
    setSelectedActions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReset = () => {
    setSelectedActions(EMPTY_ACTIONS);
    localStorage.removeItem(GOALS_STORAGE_KEY);
    setToastMessage(null);
  };

  const handleSaveGoals = () => {
    const activeCount = Object.values(selectedActions).filter(Boolean).length;
    if (activeCount === 0) {
      setToastMessage({
        type: 'info',
        text: 'Select at least one booster action to set target goals.',
      });
    } else {
      try {
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify({
          actions: selectedActions,
          savedAt: new Date().toISOString(),
        }));
      } catch {
        setToastMessage({
          type: 'info',
          text: 'Your goals are ready, but this browser cannot save them offline.',
        });
        return;
      }
      setToastMessage({
        type: 'success',
        text: `🎯 ${activeCount} Target Milestones Saved! Progress will be tracked against your AgriTrust Sovereign rating.`,
      });
    }
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Calculate score & safe limit boosts
  let addedPoints = 0;
  let addedLimit = 0;

  actions.forEach((act) => {
    if (selectedActions[act.id]) {
      addedPoints += act.points;
      addedLimit += act.limitBoost;
    }
  });

  const simulatedScore = Math.min(100, BASE_SCORE + addedPoints);
  const simulatedLimit = BASE_LIMIT + addedLimit;

  // Format currency in Indian format
  const formatINR = (val) =>
    '₹' + val.toLocaleString('en-IN');

  // Gauge metrics
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const baseOffset = circumference - (BASE_SCORE / 100) * circumference;
  const simulatedOffset = circumference - (simulatedScore / 100) * circumference;

  return (
    <div className="agritrust-card simulator-card">
      {/* Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="card-feature-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
            <Zap size={20} strokeWidth={2} />
          </div>
          <div>
            <div className="card-category-label">{t('sim_category')}</div>
            <div className="card-title-main">{t('sim_title')}</div>
          </div>
        </div>

        <div className="status-badge-leaf" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <Sparkles size={12} strokeWidth={2.2} />
          <span>{addedPoints > 0 ? `+${addedPoints} pts boost` : 'Interactive'}</span>
        </div>
      </div>

      <div className="card-desc-paragraph" style={{ marginBottom: '16px' }}>
        {t('sim_subtitle')}
      </div>

      {/* Comparison Grid: Gauges & Numbers */}
      <div className="sim-comparison-wrapper">
        {/* Score Circular Gauge */}
        <div className="sim-gauge-column">
          <div className="score-circular-gauge-wrapper" style={{ width: '120px', height: '120px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', display: 'block' }}>
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="11"
              />
              {/* Base Score Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#13532f"
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={baseOffset}
                strokeLinecap="round"
              />
              {/* Added Booster Glow Track */}
              {addedPoints > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={simulatedOffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 0.6s ease',
                    filter: 'drop-shadow(0 0 4px #4ade80)',
                  }}
                />
              )}
            </svg>

            <div className="score-gauge-center-text" style={{ position: 'absolute', top: 0, left: 0, width: '120px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', margin: 0, padding: 0 }}>
              <span className="score-gauge-number" style={{ fontSize: '32px', fontWeight: 800, color: '#13532f', lineHeight: 1, margin: 0, padding: 0, textAlign: 'center' }}>
                {simulatedScore}
              </span>
              <span className="score-gauge-subtext" style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1, marginTop: '4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {addedPoints > 0 ? `(+${addedPoints} pts)` : t('ch_score_out_of')}
              </span>
            </div>
          </div>
          <div className="sim-gauge-caption">
            <span className="sim-old-val">{t('sim_current_score')} {BASE_SCORE}</span>
            <span className="sim-arrow-right"><ArrowRight size={11} strokeWidth={2} /></span>
            <span className="sim-new-val">{t('sim_projected_score')} {simulatedScore}</span>
          </div>
        </div>

        {/* Limit Impact Column */}
        <div className="sim-limit-column">
          <div className="sim-limit-box">
            <div className="sim-limit-sub">{t('sim_current_limit')}</div>
            <div className="sim-limit-val base-val">{formatINR(BASE_LIMIT)}</div>
          </div>

          <div className="sim-limit-arrow-center">Potential Limit Headroom</div>

          <div className="sim-limit-box boosted">
            <div className="sim-limit-sub">{t('sim_projected_limit')}</div>
            <div className="sim-limit-val boosted-val">
              {formatINR(simulatedLimit)}
              {addedLimit > 0 && (
                <span className="limit-diff-pill">+{formatINR(addedLimit)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Checkboxes List */}
      <div className="sim-actions-checklist">
        {actions.map((act) => {
          const isChecked = selectedActions[act.id];
          return (
            <div
              key={act.id}
              className={`sim-action-row ${isChecked ? 'selected' : ''}`}
              onClick={() => toggleAction(act.id)}
            >
              <div className="sim-action-checkbox">
                {isChecked ? <Check size={12} strokeWidth={2.4} /> : null}
              </div>
              <div className="sim-action-icon">{act.icon}</div>
              <div className="sim-action-text-box">
                <div className="sim-action-label">{t(act.labelKey)}</div>
                <div className="sim-action-sub">
                  +{formatINR(act.limitBoost)} borrowing capacity
                </div>
              </div>
              <div className="sim-action-badge">
                +{act.points} pts
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`sim-toast ${toastMessage.type}`}>
          {toastMessage.text}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="sim-card-actions-bar">
        <button className="sim-btn-reset" onClick={handleReset}>
          <RotateCcw size={13} strokeWidth={2} style={{ marginRight: '4px' }} />
          <span>{t('sim_reset_btn')}</span>
        </button>

        <button className="sim-btn-save" onClick={handleSaveGoals}>
          <Save size={13} strokeWidth={2} style={{ marginRight: '4px' }} />
          <span>{t('sim_save_goals')}</span>
        </button>

        {onOpenPassport && (
          <button className="sim-btn-passport" onClick={onOpenPassport}>
            <FileText size={13} strokeWidth={2} style={{ marginRight: '4px' }} />
            <span>{t('pass_btn_card')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
