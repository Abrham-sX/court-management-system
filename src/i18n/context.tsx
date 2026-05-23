// src/i18n/context.tsx
import type { ReactNode } from 'react';
import { createContext, useState, useEffect } from 'react';
import { translations, type Language } from './translations';

interface LanguageContextValue {
  language: Language;
  t: (key: string, vars?: Record<string, any>) => string;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('app_language') as Language | null;
  return stored === 'am' ? 'am' : 'en';
};

const storeLanguage = (lang: Language) => {
  localStorage.setItem('app_language', lang);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storeLanguage(lang);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'am' : 'en');
  };

  const t = (key: string, vars?: Record<string, any>): string => {
    const dict = translations[language];
    let text = dict[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return text;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, t, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};