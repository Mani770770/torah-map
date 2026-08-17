import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Users, Search, Filter, X, BookOpen, ArrowDownWideNarrow, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYeshivot, SECTORS, GENDERS, SIZES, formatPrice, monthlyPrice, type Sector, type Gender, type Size } from "@/lib/yeshivot-store";
import { useReviews, averageRating } from "@/lib/reviews-store";
import { StarRating } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import { REGIONS, getRegion, type Region } from "@/lib/regions";

export type SortKey = "default" | "priceDesc" | "priceAsc" | "ratingDesc" | "ratingAsc";
export type PriceMode = "monthly" | "annual";
export const SORTS: { key: SortKey; label: string }[] = [
  { key: "default", label: "ברירת מחדל" },
  { key: "priceDesc", label: "מחיר: מהגבוה לנמוך" },
  { key: "priceAsc", label: "מחיר: מהנמוך לגבוה" },
  { key: "ratingDesc", label: "דירוג: מהגבוה לנמוך" },
  { key: "ratingAsc", label: "דירוג: מהנמוך לגבוה" },
];

export const Route = createFileRoute("/yeshivot/")({
  head: () => ({
    meta: [
      { title: "אינדקס הישיבות — חיפוש וסינון" },
      { name: "description", content: "רשימת כל הישיבות בישראל עם סינון לפי מגדר, מגזר ועיר." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): {
    q?: string;
    gender?: Gender | null;
    sector?: Sector | null;
    region?: Region | null;
    city?: string | null;
    dorm?: boolean | null;
    secularStudies?: boolean | null;
    size?: Size | null;
    sort?: SortKey;
  } => ({
    q: (s.q as string) || "",
    gender: (s.gender as Gender) || null,
    sector: (s.sector as Sector) || null,
    region: (s.region as Region) || null,
    city: (s.city as string) || null,
    dorm: typeof s.dorm === "boolean" ? s.dorm : null,
    secularStudies: typeof s.secularStudies === "boolean" ? s.secularStudies : null,
    size: (s.size as Size) || null,
    sort: (SORTS.some(o => o.key === s.sort) ? (s.sort as SortKey) : "default"),
  }),

  component: YeshivotPage,
});

function YeshivotPage() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const { list } = useYeshivot();
  const { list: reviews } = useReviews();
  const [open, setOpen] = useState(false);

  const q = search.q || "";
  const gender = search.gender;
  const sector = search.sector;
  const region = search.region;
  const city = search.city;
  const dorm = search.dorm;
  const secularStudies = search.secularStudies;
  const size = search.size;
  const sort = search.sort ?? "default";

  const [citySearch, setCitySearch] = useState("");

  const citiesByRegion = useMemo(() => {
    const map = new Map<Region, string[]>();
    REGIONS.forEach((r) => map.set(r, []));
    const seen = new Set<string>();
    list.forEach((y) => {
      const key = `${getRegion(y.city)}::${y.city}`;
      if (seen.has(key)) return;
      seen.add(key);
      map.get(getRegion(y.city))!.push(y.city);
    });
    map.forEach((arr) => arr.sort((a, b) => a.localeCompare(b, "he")));
    return map;
  }, [list]);

  const visibleCities = useMemo<string[]>(() => {
    if (!region) return [];
    const term = citySearch.trim();
    const arr = citiesByRegion.get(region) ?? [];
    if (!term) return arr;
    return arr.filter((c: string) => c.includes(term));
  }, [region, citySearch, citiesByRegion]);

  const filtered = useMemo(() => {
    const term = q.trim();
    return list.filter(y => {
      if (gender && y.gender !== gender) return false;
      if (sector && y.sector !== sector) return false;
      if (region && getRegion(y.city) !== region) return false;
      if (city && y.city !== city) return false;
      if (dorm !== null && y.dorm !== dorm) return false;
      if (secularStudies !== null && y.secularStudies !== secularStudies) return false;
      if (size && y.size !== size) return false;
      if (term && ![y.name, y.city, y.sector, y.description].some(v => v.includes(term))) return false;
      return true;
    });
  }, [list, q, gender, sector, region, city, dorm, secularStudies, size]);

  const ratings = useMemo(() => {
    const map = new Map<string, { avg: number; count: number }>();
    list.forEach(y => map.set(y.id, averageRating(reviews, y.id)));
    return map;
  }, [list, reviews]);

  const sorted = useMemo(() => {
    if (sort === "default") return filtered;
    const arr = [...filtered];
    if (sort === "priceDesc" || sort === "priceAsc") {
      arr.sort((a, b) => {
        const pa = monthlyPrice(a);
        const pb = monthlyPrice(b);
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return sort === "priceDesc" ? pb - pa : pa - pb;
      });
    } else {
      arr.sort((a, b) => {
        const ra = ratings.get(a.id)?.avg ?? 0;
        const rb = ratings.get(b.id)?.avg ?? 0;
        return sort === "ratingDesc" ? rb - ra : ra - rb;
      });
    }
    return arr;
  }, [filtered, sort, ratings]);

  const setSort = (val: SortKey) => navigate({ search: (prev: typeof search) => ({ ...prev, sort: val }) });
  const setQ = (val: string) => navigate({ search: (prev: typeof search) => ({ ...prev, q: val }) });
  const setGender = (val: Gender | null) => navigate({ search: (prev: typeof search) => ({ ...prev, gender: val }) });
  const setSector = (val: Sector | null) => navigate({ search: (prev: typeof search) => ({ ...prev, sector: val }) });
  const setRegion = (val: Region | null) => {
    setCitySearch("");
    navigate({ search: (prev: typeof search) => ({ ...prev, region: val, city: null }) });
  };
  const setCity = (val: string | null) => navigate({ search: (prev: typeof search) => ({ ...prev, city: val }) });
  const setDorm = (val: boolean | null) => navigate({ search: (prev: typeof search) => ({ ...prev, dorm: val }) });
  const setSecularStudies = (val: boolean | null) => navigate({ search: (prev: typeof search) => ({ ...prev, secularStudies: val }) });
  const setSize = (val: Size | null) => navigate({ search: (prev: typeof search) => ({ ...prev, size: val }) });
  const clear = () => {
    setCitySearch("");
    navigate({ search: { q: "", gender: null, sector: null, region: null, city: null, dorm: null, secularStudies: null, size: null, sort: "default" } });
  };
  const activeCount = [gender, sector, region, city, dorm, secularStudies, size].filter(v => v !== null && v !== "" && v !== undefined).length;

  // Restore scroll position when returning from a detail page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("yeshivot:scroll");
    const lastId = sessionStorage.getItem("yeshivot:lastId");
    if (saved) {
      const y = parseInt(saved, 10);
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
        if (lastId) {
          const el = document.querySelector(`[data-yeshiva-id="${lastId}"]`) as HTMLElement | null;
          if (el) {
            el.classList.add("ring-2", "ring-primary/60");
            setTimeout(() => el.classList.remove("ring-2", "ring-primary/60"), 1500);
          }
        }
      });
      sessionStorage.removeItem("yeshivot:scroll");
      sessionStorage.removeItem("yeshivot:lastId");
    }
  }, [filtered.length]);

  const saveScroll = (id: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem("yeshivot:scroll", String(window.scrollY));
    sessionStorage.setItem("yeshivot:lastId", id);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <PageTransition>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">אינדקס הישיבות</h1>
          <p className="mt-1 text-muted-foreground">{filtered.length} ישיבות נמצאו</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 right-0 z-50 w-80 transform overflow-y-auto border-s border-border bg-card p-6 shadow-xl transition-transform lg:static lg:z-0 lg:block lg:w-64 lg:translate-x-0 lg:rounded-xl lg:border lg:shadow-none ${
              open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">סינון</h2>
              <button onClick={() => setOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </button>
            </div>

            <FilterGroup label="מגדר">
              {GENDERS.map(g => (
                <Chip key={g} active={gender === g} onClick={() => setGender(gender === g ? null : g)}>{g}</Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="מגזר / זרם">
              {SECTORS.map(s => (
                <Chip key={s} active={sector === s} onClick={() => setSector(sector === s ? null : s)}>{s}</Chip>
              ))}
            </FilterGroup>

            <FilterGroup label="איזור בארץ">
              {REGIONS.map((r) => {
                const count = (citiesByRegion.get(r) ?? []).length;
                return (
                  <Chip key={r} active={region === r} onClick={() => setRegion(region === r ? null : r)}>
                    {r} <span className="opacity-60">({count})</span>
                  </Chip>
                );
              })}
            </FilterGroup>

            {region && (
              <div className="mb-5 rounded-lg border border-border bg-background/50 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">עיר / יישוב</h3>
                  {city && (
                    <button onClick={() => setCity(null)} className="text-xs text-muted-foreground hover:text-foreground">
                      נקה
                    </button>
                  )}
                </div>
                <div className="relative mb-2">
                  <Search className="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    placeholder="חיפוש עיר..."
                    className="h-8 pe-7 text-sm"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto pr-1">
                  {visibleCities.length === 0 ? (
                    <p className="text-xs text-muted-foreground">לא נמצאו ערים</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {visibleCities.map((c) => (
                        <Chip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)}>
                          {c}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <FilterGroup label="פנימייה">
              <Chip active={dorm === true} onClick={() => setDorm(dorm === true ? null : true)}>כן</Chip>
              <Chip active={dorm === false} onClick={() => setDorm(dorm === false ? null : false)}>לא</Chip>
            </FilterGroup>

            <FilterGroup label="לימודי חול">
              <Chip active={secularStudies === true} onClick={() => setSecularStudies(secularStudies === true ? null : true)}>כן</Chip>
              <Chip active={secularStudies === false} onClick={() => setSecularStudies(secularStudies === false ? null : false)}>לא</Chip>
            </FilterGroup>

            <FilterGroup label="סוג ישיבה">
              {SIZES.map(sz => (
                <Chip key={sz} active={size === sz} onClick={() => setSize(size === sz ? null : sz)}>{sz}</Chip>
              ))}
            </FilterGroup>

            {activeCount > 0 && (
              <Button variant="outline" className="mt-4 w-full" onClick={clear}>נקה סינון</Button>
            )}
          </aside>

          {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="חיפוש..."
                  className="pe-9"
                />
              </div>
              <div className="relative">
                <ArrowDownWideNarrow className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortKey)}
                  aria-label="מיון"
                  className="h-9 rounded-md border border-input bg-background ps-3 pe-8 text-sm text-foreground"
                >
                  {SORTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
              </div>
              <Button variant="outline" className="lg:hidden" onClick={() => setOpen(true)}>
                <Filter className="h-4 w-4" />
                {activeCount > 0 && <span className="ms-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">{activeCount}</span>}
              </Button>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">לא נמצאו ישיבות התואמות את החיפוש</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {sorted.map(y => (
                  <div key={y.id} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <FavoriteButton id={y.id} className="absolute top-3 end-3 z-10" />
                    <Link
                      to="/yeshivot/$id"
                      params={{ id: y.id }}
                      search={search}
                      data-yeshiva-id={y.id}
                      onClick={() => saveScroll(y.id)}
                      className="block"
                    >
                      {y.image ? (
                        <img src={y.image} alt={y.name} className="h-40 w-full object-cover" />
                      ) : (
                        <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                          <BookOpen className="h-12 w-12 opacity-80" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary">{y.name}</h3>
                          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {y.sector}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{y.city}</span>
                          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{y.gender}</span>
                          {formatPrice(y) && (
                            <span className="inline-flex items-center gap-1 font-semibold text-foreground"><Wallet className="h-3 w-3" />{formatPrice(y)}</span>
                          )}
                        </div>
                        {(ratings.get(y.id)?.count ?? 0) > 0 && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <StarRating value={ratings.get(y.id)!.avg} readOnly size={14} />
                            <span className="text-xs text-muted-foreground">
                              {ratings.get(y.id)!.avg.toFixed(1)} ({ratings.get(y.id)!.count})
                            </span>
                          </div>
                        )}
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{y.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      </PageTransition>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}
