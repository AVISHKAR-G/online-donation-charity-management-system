import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.js';
import ta from './locales/ta.js';
import hi from './locales/hi.js';
import ml from './locales/ml.js';
import kn from './locales/kn.js';
import te from './locales/te.js';
import de from './locales/de.js';
import fr from './locales/fr.js';
import ja from './locales/ja.js';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
      hi: { translation: hi },
      ml: { translation: ml },
      kn: { translation: kn },
      te: { translation: te },
      de: { translation: de },
      fr: { translation: fr },
      ja: { translation: ja },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;