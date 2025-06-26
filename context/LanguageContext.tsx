import React, { createContext, useState, useContext, useEffect } from 'react';
import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import { en, id } from '@/localization/translations';

const i18n = new I18n({ en, id });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

const languages = {
  en: { name: 'English', code: 'en' },
  id: { name: 'Bahasa Indonesia', code: 'id' },
};

type LanguageContextType = {
  locale: string;
  t: (key: string, options?: object) => string;
  changeLanguage: (language: string) => void;
  languages: typeof languages;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: (key: string) => key,
  changeLanguage: () => {},
  languages,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const deviceLanguage = getLocales()[0]?.languageCode || 'en';
    setLocale(languages[deviceLanguage] ? deviceLanguage : 'en');
  }, []);

  useEffect(() => {
    i18n.locale = locale;
  }, [locale]);

  const changeLanguage = (language: string) => {
    setLocale(language);
  };

  const t = (key: string, options?: object) => i18n.t(key, options);

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};
