import React from 'react';

export default function SowingAdvisoryCard() {
  const days = [
    { day: 'Wed', icon: '☀️', temp: '26°' },
    { day: 'Thu', icon: '☀️', temp: '27°' },
    { day: 'Fri', icon: '☀️', temp: '25°' },
    { day: 'Sat', icon: '🌤️', temp: '24°' },
    { day: 'Sun', icon: '☀️', temp: '26°' },
  ];

  return (
    <div className="agritrust-card" style={{ gap: '12px' }}>
      {/* Header */}
      <div className="card-header-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '15px' }}>☀️</span>
          <span className="card-category-label">SOWING ADVISORY</span>
        </div>

        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
          Bhadson Village
        </span>
      </div>

      {/* Main Temperature & Moisture Pill */}
      <div className="weather-main-row">
        <span className="weather-temp-text">26°C Clear &amp; Dry</span>
        <span className="weather-moisture-pill">Moisture: 22%</span>
      </div>

      {/* Advisory Text */}
      <p className="mandi-card-body-text">
        Zero rain expected for the next 5 days. High soil temp uniformity makes this weekend optimal for wheat drill sowing and initial basal fertilization.
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
