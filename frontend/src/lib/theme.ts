import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "babit-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "dark" || v === "light" || v === "system" ? v : "light";
}

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme;
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
}

export function setTheme(theme: Theme) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, theme);
  apply(theme);
  window.dispatchEvent(new Event("babit-theme-change"));
}

let listenerBound = false;

// Apply the stored theme and keep "system" in sync with OS changes.
export function initTheme() {
  apply(getStoredTheme());
  if (!listenerBound && typeof window !== "undefined") {
    listenerBound = true;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (getStoredTheme() === "system") apply("system");
    });
  }
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    const sync = () => setThemeState(getStoredTheme());
    window.addEventListener("babit-theme-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("babit-theme-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return [theme, setTheme];
}
