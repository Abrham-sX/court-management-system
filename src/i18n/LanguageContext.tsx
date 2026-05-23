// src/i18n/LanguageContext.tsx
import { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { LanguageContext } from './context';
import { translations, type Language } from './translations';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'am' : 'en';
    setLanguageState(newLang);
    localStorage.setItem('app_language', newLang);
  }, [language]);

  const t = useCallback((key: string, vars?: Record<string, any>) => {
    const dict = translations[language];
    let text = dict[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};