"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import i18nData from '../i18n.json';

const I18nContext = createContext({
  lang: 'pt',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children, initialLang }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lang') || initialLang || 'pt';
    }
    return initialLang || 'pt';
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }, [lang]);
  function t(key, params = {}) {
    // Suporte a chaves aninhadas, ex: 'dashboard.bemVindo'
    const keys = key.split('.');
    let value = i18nData[lang];
    for (const k of keys) {
      if (value && Object.prototype.hasOwnProperty.call(value, k)) {
        value = value[k];
      } else {
        return key; // fallback: retorna a chave se não encontrar
      }
    }
    
    // Suporte a interpolação de parâmetros
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }
    
    return value;
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
