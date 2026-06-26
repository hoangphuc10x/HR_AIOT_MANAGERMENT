import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import viTranslation from '../app/[lang]/dictionaries/vi.json';
import enTranslation from '../app/[lang]/dictionaries/en.json';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viTranslation,
    },
    en: {
      translation: enTranslation,
    },
  },
  lng: 'vi', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false, // This is important for Next.js
  },
  initImmediate: false, // Don't initialize immediately
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
  // Remove these to allow dot notation
  // keySeparator: false,
  // nsSeparator: false,
});

// Save language to localStorage when it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng);
  }
});

export default i18n;
