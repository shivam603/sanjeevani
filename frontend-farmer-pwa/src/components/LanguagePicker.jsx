import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function LanguagePicker() {
  const { currentLang, setCurrentLang, languages } = useTranslation();

  return (
    <div className="lang-selector-pill" role="group" aria-label="Language selection">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          className={`lang-btn ${currentLang === lang.code ? 'active' : ''}`}
          onClick={() => setCurrentLang(lang.code)}
          aria-pressed={currentLang === lang.code}
        >
          {lang.short}
        </button>
      ))}
    </div>
  );
}
