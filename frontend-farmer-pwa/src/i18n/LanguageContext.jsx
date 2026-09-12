import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिन्दी (Hindi)', short: 'हिं' },
  { code: 'mr', label: 'मराठी (Marathi)', short: 'म' },
  { code: 'ta', label: 'தமிழ் (Tamil)', short: 'த' },
];

export const SPEECH_ADVISORY_TEXTS = {
  en: "Namaste Ramesh Patel. Your AgriTrust sovereign credit rating is 78 out of 100, which is rated as Prime standing. Your safe borrowing limit is 1 lakh 65 thousand rupees. A pre-approved Rabi sowing loan of 45 thousand rupees is available at 4 percent interest. Khanna Mandi wheat prices are steady at 2 thousand 275 rupees per quintal.",
  hi: "नमस्ते रमेश पटेल। आपकी एग्रीट्रस्ट साख रेटिंग १०० में से ७८ है, जो उत्कृष्ट मानी जाती है। आपकी सुरक्षित ऋण सीमा १ लाख ६५ हजार रुपये है। रबी बुआई हेतु ४५ हजार रुपये का ४ प्रतिशत ब्याज दर वाला ऋण पूर्व-स्वीकृत है। खन्ना मंडी में गेहूं का भाव २ हजार २७५ रुपये प्रति क्विंटल स्थिर है।",
  mr: "नमस्ते रमेश पाटील. तुमची ॲग्रीट्रस्ट कृषी पत स्थिती १०० पैकी ७८ आहे, जी उत्कृष्ट मानली जाते. तुमची सुरक्षित कर्ज मर्यादा १ लाख ६५ हजार रुपये आहे. रब्बी पेरणीसाठी ४५ हजार रुपयांचे ४ टक्के व्याजदराचे कर्ज मंजूर आहे. खन्ना बाजारपेठेत गव्हाचा भाव २ हजार २७५ रुपये प्रति क्विंटल स्थिर आहे.",
  ta: "வணக்கம் ரமேஷ் படேல். உங்கள் அக்ரிட்ரஸ்ட் கடன் மதிப்பீடு 100க்கு 78 ஆக உள்ளது, இது மிகச் சிறந்த நிலையாகும். உங்கள் பாதுகாப்பான கடன் வரம்பு 1 லட்சத்து 65 ஆயிரம் ரூபாய். ரபி விதைப்புக்காக 45 ஆயிரம் ரூபாய் 4 சதவீத வட்டியில் முன்-அங்கீகரிக்கப்பட்டுள்ளது. கன்னா மண்டியில் கோதுமை விலை குவிண்டாலுக்கு 2 ஆயிரத்து 275 ரூபாயாக உள்ளது.",
};

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

  const getAdvisorySpeech = () => {
    return SPEECH_ADVISORY_TEXTS[currentLang] || SPEECH_ADVISORY_TEXTS.en;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang, t, getAdvisorySpeech, languages: SUPPORTED_LANGUAGES }}>
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

