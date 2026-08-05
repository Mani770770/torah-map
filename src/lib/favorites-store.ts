import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

const KEY = "yeshivot:favorites";
const MERGED_KEY = "yeshivot:favorites:merged:";

let cache: string[] = [];
let loaded = false;
let currentUser: string | null = null;
let syncingFor: string | null | undefined;
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

function hasMerged(userId: string) {
  try { return localStorage.getItem(MERGED_KEY + userId) === "1"; } catch { return false; }
}
function setMerged(userId: string) {
  try { localStorage.setItem(MERGED_KEY + userId, "1"); } catch {}
}

async function syncWithUser(userId: string | null) {
  if (syncingFor === userId) return;
  syncingFor = userId;
  currentUser = userId;
  load();

  if (!userId) { notify(); return; }

  const { data, error } = await supabase.from("favorites").select("yeshiva_id").eq("user_id", userId);
  if (error) { notify(); return; }
  const remote = (data ?? []).map(r => r.yeshiva_id as string);

  if (!hasMerged(userId)) {
    // First sign-in on this device: bring guest favorites up to the cloud once.
    const missing = cache.filter(id => !remote.includes(id));
    if (missing.length) {
      await supabase.from("favorites").insert(missing.map(yid => ({ user_id: userId, yeshiva_id: yid })));
    }
    cache = Array.from(new Set([...remote, ...missing]));
    setMerged(userId);
  } else {
    // Cloud is the single source of truth afterwards — removals must stick.
    cache = remote;
  }
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
    if (!uid) return;
    void (async () => {
      const res = has
        ? await supabase.from("favorites").delete().eq("user_id", uid).eq("yeshiva_id", id)
        : await supabase.from("favorites").insert({ user_id: uid, yeshiva_id: id });
      if (res.error) {
        // Revert the optimistic change so local and cloud never drift apart.
        cache = has ? Array.from(new Set([...cache, id])) : cache.filter(x => x !== id);
        persist();
        notify();
      }
    })();
  }, []);

  const isFavorite = useCallback((id: string) => list.includes(id), [list]);

  return { favorites: list, toggle, isFavorite };
}
