import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

const KEY = "yeshivot:favorites";

let cache: string[] = [];
let loaded = false;
let currentUser: string | null = null;
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

async function syncWithUser(userId: string | null) {
  if (currentUser === userId) return;
  currentUser = userId;
  if (!userId) { notify(); return; }
  load();
  const { data } = await supabase.from("favorites").select("yeshiva_id").eq("user_id", userId);
  const remote = (data ?? []).map(r => r.yeshiva_id as string);
  const missing = cache.filter(id => !remote.includes(id));
  if (missing.length) {
    await supabase.from("favorites").insert(missing.map(yid => ({ user_id: userId, yeshiva_id: yid })));
  }
  cache = Array.from(new Set([...remote, ...cache]));
  persist();
  notify();
}

export function useFavorites() {
  const { user, ready } = useAuth();
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

  useEffect(() => {
    if (ready) void syncWithUser(user?.id ?? null);
  }, [ready, user?.id]);

  const toggle = useCallback((id: string) => {
    load();
    const has = cache.includes(id);
    cache = has ? cache.filter(x => x !== id) : [...cache, id];
    persist();
    notify();
    const uid = currentUser;
    if (uid) {
      if (has) {
        void supabase.from("favorites").delete().eq("user_id", uid).eq("yeshiva_id", id);
      } else {
        void supabase.from("favorites").insert({ user_id: uid, yeshiva_id: id });
      }
    }
  }, []);

  const isFavorite = useCallback((id: string) => list.includes(id), [list]);

  return { favorites: list, toggle, isFavorite };
}
