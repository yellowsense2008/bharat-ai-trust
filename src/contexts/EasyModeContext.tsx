import React, { createContext, useContext, useState, useEffect } from "react";
import type { Language } from "@/lib/i18n";

interface EasyModeContextType {
  easyMode: boolean;
  toggleEasyMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const EasyModeContext = createContext<EasyModeContextType>({
  easyMode: false,
  toggleEasyMode: () => {},
  language: "en",
  setLanguage: () => {},
});

export const useEasyMode = () => useContext(EasyModeContext);

export const EasyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [easyMode, setEasyMode] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    if (easyMode) {
      document.documentElement.classList.add("easy-mode");
    } else {
      document.documentElement.classList.remove("easy-mode");
    }
  }, [easyMode]);

  return (
    <EasyModeContext.Provider value={{ easyMode, toggleEasyMode: () => setEasyMode(!easyMode), language, setLanguage }}>
      {children}
    </EasyModeContext.Provider>
  );
};
