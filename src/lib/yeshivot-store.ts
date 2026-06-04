import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Sector = "חב\"ד" | "ליטאי" | "ירושלמי" | "ספרדי" | "חסידי" | "דתי לאומי";
export type Gender = "בנים" | "בנות";

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
  image?: string;
  phone?: string;
}

export interface Yeshiva {
  id: string;
  name: string;
  sector: Sector;
  gender: Gender;
  city: string;
  description: string;
  image?: string;
  phone?: string;
  website?: string;
  ages?: string;
  dorm?: boolean;
  secularStudies?: boolean;
  size?: "גדולה" | "קטנה";
  type?: string;
  gallery?: string[];
  staff?: StaffMember[];
}

const seed: Omit<Yeshiva, "id">[] = [
  { name: "ישיבת מיר", sector: "ליטאי", gender: "בנים", city: "ירושלים", description: "אחת הישיבות הליטאיות הגדולות בעולם, מרכז תורני בלב שכונת בית ישראל.", phone: "02-5371213", website: "https://mir.org.il", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { name: "ישיבת חברון", sector: "ליטאי", gender: "בנים", city: "ירושלים", description: "ישיבה ליטאית ותיקה הממשיכה את מסורת ישיבת סלובודקה.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { name: "ישיבת תומכי תמימים", sector: "חב\"ד", gender: "בנים", city: "כפר חב\"ד", description: "הישיבה המרכזית של חסידות חב\"ד, לימוד נגלה וחסידות.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { name: "ישיבת פורת יוסף", sector: "ספרדי", gender: "בנים", city: "ירושלים", description: "הישיבה הספרדית המרכזית, מקור לרבים מחכמי הדור הספרדי.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { name: "ישיבת הר עציון", sector: "דתי לאומי", gender: "בנים", city: "אלון שבות", description: "ישיבת הסדר מובילה בציונות הדתית, משלבת תורה ועבודה.", dorm: true, secularStudies: true, size: "גדולה", gallery: [], staff: [] },
  { name: "סמינר בית יעקב הישן", sector: "ירושלמי", gender: "בנות", city: "ירושלים", description: "סמינר חרדי ותיק לבנות, מהמוסדות המובילים בחינוך הבנות.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { name: "ישיבת בית מתתיהו", sector: "ליטאי", gender: "בנים", city: "בני ברק", description: "ישיבה ליטאית מרכזית בבני ברק עם דגש על לימוד עיוני.", dorm: true, secularStudies: false, size: "קטנה", gallery: [], staff: [] },
  { name: "סמינר בית רבקה", sector: "חב\"ד", gender: "בנות", city: "כפר חב\"ד", description: "סמינר הבנות המרכזי של חסידות חב\"ד.", dorm: true, secularStudies: false, size: "קטנה", gallery: [], staff: [] },
];

type Row = {
  id: string;
  name: string;
  sector: string;
  gender: string;
  city: string;
  description: string;
  image: string | null;
  phone: string | null;
  website: string | null;
  ages: string | null;
  dorm: boolean | null;
  secular_studies: boolean | null;
  size: string | null;
  type: string | null;
  gallery: unknown;
  staff: unknown;
};

function rowToYeshiva(r: Row): Yeshiva {
  return {
    id: r.id,
    name: r.name,
    sector: r.sector as Sector,
    gender: r.gender as Gender,
    city: r.city,
    description: r.description ?? "",
    image: r.image ?? undefined,
    phone: r.phone ?? undefined,
    website: r.website ?? undefined,
    ages: r.ages ?? undefined,
    dorm: r.dorm ?? false,
    secularStudies: r.secular_studies ?? false,
    size: (r.size as "גדולה" | "קטנה" | null) ?? undefined,
    type: r.type ?? undefined,
    gallery: Array.isArray(r.gallery) ? (r.gallery as string[]) : [],
    staff: Array.isArray(r.staff) ? (r.staff as StaffMember[]) : [],
  };
}

function yeshivaToRow(y: Omit<Yeshiva, "id">) {
  return {
    name: y.name,
    sector: y.sector,
    gender: y.gender,
    city: y.city,
    description: y.description ?? "",
    image: y.image ?? null,
    phone: y.phone ?? null,
    website: y.website ?? null,
    ages: y.ages ?? null,
    dorm: !!y.dorm,
    secular_studies: !!y.secularStudies,
    size: y.size ?? null,
    type: y.type ?? null,
    gallery: y.gallery ?? [],
    staff: y.staff ?? [],
  };
}

// Module-level cache shared across hook instances
let cache: Yeshiva[] = [];
let loaded = false;
const listeners = new Set<(list: Yeshiva[]) => void>();
const notify = () => listeners.forEach(l => l(cache));

let seedingPromise: Promise<void> | null = null;
async function ensureSeeded() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const { count } = await supabase.from("yeshivot").select("id", { count: "exact", head: true });
    if ((count ?? 0) === 0) {
      await supabase.from("yeshivot").insert(seed.map(yeshivaToRow));
    }
  })();
  return seedingPromise;
}

async function refresh() {
  const { data, error } = await supabase
    .from("yeshivot")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("Failed to load yeshivot:", error);
    return;
  }
  cache = (data as Row[]).map(rowToYeshiva);
  loaded = true;
  notify();
}

async function init() {
  await ensureSeeded();
  await refresh();
}

let initPromise: Promise<void> | null = null;
function ensureInit() {
  if (!initPromise) initPromise = init();
  return initPromise;
}

export function useYeshivot() {
  const [list, setList] = useState<Yeshiva[]>(cache);

  useEffect(() => {
    listeners.add(setList);
    if (loaded) setList(cache);
    ensureInit();
    return () => { listeners.delete(setList); };
  }, []);

  const add = useCallback(async (y: Omit<Yeshiva, "id">) => {
    const { error } = await supabase.from("yeshivot").insert(yeshivaToRow(y));
    if (error) { console.error(error); throw error; }
    await refresh();
  }, []);

  const update = useCallback(async (id: string, y: Omit<Yeshiva, "id">) => {
    const { error } = await supabase.from("yeshivot").update(yeshivaToRow(y)).eq("id", id);
    if (error) { console.error(error); throw error; }
    await refresh();
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from("yeshivot").delete().eq("id", id);
    if (error) { console.error(error); throw error; }
    await refresh();
  }, []);

  return { list, add, update, remove };
}

export function useYeshiva(id: string) {
  const { list } = useYeshivot();
  return list.find(y => y.id === id);
}

export type Size = "גדולה" | "קטנה";
export const SECTORS: Sector[] = ["חב\"ד", "ליטאי", "ירושלמי", "ספרדי", "חסידי", "דתי לאומי"];
export const GENDERS: Gender[] = ["בנים", "בנות"];
export const SIZES: Size[] = ["גדולה", "קטנה"];
