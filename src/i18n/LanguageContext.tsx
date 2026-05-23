import { useEffect, useState, type ReactNode } from 'react';
import { LanguageContext } from './context';
import { translations, type Language } from './translations';

const STORAGE_KEY = 'lang';

const normalizeLanguage = (value: string | null): Language => (value === 'am' ? 'am' : 'en');

const formatTemplate = (template: string, vars?: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => String(vars?.[key] ?? ''));

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => normalizeLanguage(localStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = 'ltr';
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'am' : 'en'));
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const template = translations[language][key] ?? translations.en[key] ?? key;
    return formatTemplate(template, vars);
  };

  return <LanguageContext.Provider value={{ language, toggleLanguage, t }}>{children}</LanguageContext.Provider>;
};
