import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  city: string | null;
}

let session: Session | null = null;
let ready = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

let initialized = false;
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  supabase.auth.getSession().then(({ data }) => {
    session = data.session;
    ready = true;
    notify();
  });
  supabase.auth.onAuthStateChange((_e, s) => {
    session = s;
    ready = true;
    notify();
  });
}

export function useAuth() {
  const [, force] = useState(0);

  useEffect(() => {
    init();
    const l = () => force(n => n + 1);
    listeners.add(l);
    l();
    return () => { listeners.delete(l); };
  }, []);

  return {
    session,
    user: (session?.user ?? null) as User | null,
    ready,
    signOut: useCallback(async () => { await supabase.auth.signOut(); }, []),
  };
}

export function useProfile() {
  const { user, ready } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, city")
      .eq("id", user.id)
      .maybeSingle();
    setProfile((data as Profile) ?? { id: user.id, display_name: "", avatar_url: null, city: null });
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { if (ready) void load(); }, [ready, load]);

  const save = useCallback(async (patch: Partial<Omit<Profile, "id">>) => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, display_name: patch.display_name ?? "", ...patch }, { onConflict: "id" });
    if (error) throw error;
    await load();
  }, [user?.id, load]);

  return { profile, loading, save, reload: load };
}
