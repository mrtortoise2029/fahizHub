import { Contrast, Languages, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";
import PwaInstallButton from "./PwaInstallButton";
import { useLanguage } from "../context/LanguageContext";

const links = [
  ["about", "/about"],
  ["projects", "/projects"],
  ["skills", "/skills"],
  ["experience", "/experience"],
  ["services", "/services"],
  ["ai", "/ai"],
  ["resume", "/resume"],
  ["contact", "/contact"],
];

export default function PublicHeader({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState(
    () => localStorage.getItem("highContrast") === "true",
  );
  const { language, t, toggleLanguage } = useLanguage();
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
    document.getElementById("main-content")?.focus();
  }, [location.pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [contrast]);
  useEffect(() => {
    const close = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  function toggleContrast() {
    setContrast((current) => {
      const next = !current;
      document.documentElement.classList.toggle("high-contrast", next);
      localStorage.setItem("highContrast", String(next));
      return next;
    });
  }
  const navClass = ({ isActive }) =>
    `rounded-md px-2 py-2 text-sm font-medium transition ${isActive ? "text-brand-600 dark:text-brand-500" : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"}`;
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-ink-950/90">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={t("navigation")}
        >
          {links.map(([label, to]) => (
            <NavLink className={navClass} to={to} key={to}>
              {t(label)}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-ink-800"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button
            className="grid size-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-ink-800"
            onClick={toggleLanguage}
            aria-label={`Switch to ${language === "en" ? "Bangla" : "English"}`}
          >
            <Languages size={19} />
            <span className="sr-only">{language}</span>
          </button>
          <button
            className="hidden size-11 place-items-center rounded-lg hover:bg-slate-100 md:grid dark:hover:bg-ink-800"
            onClick={toggleContrast}
            aria-pressed={contrast}
            aria-label="Toggle high contrast"
          >
            <Contrast size={19} />
          </button>
          <PwaInstallButton />
          <Link to="/meetings" className="button-primary hidden sm:inline-flex">
            {t("book")}
          </Link>
          <button
            className="grid size-11 place-items-center rounded-lg lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="container-page border-t border-slate-200 py-3 lg:hidden dark:border-slate-800"
          aria-label="Mobile navigation"
        >
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {links.map(([label, to]) => (
              <NavLink
                className={navClass}
                to={to}
                key={to}
                onClick={() => setOpen(false)}
              >
                {t(label)}
              </NavLink>
            ))}
            <NavLink
              className={navClass}
              to="/meetings"
              onClick={() => setOpen(false)}
            >
              {t("book")}
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  );
}
