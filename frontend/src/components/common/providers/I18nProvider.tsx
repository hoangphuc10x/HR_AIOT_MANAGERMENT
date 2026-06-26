'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize i18n on client side
    if (typeof window !== 'undefined') {
      // Wait for i18n to be ready
      if (i18n.isInitialized) {
        // Restore language from localStorage after initialization
        const savedLanguage = localStorage.getItem('i18nextLng');
        if (savedLanguage && savedLanguage !== i18n.language) {
          i18n.changeLanguage(savedLanguage);
        }
        setIsReady(true);
      } else {
        i18n.on('initialized', () => {
          // Restore language from localStorage after initialization
          const savedLanguage = localStorage.getItem('i18nextLng');
          if (savedLanguage && savedLanguage !== i18n.language) {
            i18n.changeLanguage(savedLanguage);
          }
          setIsReady(true);
        });
      }
    }
  }, []);

  if (!isReady) {
    return <>{children}</>; // Render without i18n initially
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
