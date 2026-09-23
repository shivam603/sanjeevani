import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchMandiFilters, fetchMandiPrices, calculateMandiRevenue } from '../services/api';

export default function KhannaMandiCard({ onOpenMandiModal, user }) {
  const { t } = useTranslation();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(null);

  // Selected filters
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedState, setSelectedState] = useState('Punjab');
  const [selectedDistrict, setSelectedDistrict] = useState('Ludhiana');
  const [sortBy, setSortBy] = useState('highest'); // 'highest' | 'lowest' | 'nearest' | 'recent'

  // Mandi records & insights
  const [mandiData, setMandiData] = useState(null);

  // Estimated Revenue calculator state
  const [expectedQuantity, setExpectedQuantity] = useState('42'); // default ~42 quintals for 4.2 acres
  const [selectedMandiName, setSelectedMandiName] = useState('');
  const [revenueResult, setRevenueResult] = useState(null);

  // Load available filters on mount
  useEffect(() => {
    let mounted = true;
    fetchMandiFilters().then((f) => {
      if (mounted && f) {
        setFilters(f);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch prices based on selection
  const loadPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMandiPrices({
        crop: selectedCrop,
        state: selectedState,
        district: selectedDistrict,
        sortBy,
      });

      if (res && res.data && res.data.mandis) {
        setMandiData(res.data);
        if (res.data.mandis.length > 0) {
          setSelectedMandiName((prev) => prev || res.data.mandis[0].mandi_name);
        }
      } else {
        setError('No mandi records found.');
      }
    } catch (err) {
      console.error('Failed to load mandi prices:', err);
      setError('Unable to load market information.');
    } finally {
      setLoading(false);
    }
  }, [selectedCrop, selectedState, selectedDistrict, sortBy]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  // Recalculate estimated revenue whenever quantity, selected mandi, or price changes
  useEffect(() => {
    if (!mandiData || !mandiData.mandis || mandiData.mandis.length === 0) return;

    const targetMandi = mandiData.mandis.find((m) => m.mandi_name === selectedMandiName) || mandiData.mandis[0];
    if (!targetMandi) return;

    const qty = parseFloat(expectedQuantity) || 0;
    if (qty <= 0) {
      setRevenueResult(null);
      return;
    }

    calculateMandiRevenue({
      crop: selectedCrop,
      quantityQuintals: qty,
      mandiName: targetMandi.mandi_name,
      modalPrice: targetMandi.modal_price,
    }).then((res) => {
      if (res) setRevenueResult(res);
    });
  }, [expectedQuantity, selectedMandiName, mandiData, selectedCrop]);

  const cropsList = filters?.crops || ['Wheat', 'Mustard', 'Gram (Chana)', 'Maize', 'Soybean', 'Cotton', 'Onion'];
  const statesList = filters?.states ? Object.keys(filters.states) : ['Punjab', 'Maharashtra', 'Haryana'];
  const districtsList = filters?.states && filters.states[selectedState]?.districts
    ? filters.states[selectedState].districts
    : ['Ludhiana', 'Patiala', 'Bathinda'];

  return (
    <div className="agritrust-card mandi-intelligence-card" style={{ gap: '14px' }}>
      {/* 1. Header Line: Badge + Demo/Live Label */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>💰</span>
          <span className="card-category-label">{t('mi_badge')}</span>
        </div>

        <span className="mandi-datasource-badge">
          {mandiData?.data_source === 'Live AGMARKNET Feed' ? '🟢 ' + t('mi_live_badge') : '🏷️ ' + t('mi_demo_badge')}
        </span>
      </div>

      {/* 2. Crop Selector Chips (Horizontal Scrollable) */}
      <div className="mandi-crop-selector-row">
        <span className="mandi-selector-prefix">🌾 {t('mi_crop_label')}:</span>
        <div className="mandi-crop-chips">
          {cropsList.map((c) => (
            <button
              key={c}
              type="button"
              className={`mandi-crop-chip ${selectedCrop.toLowerCase() === c.toLowerCase() ? 'active-chip' : ''}`}
              onClick={() => setSelectedCrop(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Location Selectors: State & District */}
      <div className="mandi-location-row">
        <div className="mandi-select-group">
          <label className="mandi-select-label">📍 {t('mi_state_label')}</label>
          <select
            className="mandi-select-dropdown"
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value;
              setSelectedState(newState);
              const availableDistricts = filters?.states?.[newState]?.districts || [];
              if (availableDistricts.length > 0) {
                setSelectedDistrict(availableDistricts[0]);
              }
            }}
          >
            {statesList.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="mandi-select-group">
          <label className="mandi-select-label">🏢 {t('mi_district_label')}</label>
          <select
            className="mandi-select-dropdown"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            {districtsList.map((dst) => (
              <option key={dst} value={dst}>
                {dst}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Sorting & Filter Toolbar */}
      <div className="mandi-sort-toolbar">
        <span className="mandi-sort-title">Sort:</span>
        <button
          type="button"
          className={`mandi-sort-btn ${sortBy === 'highest' ? 'active' : ''}`}
          onClick={() => setSortBy('highest')}
        >
          ⬆️ {t('mi_sort_highest')}
        </button>
        <button
          type="button"
          className={`mandi-sort-btn ${sortBy === 'lowest' ? 'active' : ''}`}
          onClick={() => setSortBy('lowest')}
        >
          ⬇️ {t('mi_sort_lowest')}
        </button>
        <button
          type="button"
          className={`mandi-sort-btn ${sortBy === 'nearest' ? 'active' : ''}`}
          onClick={() => setSortBy('nearest')}
        >
          📍 {t('mi_sort_nearest')}
        </button>
        <button
          type="button"
          className={`mandi-sort-btn ${sortBy === 'recent' ? 'active' : ''}`}
          onClick={() => setSortBy('recent')}
        >
          ⏱️ {t('mi_sort_recent')}
        </button>
      </div>

      {/* 5. Loading / Error / Empty States */}
      {loading ? (
        <div className="weather-loading-container" style={{ padding: '24px 0' }}>
          <div className="weather-spinner"></div>
          <span className="weather-loading-text">{t('mi_loading')}</span>
        </div>
      ) : error ? (
        <div className="weather-error-container" style={{ padding: '20px 0' }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <p className="weather-error-text">{t('mi_error')}</p>
          <button className="weather-retry-btn" onClick={loadPrices}>
            🔄 {t('mi_retry')}
          </button>
        </div>
      ) : !mandiData || mandiData.mandis.length === 0 ? (
        <div className="weather-loading-container" style={{ padding: '20px 0' }}>
          <span style={{ fontSize: '20px' }}>📦</span>
          <span className="weather-loading-text">{t('mi_empty')}</span>
        </div>
      ) : (
        <>
          {/* 6. Mandi Price Comparison List */}
          <div className="mandi-comparison-list">
            {mandiData.mandis.slice(0, 3).map((m, idx) => {
              const isSelected = (selectedMandiName || mandiData.mandis[0].mandi_name) === m.mandi_name;
              return (
                <div
                  key={m.mandi_name + idx}
                  className={`mandi-item-card ${isSelected ? 'selected-mandi' : ''}`}
                  onClick={() => setSelectedMandiName(m.mandi_name)}
                >
                  <div className="mandi-item-left">
                    <div className="mandi-item-title-row">
                      <span className="mandi-item-name">{m.mandi_name}</span>
                      {m.distance_km && (
                        <span className="mandi-distance-badge">📍 {m.distance_km} km</span>
                      )}
                      {m.is_most_recent && (
                        <span className="mandi-recent-badge">✓ Latest</span>
                      )}
                    </div>

                    <div className="mandi-range-subtext">
                      Min: ₹{m.min_price.toLocaleString('en-IN')} &bull; Max: ₹{m.max_price.toLocaleString('en-IN')}
                    </div>
                    <div className="mandi-updated-time">
                      ⏱️ {m.last_updated} &bull; Arrivals: {m.arrival_volume_qtl.toLocaleString('en-IN')} Qtl
                    </div>
                  </div>

                  <div className="mandi-item-right">
                    <div className="mandi-modal-price">
                      ₹{m.modal_price.toLocaleString('en-IN')}
                    </div>
                    <span className="mandi-unit-label">{m.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 7. Market Insight Banner (Factual Comparison) */}
          {mandiData.market_insight && (
            <div className="mandi-insight-banner">
              <span className="mandi-insight-tag">💡 {t('mi_insight_title')}:</span>
              <p className="mandi-insight-text">{mandiData.market_insight}</p>
            </div>
          )}

          {/* 8. Estimated Gross Revenue Calculator */}
          <div className="mandi-revenue-calculator-box">
            <div className="mandi-calc-header-row">
              <span className="mandi-calc-title">💵 {t('mi_revenue_title')}</span>
              <span className="mandi-calc-target-mandi">
                Selected: <strong>{selectedMandiName || mandiData.mandis[0].mandi_name}</strong>
              </span>
            </div>

            <div className="mandi-calc-input-row">
              <div style={{ flex: 1 }}>
                <label className="mandi-calc-label">{t('mi_quantity_label')} ({t('mi_qtl_unit')}):</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  className="mandi-calc-input"
                  value={expectedQuantity}
                  onChange={(e) => setExpectedQuantity(e.target.value)}
                  placeholder="e.g. 42"
                />
              </div>

              {revenueResult && (
                <div className="mandi-calc-result-box">
                  <span className="mandi-revenue-sublabel">{t('mi_est_revenue')}</span>
                  <div className="mandi-revenue-amount">{revenueResult.formatted_revenue}</div>
                  <span className="mandi-formula-text">{revenueResult.calculation_formula}</span>
                </div>
              )}
            </div>

            <div className="mandi-calc-footnote">
              * {t('mi_est_note')}
            </div>
          </div>
        </>
      )}

      {/* 9. Footer Action Link: Open Full Comparison Modal */}
      <div className="mandi-card-footer-row" style={{ paddingTop: '4px' }}>
        <span style={{ fontSize: '11px', color: '#64748b' }}>
          Comparing {mandiData?.total_mandis || 4} regional markets in {selectedDistrict}
        </span>
        <button
          type="button"
          onClick={onOpenMandiModal}
          className="mandi-view-all-btn"
        >
          {t('km_btn')}
        </button>
      </div>
    </div>
  );
}
