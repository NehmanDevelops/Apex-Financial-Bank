"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export function TopBar() {
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
    const saved = window.localStorage.getItem("apex_theme");
    const next = saved === "dark" ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);

  return (
    <header className="bg-[#0b6aa9]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Image src="/apexfinancial.png" alt="Apex Financial" width={36} height={36} priority className="rounded" />
          <div className="text-sm font-semibold tracking-tight text-white">Apex Financial</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-medium text-white/90">{copy.secureOnlineBanking}</div>
          <button
            type="button"
            onClick={() => {
              const next = theme === "light" ? "dark" : "light";
              setTheme(next);
              if (typeof window !== "undefined") {
                window.localStorage.setItem("apex_theme", next);
                document.documentElement.dataset.theme = next;
              }
            }}
            className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
          <button
            type="button"
            onClick={() => setLang((v) => (v === "en" ? "fr" : "en"))}
            className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white hover:bg-white/15"
          >
            {lang === "en" ? "FR" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}
