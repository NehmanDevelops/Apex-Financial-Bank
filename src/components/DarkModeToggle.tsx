"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check localStorage on mount
        const saved = localStorage.getItem("theme");
        if (saved === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    function toggle() {
        const newValue = !isDark;
        setIsDark(newValue);
        if (newValue) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }

    return (
        <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            aria-label="Toggle dark mode"
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
