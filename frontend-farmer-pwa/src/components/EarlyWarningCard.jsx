import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchEarlyWarnings } from '../services/api';
import {
  TriangleAlert,
  Wheat,
  MapPin,
  Flame,
  AlertCircle,
  ListFilter,
  RotateCcw,
  Sprout,
  Leaf,
  Clock,
  Search,
  Lightbulb,
  ShieldCheck,
  CheckCircle2,
  Zap,
} from 'lucide-react';

export default function EarlyWarningCard({ user }) {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [warningData, setWarningData] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('active'); // 'active' (HIGH + MEDIUM), 'all', 'high'

  // Default farmer parcels (aligned with Satellite Radar and Profile)
  const defaultFields = useMemo(() => [
    {
      id: 'field-a',
      name: 'Field A (Plot #184/A)',
      crop: user?.crop || 'Wheat (HD 3086)',
      crop_stage: 'Grain Filling',
      area: user?.acreage || '4.2 Acres',
      ndvi: 0.74,
      moisture: '22%',
    },
    {
      id: 'field-b',
      name: 'Field B (Plot #183)',
      crop: 'Mustard (Pusa Bold)',
      crop_stage: 'Pod Formation',
      area: '2.8 Acres',
      ndvi: 0.62,
      moisture: '18%',
    },
    {
      id: 'field-c',
      name: 'Field C (Plot #185)',
      crop: 'Sugarcane (Co 0238)',
      crop_stage: 'Grand Growth',
      area: '3.5 Acres',
      ndvi: 0.68,
      moisture: '26%',
    },
  ], [user]);

  const loadWarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEarlyWarnings({
        lat: 30.65,
        lon: 76.28,
        fieldId: selectedFieldId === 'all' ? null : selectedFieldId,
        fields: defaultFields,
      });

      if (res && res.success && res.data) {
        setWarningData(res.data);
      } else {
        setError(t('ew_error'));
      }
    } catch (err) {
      console.error('Error fetching farm warnings:', err);
      setError(t('ew_error'));
    } finally {
      setLoading(false);
    }
  }, [selectedFieldId, defaultFields, t]);

  useEffect(() => {
    loadWarnings();
  }, [loadWarnings]);

  // Filter warnings based on active selections
  const displayedWarnings = useMemo(() => {
    if (!warningData || !warningData.warnings) return [];

    let list = warningData.warnings;

    // Filter by field
    if (selectedFieldId !== 'all') {
      list = list.filter((w) => w.field_id === selectedFieldId);
    }

    // Filter by severity
    if (severityFilter === 'high') {
      list = list.filter((w) => w.level === 'HIGH');
    } else if (severityFilter === 'active') {
      // Prioritize High & Medium to avoid overwhelming the farmer with low-level routine items
      list = list.filter((w) => w.level === 'HIGH' || w.level === 'MEDIUM');
    }

    return list;
  }, [warningData, selectedFieldId, severityFilter]);

  // Risk Level Colors & Icons
  const getLevelBadge = (level) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: '#fef2f2',
          border: '#f87171',
          text: '#b91c1c',
          dot: '#ef4444',
          label: 'HIGH RISK',
          icon: <TriangleAlert size={16} strokeWidth={2.2} color="#b91c1c" />,
        };
      case 'MEDIUM':
        return {
          bg: '#fffbeb',
          border: '#fcd34d',
          text: '#b45309',
          dot: '#f59e0b',
          label: 'MEDIUM RISK',
          icon: <Zap size={16} strokeWidth={2.2} color="#b45309" />,
        };
      default:
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          text: '#15803d',
          dot: '#22c55e',
          label: 'LOW RISK',
          icon: <CheckCircle2 size={16} strokeWidth={2.2} color="#15803d" />,
        };
    }
  };

  return (
    <div className="agritrust-card early-warning-card" style={{ gap: '14px' }}>
      {/* 1. Header Bar */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="card-feature-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
            <TriangleAlert size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="card-category-label" style={{ color: '#b45309', letterSpacing: '0.06em' }}>
              {t('ew_badge')}
            </div>
            <div className="card-title-main" style={{ fontSize: '18px' }}>
              {t('ew_title')}
            </div>
          </div>
        </div>

        {warningData && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="sat-pulsing-dot"
              style={{
                backgroundColor:
                  warningData.high_count > 0 ? '#ef4444' : warningData.medium_count > 0 ? '#f59e0b' : '#22c55e',
              }}
            ></span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
              {warningData.high_count > 0
                ? `${warningData.high_count} Urgent`
                : warningData.medium_count > 0
                ? `${warningData.medium_count} Potential`
                : 'Favorable'}
            </span>
          </div>
        )}
      </div>

      {/* Subtitle / Purpose */}
      <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
        {t('ew_subtitle')}
      </div>

      {/* 2. Field Selector Tabs */}
      <div className="ew-field-tabs">
        <button
          className={`ew-tab-btn ${selectedFieldId === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFieldId('all')}
        >
          <Wheat size={13} strokeWidth={2} />
          <span>{t('ew_all_fields')} (3)</span>
        </button>
        {defaultFields.map((f) => (
          <button
            key={f.id}
            className={`ew-tab-btn ${selectedFieldId === f.id ? 'active' : ''}`}
            onClick={() => setSelectedFieldId(f.id)}
          >
            <MapPin size={12} strokeWidth={2} />
            <span>{f.name.split(' ')[0]} {f.name.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* 3. Severity Filter Pills */}
      <div className="ew-filter-bar">
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Filter:
          </span>
          <button
            className={`ew-pill-btn ${severityFilter === 'active' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('active')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Flame size={12} strokeWidth={2} />
            <span>Active Risks (High & Med)</span>
          </button>
          <button
            className={`ew-pill-btn ${severityFilter === 'high' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('high')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <AlertCircle size={12} strokeWidth={2} />
            <span>High Only ({warningData?.high_count ?? 0})</span>
          </button>
          <button
            className={`ew-pill-btn ${severityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('all')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ListFilter size={12} strokeWidth={2} />
            <span>All ({warningData?.total_risks_evaluated ?? 0})</span>
          </button>
        </div>
      </div>

      {/* 4. Loading State */}
      {loading && (
        <div className="weather-loading-container" style={{ padding: '36px 0' }}>
          <div className="weather-spinner"></div>
          <span className="weather-loading-text">{t('ew_loading')}</span>
        </div>
      )}

      {/* 5. Error State */}
      {!loading && error && (
        <div className="weather-error-container" style={{ padding: '24px 16px' }}>
          <TriangleAlert size={28} strokeWidth={2} color="#f59e0b" />
          <p className="weather-error-text">{error}</p>
          <button className="weather-retry-btn" onClick={loadWarnings} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <RotateCcw size={13} strokeWidth={2} />
            {t('ew_retry')}
          </button>
        </div>
      )}

      {/* 6. Empty State */}
      {!loading && !error && displayedWarnings.length === 0 && (
        <div className="ew-empty-box">
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#16a34a' }}>
            <Sprout size={28} strokeWidth={2.2} />
          </div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#166534', marginTop: '8px' }}>
            {t('ew_empty_title')}
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 10px' }}>
            {t('ew_empty_desc')}
          </p>
          {severityFilter !== 'all' && (
            <button className="ew-view-all-btn" onClick={() => setSeverityFilter('all')}>
              View All Low-Risk Evaluated Checks
            </button>
          )}
        </div>
      )}

      {/* 7. Warnings List (Prioritized HIGH -> MEDIUM -> LOW) */}
      {!loading && !error && displayedWarnings.length > 0 && (
        <div className="ew-warnings-list">
          {displayedWarnings.map((item, idx) => {
            const badge = getLevelBadge(item.level);
            return (
              <div
                key={`${item.field_id}_${item.risk_type}_${idx}`}
                className="ew-warning-card"
                style={{
                  borderLeft: `5px solid ${badge.dot}`,
                  backgroundColor: badge.bg,
                }}
              >
                {/* Warning Card Header */}
                <div className="ew-card-top-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center' }}>{badge.icon}</span>
                    <strong style={{ fontSize: '14px', color: badge.text, letterSpacing: '0.02em' }}>
                      {item.title.replace(/^[^\w\s]+/g, '').trim().toUpperCase()}
                    </strong>
                  </div>

                  <span
                    className="ew-level-badge"
                    style={{
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                      color: badge.text,
                    }}
                  >
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: badge.dot,
                        display: 'inline-block',
                      }}
                    ></span>
                    {item.level}
                  </span>
                </div>

                {/* Field & Crop Association */}
                <div className="ew-meta-chips">
                  <span className="ew-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={11} strokeWidth={2} />
                    <strong>{item.field_name}</strong>
                  </span>
                  <span className="ew-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Leaf size={11} strokeWidth={2} />
                    {item.crop} ({item.crop_stage})
                  </span>
                  {item.urgency && (
                    <span className="ew-chip urgency-chip" style={{ color: badge.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} strokeWidth={2} />
                      {item.urgency}
                    </span>
                  )}
                </div>

                {/* WHAT -> WHY -> WHEN -> ACTION Structure */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0 6px 0' }}>
                  {/* 1. WHAT */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      WHAT:
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginTop: '2px' }}>
                      {item.what || `Potential ${item.title.toLowerCase()} on ${item.crop} (${item.level} Risk)`}
                    </div>
                    {item.confidence && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Evaluated Confidence: <strong>{Math.round(item.confidence * 100)}%</strong> (Decision Support)
                      </div>
                    )}
                  </div>

                  {/* 2. WHY */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      WHY (Scientific & Environmental Cause):
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
                      {item.why || item.reason}
                    </div>
                  </div>

                  {/* 3. WHEN */}
                  <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '8px 12px', border: '1px solid #fef3c7' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      WHEN (Timeframe):
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#92400e', marginTop: '2px' }}>
                      {item.when || item.urgency || 'Immediate (within 24–48 hours)'}
                    </div>
                  </div>

                  {/* 4. ACTION */}
                  <div className="ew-action-block" style={{ marginTop: '0' }}>
                    <div className="ew-detail-label" style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lightbulb size={13} strokeWidth={2.2} />
                      <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACTION REQUIRED:</span>
                    </div>
                    <div className="ew-action-text" style={{ marginTop: '2px' }}>{item.action}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 8. Decision-Support Disclaimer Footnote */}
      <div className="card-footer-notice-box" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
          {t('ew_disclaimer')}
        </span>
      </div>
    </div>
  );
}
