import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchEarlyWarnings } from '../services/api';

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
          icon: '⚠️',
        };
      case 'MEDIUM':
        return {
          bg: '#fffbeb',
          border: '#fcd34d',
          text: '#b45309',
          dot: '#f59e0b',
          label: 'MEDIUM RISK',
          icon: '⚡',
        };
      default:
        return {
          bg: '#f0fdf4',
          border: '#86efac',
          text: '#15803d',
          dot: '#22c55e',
          label: 'LOW RISK',
          icon: '✅',
        };
    }
  };

  return (
    <div className="agritrust-card early-warning-card" style={{ gap: '14px' }}>
      {/* 1. Header Bar */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
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
          <span>🌾</span>
          <span>{t('ew_all_fields')} (3)</span>
        </button>
        {defaultFields.map((f) => (
          <button
            key={f.id}
            className={`ew-tab-btn ${selectedFieldId === f.id ? 'active' : ''}`}
            onClick={() => setSelectedFieldId(f.id)}
          >
            <span>📍</span>
            <span>{f.name.split(' ')[0]} {f.name.split(' ')[1]}</span>
          </button>
        ))}
      </div>

      {/* 3. Severity Filter Pills */}
      <div className="ew-filter-bar">
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Filter:
          </span>
          <button
            className={`ew-pill-btn ${severityFilter === 'active' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('active')}
          >
            🔥 Active Risks (High & Med)
          </button>
          <button
            className={`ew-pill-btn ${severityFilter === 'high' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('high')}
          >
            🔴 High Only ({warningData?.high_count ?? 0})
          </button>
          <button
            className={`ew-pill-btn ${severityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSeverityFilter('all')}
          >
            📋 All ({warningData?.total_risks_evaluated ?? 0})
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
          <span style={{ fontSize: '28px' }}>⚠️</span>
          <p className="weather-error-text">{error}</p>
          <button className="weather-retry-btn" onClick={loadWarnings}>
            🔄 {t('ew_retry')}
          </button>
        </div>
      )}

      {/* 6. Empty State */}
      {!loading && !error && displayedWarnings.length === 0 && (
        <div className="ew-empty-box">
          <span style={{ fontSize: '32px' }}>🌱</span>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#166534', marginTop: '6px' }}>
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
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <strong style={{ fontSize: '14px', color: badge.text, letterSpacing: '0.02em' }}>
                      {item.title.toUpperCase()}
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
                  <span className="ew-chip">
                    📍 <strong>{item.field_name}</strong>
                  </span>
                  <span className="ew-chip">
                    🌱 {item.crop} ({item.crop_stage})
                  </span>
                  {item.urgency && (
                    <span className="ew-chip urgency-chip" style={{ color: badge.text }}>
                      ⏱️ {item.urgency}
                    </span>
                  )}
                </div>

                {/* Reason (Agronomic Microclimate Cause) */}
                <div className="ew-detail-block">
                  <div className="ew-detail-label">
                    <span>🔍</span> {t('ew_reason_label')}:
                  </div>
                  <div className="ew-detail-text">{item.reason}</div>
                </div>

                {/* Recommended Action */}
                <div className="ew-action-block">
                  <div className="ew-detail-label" style={{ color: '#166534' }}>
                    <span>💡</span> {t('ew_action_label')}:
                  </div>
                  <div className="ew-action-text">{item.action}</div>
                </div>

                {/* Trigger Factors Mini Meter */}
                {item.metrics_trigger && (
                  <div className="ew-metrics-footer">
                    <span className="ew-metrics-title">{t('ew_metrics_label')}:</span>
                    {Object.entries(item.metrics_trigger).map(([k, val]) => (
                      <span key={k} className="ew-metric-pill">
                        {k.replace(/_/g, ' ')}: <strong>{String(val)}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 8. Decision-Support Disclaimer Footnote */}
      <div className="card-footer-notice-box" style={{ marginTop: '8px' }}>
        <span style={{ fontSize: '14px' }}>🛡️</span>
        <span style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.35 }}>
          {t('ew_disclaimer')}
        </span>
      </div>
    </div>
  );
}
