import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function ScoreGauge({ score = 78, maxScore = 100, grade = 'Grade A • Prime' }) {
  const { t } = useTranslation();

  // Clamp score between 0 and maxScore
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const normalized = clampedScore / maxScore;

  // Arc calculation for SVG semicircle (radius = 80, center = (110, 105))
  // Arc length for semicircle: Math.PI * 80 = ~251.3
  const radius = 80;
  const circumference = Math.PI * radius; // 251.32
  const strokeDashoffset = circumference * (1 - normalized);

  // Determine color theme based on score tier
  let strokeColor = '#10b981'; // Emerald
  let glowColor = 'rgba(16, 185, 129, 0.35)';
  let gradeKey = 'dash_grade_prime';

  if (clampedScore < 50) {
    strokeColor = '#f43f5e'; // Coral
    glowColor = 'rgba(244, 63, 94, 0.35)';
    gradeKey = 'dash_grade_moderate';
  } else if (clampedScore < 75) {
    strokeColor = '#f59e0b'; // Amber
    glowColor = 'rgba(245, 158, 11, 0.35)';
    gradeKey = 'dash_grade_good';
  }

  return (
    <div className="gauge-wrapper">
      <svg className="gauge-svg" viewBox="0 0 220 125">
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="60%" stopColor={strokeColor} />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Background Track Arc */}
        <path
          d="M 30 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke="#1e293b"
          strokeWidth="16"
          strokeLinecap="round"
        />

        {/* Animated Progress Arc */}
        <path
          d="M 30 110 A 80 80 0 0 1 190 110"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#gaugeGlow)"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {/* Min / Max Tick Labels */}
        <text x="24" y="122" fill="#64748b" fontSize="11" fontWeight="700">0</text>
        <text x="186" y="122" fill="#64748b" fontSize="11" fontWeight="700">100</text>
      </svg>

      {/* Numerical readout in the hollow center */}
      <div className="gauge-score-text">
        <div className="gauge-score-number">{clampedScore}</div>
        <div className="gauge-score-label">{t('dash_score_scale')}</div>
      </div>

      <div style={{ marginTop: '8px' }}>
        <span className="badge-pill badge-prime" style={{ borderColor: strokeColor, color: strokeColor }}>
          🌱 {t(gradeKey)}
        </span>
      </div>
    </div>
  );
}
