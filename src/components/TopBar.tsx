"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function TopBar() {
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const copy = useMemo(() => {
    if (lang === "fr") {
      return {
        secureOnlineBanking: "Services bancaires en ligne sécurisés",
      };
    }

    return {
      secureOnlineBanking: "Secure Online Banking",
    };
  }, [lang]);

  useEffect(() => {
    // Load saved preferences - default to dark mode
    const savedTheme = window.localStorage.getItem("apex_theme");
    const savedLang = window.localStorage.getItem("apex_lang") as "en" | "fr" | null;

    // Default to dark mode if no preference saved
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.dataset.theme = "light";
    } else {
      // Default to dark
      setTheme("dark");
      document.documentElement.dataset.theme = "dark";
    }

    if (savedLang === "fr" || savedLang === "en") {
      setLang(savedLang);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    window.localStorage.setItem("apex_theme", next);
    document.documentElement.dataset.theme = next;
  };

  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);
    window.localStorage.setItem("apex_lang", next);
    // Trigger a page reload to apply translations everywhere
    window.location.reload();
  };

  return (
    <header className="bg-[#0b6aa9]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/apexfinancial.png" alt="Apex Financial" width={32} height={32} priority className="rounded sm:w-9 sm:h-9" />
          <div className="text-xs sm:text-sm font-semibold tracking-tight text-white">Apex Financial</div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block text-xs font-medium text-white/90">{copy.secureOnlineBanking}</div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
          >
            {theme === "light" ? "🌙" : "☀️"}<span className="hidden sm:inline"> {theme === "light" ? "Dark" : "Light"}</span>
          </button>
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
          >
            {lang === "en" ? "🇫🇷" : "🇬🇧"}<span className="hidden sm:inline"> {lang === "en" ? "FR" : "EN"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
