import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  yeshivaId: string;
  author: string;
  rating: number; // 1..5
  text: string;
  createdAt: number;
  status: "pending" | "approved" | "hidden";
  ownerToken: string;
}

const OWNER_KEY = "reviews.owner";

export function getOwnerToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem(OWNER_KEY);
  if (!t) {
    t = crypto.randomUUID();
    localStorage.setItem(OWNER_KEY, t);
  }
  return t;
}

type Row = {
  id: string;
  yeshiva_id: string;
  author: string;
  rating: number;
  text: string;
  status: string;
  owner_token: string;
  created_at: string;
};

function rowToReview(r: Row): Review {
  return {
    id: r.id,
    yeshivaId: r.yeshiva_id,
    author: r.author,
    rating: r.rating,
    text: r.text ?? "",
    createdAt: new Date(r.created_at).getTime(),
    status: (r.status as Review["status"]) ?? "pending",
    ownerToken: r.owner_token ?? "",
  };
}

let cache: Review[] = [];
let loaded = false;
const listeners = new Set<(list: Review[]) => void>();
const notify = () => listeners.forEach(l => l(cache));

async function refresh() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("Failed to load reviews:", error); return; }
  cache = (data as Row[]).map(rowToReview);
  loaded = true;
  notify();
}

let initPromise: Promise<void> | null = null;
function ensureInit() {
  if (!initPromise) initPromise = refresh();
  return initPromise;
}

export function useReviews() {
  const [list, setList] = useState<Review[]>(cache);

  useEffect(() => {
    listeners.add(setList);
    if (loaded) setList(cache);
    ensureInit();
    return () => { listeners.delete(setList); };
  }, []);

  const add = useCallback(async (r: Omit<Review, "id" | "createdAt" | "status" | "ownerToken">) => {
    const { error } = await supabase.from("reviews").insert({
      yeshiva_id: r.yeshivaId,
      author: r.author,
      rating: r.rating,
      text: r.text,
      status: "pending",
      owner_token: getOwnerToken(),
    });
    if (error) { console.error(error); throw error; }
    await refresh();
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) { console.error(error); throw error; }
    await refresh();
  }, []);

  const setStatus = useCallback(async (id: string, status: Review["status"]) => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) { console.error(error); throw error; }
    await refresh();
  }, []);

  return { list, add, remove, setStatus };
}

export function averageRating(reviews: Review[], yeshivaId: string) {
  const approved = reviews.filter(r => r.yeshivaId === yeshivaId && r.status === "approved");
  if (!approved.length) return { avg: 0, count: 0 };
  const sum = approved.reduce((a, r) => a + r.rating, 0);
  return { avg: sum / approved.length, count: approved.length };
}

export function formatDate(ts: number) {
  try {
    return new Date(ts).toLocaleDateString("he-IL", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}
