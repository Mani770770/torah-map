import { useEffect, useState, useCallback } from "react";

const KEY = "yeshivot:favorites";

let cache: string[] = [];
let loaded = false;
const listeners = new Set<(s: string[]) => void>();
const notify = () => listeners.forEach(l => l(cache));

function load() {
  if (loaded || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? JSON.parse(raw) : [];
  } catch {
    cache = [];
  }
  loaded = true;
}

function persist() {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch {}
}

export function useFavorites() {
  const [list, setList] = useState<string[]>(() => {
    load();
    return cache;
  });

  useEffect(() => {
    load();
    setList(cache);
    listeners.add(setList);
    return () => { listeners.delete(setList); };
  }, []);

  const toggle = useCallback((id: string) => {
    load();
    cache = cache.includes(id) ? cache.filter(x => x !== id) : [...cache, id];
    persist();
    notify();
  }, []);

  const isFavorite = useCallback((id: string) => list.includes(id), [list]);

  return { favorites: list, toggle, isFavorite };
}
