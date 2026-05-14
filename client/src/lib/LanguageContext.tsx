import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (en: string, hi: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  toggleLang: () => {},
  t: (en, hi) => hi,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('sjsLang') as Language) || 'hi';
  });

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'hi' ? 'en' : 'hi';
      localStorage.setItem('sjsLang', next);
      return next;
    });
  };

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
