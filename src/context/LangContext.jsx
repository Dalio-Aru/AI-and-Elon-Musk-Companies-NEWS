import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext({ lang: 'en', setLang: () => {} });

export function useLang() {
  return useContext(LangContext);
}

export default function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  const toggle = () => setLang((prev) => (prev === 'en' ? 'zh' : 'en'));

  return (
    <LangContext.Provider value={{ lang, setLang, toggle }}>
      {children}
    </LangContext.Provider>
  );
}
