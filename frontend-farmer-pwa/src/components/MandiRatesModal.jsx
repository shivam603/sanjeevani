import React, { useState, useEffect } from 'react';
import {
  Store,
  TrendingUp,
  TrendingDown,
  MapPin,
  Tag,
  Clock,
  Lightbulb,
  IndianRupee,
  X,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { fetchMandiPrices, calculateMandiRevenue } from '../services/api';

export default function MandiRatesModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [sortBy, setSortBy] = useState('highest');
  const [loading, setLoading] = useState(false);
  const [mandiData, setMandiData] = useState(null);
  const [yieldQuantity, setYieldQuantity] = useState('42');
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchMandiPrices({ crop: selectedCrop, state: 'Punjab', district: 'Ludhiana', sortBy })
      .then((res) => {
        if (res && res.data) {
          setMandiData(res.data);
          if (res.data.mandis && res.data.mandis.length > 0) {
            calculateMandiRevenue({
              crop: selectedCrop,
              quantityQuintals: parseFloat(yieldQuantity) || 42,
              mandiName: res.data.mandis[0].mandi_name,
              modalPrice: res.data.mandis[0].modal_price,
            }).then((rev) => {
              if (rev) setRevenueData(rev);
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, selectedCrop, sortBy]);

  useEffect(() => {
    if (!mandiData || !mandiData.mandis || mandiData.mandis.length === 0) return;
    const qty = parseFloat(yieldQuantity) || 0;
    if (qty <= 0) return;

    calculateMandiRevenue({
      crop: selectedCrop,
      quantityQuintals: qty,
      mandiName: mandiData.mandis[0].mandi_name,
      modalPrice: mandiData.mandis[0].modal_price,
    }).then((rev) => {
      if (rev) setRevenueData(rev);
    });
  }, [yieldQuantity, mandiData, selectedCrop]);

  if (!isOpen) return null;

  const crops = ['Wheat', 'Mustard', 'Gram (Chana)', 'Maize', 'Soybean', 'Cotton'];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={20} strokeWidth={2} style={{ color: '#059669' }} />
            <div className="modal-title">{t('mi_title')}</div>
          </div>
          <button className="modal-close-btn" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Real-time AGMARKNET comparison across Punjab & regional APMCs
          </p>
          <span className="mandi-datasource-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={12} strokeWidth={2} />
            <span>{mandiData?.data_source || 'Official AGMARKNET Feed (Govt of India)'}</span>
          </span>
        </div>

        {/* Crop Selection Chips */}
        <div className="mandi-crop-chips" style={{ margin: '12px 0 6px 0' }}>
          {crops.map((c) => (
            <button
              key={c}
              type="button"
              className={`mandi-crop-chip ${selectedCrop === c ? 'active-chip' : ''}`}
              onClick={() => setSelectedCrop(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="mandi-sort-toolbar" style={{ margin: '6px 0 12px 0' }}>
          <span className="mandi-sort-title">Sort:</span>
          <button
            type="button"
            className={`mandi-sort-btn ${sortBy === 'highest' ? 'active' : ''}`}
            onClick={() => setSortBy('highest')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <TrendingUp size={13} strokeWidth={2} />
            <span>{t('mi_sort_highest')}</span>
          </button>
          <button
            type="button"
            className={`mandi-sort-btn ${sortBy === 'lowest' ? 'active' : ''}`}
            onClick={() => setSortBy('lowest')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <TrendingDown size={13} strokeWidth={2} />
            <span>{t('mi_sort_lowest')}</span>
          </button>
          <button
            type="button"
            className={`mandi-sort-btn ${sortBy === 'nearest' ? 'active' : ''}`}
            onClick={() => setSortBy('nearest')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <MapPin size={13} strokeWidth={2} />
            <span>{t('mi_sort_nearest')}</span>
          </button>
        </div>

        {/* Loading / Mandi Table */}
        {loading ? (
          <div className="weather-loading-container" style={{ padding: '30px 0' }}>
            <div className="weather-spinner"></div>
            <span className="weather-loading-text">{t('mi_loading')}</span>
          </div>
        ) : mandiData && mandiData.mandis ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mandiData.mandis.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {m.mandi_name}
                    {m.distance_km && (
                      <span className="mandi-distance-badge">{m.distance_km} km</span>
                    )}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    Min: ₹{m.min_price} &bull; Max: ₹{m.max_price} &bull; Arrivals: {m.arrival_volume_qtl.toLocaleString('en-IN')} Qtl
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Clock size={11} strokeWidth={2} />
                    <span>{m.last_updated} ({m.price_date})</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#065f46' }}>
                    ₹{m.modal_price.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{m.unit}</span>
                </div>
              </div>
            ))}

            {/* Factual Market Insight */}
            {mandiData.market_insight && (
              <div className="mandi-insight-banner" style={{ marginTop: '6px' }}>
                <span className="mandi-insight-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Lightbulb size={13} strokeWidth={2} />
                  <span>{t('mi_insight_title')}:</span>
                </span>
                <p className="mandi-insight-text">{mandiData.market_insight}</p>
              </div>
            )}

            {/* Revenue Estimator in Modal */}
            <div className="mandi-revenue-calculator-box" style={{ marginTop: '8px' }}>
              <div className="mandi-calc-header-row">
                <span className="mandi-calc-title" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <IndianRupee size={15} strokeWidth={2} />
                  <span>{t('mi_revenue_title')}</span>
                </span>
              </div>
              <div className="mandi-calc-input-row">
                <div style={{ flex: 1 }}>
                  <label className="mandi-calc-label">{t('mi_quantity_label')} ({t('mi_qtl_unit')}):</label>
                  <input
                    type="number"
                    min="1"
                    className="mandi-calc-input"
                    value={yieldQuantity}
                    onChange={(e) => setYieldQuantity(e.target.value)}
                    placeholder="e.g. 42"
                  />
                </div>
                {revenueData && (
                  <div className="mandi-calc-result-box">
                    <span className="mandi-revenue-sublabel">{t('mi_est_revenue')}</span>
                    <div className="mandi-revenue-amount">{revenueData.formatted_revenue}</div>
                    <span className="mandi-formula-text">{revenueData.calculation_formula}</span>
                  </div>
                )}
              </div>
              <div className="mandi-calc-footnote">
                * {t('mi_est_note')}
              </div>
            </div>
          </div>
        ) : null}

        <button
          className="btn-consent-decline"
          onClick={onClose}
          style={{ alignSelf: 'flex-end', marginTop: '12px' }}
        >
          {t('modal_mandi_close')}
        </button>
      </div>
    </div>
  );
}
