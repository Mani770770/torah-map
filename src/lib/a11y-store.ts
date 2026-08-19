import { useEffect, useState, useCallback } from "react";

export type ColorMode = "none" | "red-green" | "blue-yellow" | "grayscale";

export type A11ySettings = {
  colorMode: ColorMode;
  fontScale: number; // 0 = normal, steps of 1
  readableFont: boolean;
  spacing: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  highlightLinks: boolean;
};

export const DEFAULT_A11Y: A11ySettings = {
  colorMode: "none",
  fontScale: 0,
  readableFont: false,
  spacing: false,
  highContrast: false,
  reduceMotion: false,
  highlightLinks: false,
};

const KEY = "a11y-settings-v1";

let current: A11ySettings = { ...DEFAULT_A11Y };
const listeners = new Set<(s: A11ySettings) => void>();

function apply(s: A11ySettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("a11y-readable-font", s.readableFont);
  root.classList.toggle("a11y-spacing", s.spacing);
  root.classList.toggle("a11y-contrast", s.highContrast);
  root.classList.toggle("a11y-reduce-motion", s.reduceMotion);
  root.classList.toggle("a11y-highlight-links", s.highlightLinks);
  root.setAttribute("data-a11y-color", s.colorMode);
  root.style.setProperty("--a11y-font-scale", String(1 + s.fontScale * 0.1));
}

function emit() {
  apply(current);
  listeners.forEach((l) => l(current));
}

export function loadA11y() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) current = { ...DEFAULT_A11Y, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  emit();
}

export function useA11y() {
  const [settings, setSettings] = useState<A11ySettings>(current);

  useEffect(() => {
    const l = (s: A11ySettings) => setSettings({ ...s });
    listeners.add(l);
    setSettings({ ...current });
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((patch: Partial<A11ySettings>) => {
    current = { ...current, ...patch };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(current));
    } catch {
      /* ignore */
    }
    emit();
  }, []);

  const reset = useCallback(() => {
    current = { ...DEFAULT_A11Y };
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    emit();
  }, []);

  return { settings, update, reset };
}
