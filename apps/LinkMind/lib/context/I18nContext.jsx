"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import i18nData from '../i18n.json';

const defaultLang = typeof window !== 'undefined' && localStorage.getItem('lang')
  ? localStorage.getItem('lang')
  : 'pt';

const I18nContext = createContext({
  lang: 'pt',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children, initialLang }) {
  const [lang, setLang] = useState(initialLang || defaultLang);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  function t(key) {
    return i18nData[lang]?.[key] || key;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
