'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, esTranslations, type Lang, type Translations } from '../lib/i18n';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('traineruniverse-lang') as Lang | null;
    if (saved === 'en' || saved === 'tr' || saved === 'es') setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('traineruniverse-lang', l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT(): Translations {
  const { lang } = useLanguage();
  if (lang === 'es') return esTranslations as unknown as Translations;
  return translations[lang] as unknown as Translations;
}
