import { useEffect, useState } from "react";

export type Sector = "חב\"ד" | "ליטאי" | "ירושלמי" | "ספרדי" | "חסידי" | "דתי לאומי";
export type Gender = "בנים" | "בנות";

export interface StaffMember {
  id: string;
  name: string;
  role?: string;
  image?: string;
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

const KEY = "yeshivot.v1";

const seed: Yeshiva[] = [
  { id: "1", name: "ישיבת מיר", sector: "ליטאי", gender: "בנים", city: "ירושלים", description: "אחת הישיבות הליטאיות הגדולות בעולם, מרכז תורני בלב שכונת בית ישראל.", phone: "02-5371213", website: "https://mir.org.il", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { id: "2", name: "ישיבת חברון", sector: "ליטאי", gender: "בנים", city: "ירושלים", description: "ישיבה ליטאית ותיקה הממשיכה את מסורת ישיבת סלובודקה.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { id: "3", name: "ישיבת תומכי תמימים", sector: "חב\"ד", gender: "בנים", city: "כפר חב\"ד", description: "הישיבה המרכזית של חסידות חב\"ד, לימוד נגלה וחסידות.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { id: "4", name: "ישיבת פורת יוסף", sector: "ספרדי", gender: "בנים", city: "ירושלים", description: "הישיבה הספרדית המרכזית, מקור לרבים מחכמי הדור הספרדי.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { id: "5", name: "ישיבת הר עציון", sector: "דתי לאומי", gender: "בנים", city: "אלון שבות", description: "ישיבת הסדר מובילה בציונות הדתית, משלבת תורה ועבודה.", dorm: true, secularStudies: true, size: "גדולה", gallery: [], staff: [] },
  { id: "6", name: "סמינר בית יעקב הישן", sector: "ירושלמי", gender: "בנות", city: "ירושלים", description: "סמינר חרדי ותיק לבנות, מהמוסדות המובילים בחינוך הבנות.", dorm: true, secularStudies: false, size: "גדולה", gallery: [], staff: [] },
  { id: "7", name: "ישיבת בית מתתיהו", sector: "ליטאי", gender: "בנים", city: "בני ברק", description: "ישיבה ליטאית מרכזית בבני ברק עם דגש על לימוד עיוני.", dorm: true, secularStudies: false, size: "קטנה", gallery: [], staff: [] },
  { id: "8", name: "סמינר בית רבקה", sector: "חב\"ד", gender: "בנות", city: "כפר חב\"ד", description: "סמינר הבנות המרכזי של חסידות חב\"ד.", dorm: true, secularStudies: false, size: "קטנה", gallery: [], staff: [] },
];

function read(): Yeshiva[] {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function write(list: Yeshiva[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("yeshivot:update"));
}

export function useYeshivot() {
  const [list, setList] = useState<Yeshiva[]>(seed);
  useEffect(() => {
    setList(read());
    const h = () => setList(read());
    window.addEventListener("yeshivot:update", h);
    return () => window.removeEventListener("yeshivot:update", h);
  }, []);

  return {
    list,
    add: (y: Omit<Yeshiva, "id">) => write([...read(), { ...y, id: crypto.randomUUID() }]),
    update: (id: string, y: Omit<Yeshiva, "id">) => write(read().map(x => x.id === id ? { ...y, id } : x)),
    remove: (id: string) => write(read().filter(x => x.id !== id)),
  };
}

export function useYeshiva(id: string) {
  const { list } = useYeshivot();
  return list.find(y => y.id === id);
}

export type Size = "גדולה" | "קטנה";
export const SECTORS: Sector[] = ["חב\"ד", "ליטאי", "ירושלמי", "ספרדי", "חסידי", "דתי לאומי"];
export const GENDERS: Gender[] = ["בנים", "בנות"];
export const SIZES: Size[] = ["גדולה", "קטנה"];
