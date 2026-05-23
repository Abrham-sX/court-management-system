// src/i18n/hooks.ts
import { useContext } from 'react';
import { LanguageContext } from './context';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
};