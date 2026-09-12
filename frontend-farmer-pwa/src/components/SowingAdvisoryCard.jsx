import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function SowingAdvisoryCard() {
  const { t } = useTranslation();

  const days = [
    { day: t('day_wed'), icon: '☀️', temp: '26°' },
    { day: t('day_thu'), icon: '☀️', temp: '27°' },
    { day: t('day_fri'), icon: '☀️', temp: '25°' },
    { day: t('day_sat'), icon: '🌤️', temp: '24°' },
    { day: t('day_sun'), icon: '☀️', temp: '26°' },
  ];

  return (
    <div className="agritrust-card" style={{ gap: '12px' }}>
      {/* Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>☀️</span>
          <span className="card-category-label">{t('sa_category')}</span>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
          {t('sa_village')}
        </span>
      </div>

      {/* Main Temperature & Moisture Pill */}
      <div className="weather-main-row">
        <span className="weather-temp-text">{t('sa_temp')}</span>
        <span className="weather-moisture-pill">{t('sa_moisture')}</span>
      </div>

      {/* Advisory Text */}
      <p className="mandi-card-body-text">
        {t('sa_desc')}
      </p>

      {/* 5-Day Forecast Row */}
      <div className="five-days-forecast-pills-row">
        {days.map((d, i) => (
          <div key={i} className="weather-day-pill">
            <span className="weather-day-name">{d.day}</span>
            <span className="weather-day-icon">{d.icon}</span>
            <span className="weather-day-temp">{d.temp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
