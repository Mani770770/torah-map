import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Users, Search, Filter, X, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYeshivot, SECTORS, GENDERS, type Sector, type Gender } from "@/lib/yeshivot-store";

export const Route = createFileRoute("/yeshivot/")({
  head: () => ({
    meta: [
      { title: "אינדקס הישיבות — חיפוש וסינון" },
      { name: "description", content: "רשימת כל הישיבות בישראל עם סינון לפי מגדר, מגזר ועיר." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    gender: (s.gender as Gender) || null,
    sector: (s.sector as Sector) || null,
    city: (s.city as string) || null,
    dorm: typeof s.dorm === "boolean" ? s.dorm : null,
    secularStudies: typeof s.secularStudies === "boolean" ? s.secularStudies : null,
  }),
  component: YeshivotPage,
});

function YeshivotPage() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const { list } = useYeshivot();
  const [open, setOpen] = useState(false);

  const q = search.q || "";
  const gender = search.gender;
  const sector = search.sector;
  const city = search.city;
  const dorm = search.dorm;
  const secularStudies = search.secularStudies;

  const cities = useMemo(() => Array.from(new Set(list.map(y => y.city))).sort(), [list]);

  const filtered = useMemo(() => {
    const term = q.trim();
    return list.filter(y => {
      if (gender && y.gender !== gender) return false;
      if (sector && y.sector !== sector) return false;
      if (city && y.city !== city) return false;
      if (dorm !== null && y.dorm !== dorm) return false;
      if (secularStudies !== null && y.secularStudies !== secularStudies) return false;
      if (term && ![y.name, y.city, y.sector, y.description].some(v => v.includes(term))) return false;
      return true;
    });
  }, [list, q, gender, sector, city, dorm, secularStudies]);

  const setQ = (val: string) => navigate({ search: (prev: typeof search) => ({ ...prev, q: val }) });
  const setGender = (val: Gender | null) => navigate({ search: (prev: typeof search) => ({ ...prev, gender: val }) });
  const setSector = (val: Sector | null) => navigate({ search: (prev: typeof search) => ({ ...prev, sector: val }) });
  const setCity = (val: string | null) => navigate({ search: (prev: typeof search) => ({ ...prev, city: val }) });
  const setDorm = (val: boolean | null) => navigate({ search: (prev: typeof search) => ({ ...prev, dorm: val }) });
  const setSecularStudies = (val: boolean | null) => navigate({ search: (prev: typeof search) => ({ ...prev, secularStudies: val }) });
  const clear = () => navigate({ search: { q: "", gender: null, sector: null, city: null, dorm: null, secularStudies: null } });
  const activeCount = [gender, sector, city, dorm, secularStudies].filter(v => v !== null && v !== "" && v !== undefined).length;

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

            <FilterGroup label="עיר">
              {cities.map(c => (
                <Chip key={c} active={city === c} onClick={() => setCity(city === c ? null : c)}>{c}</Chip>
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
                {filtered.map(y => (
                  <Link
                    key={y.id}
                    to="/yeshivot/$id"
                    params={{ id: y.id }}
                    search={search}
                    data-yeshiva-id={y.id}
                    onClick={() => saveScroll(y.id)}
                    className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
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
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{y.description}</p>
                    </div>
                  </Link>
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
