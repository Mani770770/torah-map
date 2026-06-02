import { useEffect, useState } from "react";

export interface Review {
  id: string;
  yeshivaId: string;
  author: string;
  rating: number; // 1..5
  text: string;
  createdAt: number;
  status: "pending" | "approved" | "hidden";
  ownerToken: string; // local user identifier for "delete own"
}

const KEY = "reviews.v1";
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

function read(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list: Review[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("reviews:update"));
}

export function useReviews() {
  const [list, setList] = useState<Review[]>([]);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("reviews:update", h);
    return () => window.removeEventListener("reviews:update", h);
  }, []);

  return {
    list,
    add: (r: Omit<Review, "id" | "createdAt" | "status" | "ownerToken">) => {
      const item: Review = {
        ...r,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        status: "pending",
        ownerToken: getOwnerToken(),
      };
      write([item, ...read()]);
      return item;
    },
    remove: (id: string) => write(read().filter(x => x.id !== id)),
    setStatus: (id: string, status: Review["status"]) =>
      write(read().map(x => (x.id === id ? { ...x, status } : x))),
  };
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
