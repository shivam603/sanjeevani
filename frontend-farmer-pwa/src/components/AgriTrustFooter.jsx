import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

export default function AgriTrustFooter() {
  const { t } = useTranslation();

  return (
    <footer className="agritrust-footer">
      <div className="agritrust-footer-inner">
        <div className="footer-left-brand">
          <span>🛡️</span>
          <span>{t('footer_tagline')}</span>
        </div>

        <div>
          {t('footer_rights')}
        </div>
      </div>
    </footer>
  );
}
