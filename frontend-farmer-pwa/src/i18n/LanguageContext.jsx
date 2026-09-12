import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'mr', label: 'मराठी', short: 'म' },
];

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('kisancred_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('kisancred_lang', currentLang);
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  /**
   * Translate a key with optional dynamic parameter interpolation
   * @param {string} key
   * @param {Object} [params]
   * @returns {string}
   */
  const t = (key, params = {}) => {
    const langDict = translations[currentLang] || translations.en;
    let text = langDict[key] || translations.en[key] || key;

    // Interpolate variables like {{count}}, {{days}}
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), params[paramKey]);
    });

    return text;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang, t, languages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
