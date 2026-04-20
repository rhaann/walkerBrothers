"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Sync from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Returns chart-specific color values for the current theme. */
export function useChartColors() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  return {
    grid:          dark ? "#002E47" : "#E2E8F0",
    axis:          dark ? "#8A9BB0" : "#475569",
    tooltipBg:     dark ? "#002E47" : "#FFFFFF",
    tooltipBorder: dark ? "#003A5C" : "#CBD5E1",
    tooltipText:   dark ? "#FFFFFF" : "#0F172A",
    tooltipMuted:  dark ? "#DCDCDC" : "#475569",
    cursor:        dark ? "#002E47" : "#EEF2F7",
  };
}
