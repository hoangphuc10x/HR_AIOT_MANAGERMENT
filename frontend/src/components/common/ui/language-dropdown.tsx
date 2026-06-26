'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

const LanguageDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use translation with fallback
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (typeof window !== 'undefined' && i18n.isInitialized) {
      setIsReady(true);
    }
  }, [i18n.isInitialized]);

  const languages = [
    { code: 'vi', name: t('vietnamese'), flag: '🇻🇳' },
    { code: 'en', name: t('english'), flag: '🇬🇧' },
  ];

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);

    // Save to cookie for middleware
    if (typeof window !== 'undefined') {
      document.cookie = `i18nextLng=${languageCode}; path=/; max-age=31536000`; // 1 year
    }

    setIsOpen(false);
  };

  // Don't render until ready to prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="relative">
        <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
      >
        <span>{currentLanguage.name}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-50 ${
                i18n.language === language.code
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
