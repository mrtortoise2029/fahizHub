import { createContext, useContext, useMemo, useState } from "react";

const translations = {
  en: {
    about: "About",
    projects: "Projects",
    skills: "Skills",
    experience: "Experience",
    services: "Services",
    ai: "AI",
    resume: "Resume",
    contact: "Contact",
    book: "Book a meeting",
    navigation: "Main navigation",
  },
  bn: {
    about: "পরিচিতি",
    projects: "প্রজেক্ট",
    skills: "দক্ষতা",
    experience: "অভিজ্ঞতা",
    services: "সেবা",
    ai: "এআই",
    resume: "জীবনবৃত্তান্ত",
    contact: "যোগাযোগ",
    book: "মিটিং বুক করুন",
    navigation: "প্রধান নেভিগেশন",
  },
};
const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("language") || "en";
    document.documentElement.lang = stored;
    return stored;
  });
  const value = useMemo(
    () => ({
      language,
      t: (key) => translations[language]?.[key] || translations.en[key] || key,
      toggleLanguage: () =>
        setLanguage((current) => {
          const next = current === "en" ? "bn" : "en";
          localStorage.setItem("language", next);
          document.documentElement.lang = next;
          return next;
        }),
    }),
    [language],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useLanguage = () => useContext(LanguageContext);
