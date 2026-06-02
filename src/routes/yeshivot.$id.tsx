import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef } from "react";
import { MapPin, Users, Phone, Globe, ArrowRight, ChevronRight, ChevronLeft, BookOpen, Search, Star, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StarRating } from "@/components/star-rating";
import { YeshivaDetailSkeleton } from "@/components/yeshiva-detail-skeleton";
import { type Sector, type Gender, type Size, type Yeshiva, type StaffMember } from "@/lib/yeshivot-store";
import { useReviews, averageRating, formatDate } from "@/lib/reviews-store";

function readYeshivot(): Yeshiva[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("yeshivot.v1");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/yeshivot/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `ישיבה — פרטים | ${params.id}` },
      { name: "description", content: "פרטים מלאים על הישיבה: מגזר, מיקום, רבנים, גלריה ופרטי קשר." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) || "",
    gender: (s.gender as Gender) || null,
    sector: (s.sector as Sector) || null,
    city: (s.city as string) || null,
    dorm: typeof s.dorm === "boolean" ? s.dorm : null,
    secularStudies: typeof s.secularStudies === "boolean" ? s.secularStudies : null,
    size: (s.size as Size) || null,
  }),
  loader: async ({ params }) => {
    // Small delay so skeleton is visible and transition feels smooth
    await new Promise(r => setTimeout(r, 250));
    const list = readYeshivot();
    return { yeshiva: list.find(y => y.id === params.id) || null };
  },
  pendingComponent: YeshivaDetailSkeleton,
  component: YeshivaDetailPage,
});

function YeshivaDetailPage() {
  const { yeshiva: y } = Route.useLoaderData();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const search = Route.useSearch();
  const { list: reviews } = useReviews();

  if (!y) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">הישיבה לא נמצאה</h1>
          <Button className="mt-6" onClick={() => navigate({ to: "/yeshivot", search: { q: search.q || "", gender: search.gender, sector: search.sector, city: search.city } })}>חזרה לאינדקס</Button>
        </div>
      </div>
    );
  }

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const backSearch = { q: search.q || "", gender: search.gender, sector: search.sector, city: search.city, dorm: search.dorm, secularStudies: search.secularStudies, size: search.size };
  const activeFilters = [
    search.gender ? { label: search.gender, key: "gender" } : null,
    search.sector ? { label: search.sector, key: "sector" } : null,
    search.city ? { label: search.city, key: "city" } : null,
    search.dorm === true ? { label: "פנימייה", key: "dorm" } : null,
    search.secularStudies === true ? { label: "לימודי חול", key: "secularStudies" } : null,
    search.size ? { label: search.size, key: "size" } : null,
  ].filter(Boolean) as { label: string; key: string }[];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <PageTransition>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Quick search bar */}
        <div className="mb-4 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search.q || ""}
                onChange={e => {
                  const val = e.target.value;
                  navigate({ to: ".", search: (prev: typeof search) => ({ ...prev, q: val }) });
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    navigate({ to: "/yeshivot/", search: backSearch });
                  }
                }}
                placeholder="חיפוש מהיר — לחץ Enter לחזור לאינדקס..."
                className="pe-9"
              />
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-muted-foreground">סינון פעיל:</span>
                {activeFilters.map(f => (
                  <span key={f.key} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {f.label}
                  </span>
                ))}
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="inline-flex items-center gap-1 rounded-full border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30 shrink-0">
              <Link to="/yeshivot/" search={backSearch}>
                <ArrowRight className="h-4 w-4" /> חזרה לאינדקס
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary to-primary/80 shadow-xl">
          {y.image ? (
            <img src={y.image} alt={y.name} className="h-72 w-full object-cover sm:h-96" />
          ) : (
            <div className="flex h-72 w-full items-center justify-center text-primary-foreground/80 sm:h-96">
              <BookOpen className="h-24 w-24" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 right-0 left-0 p-6 text-white sm:p-8">
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
              {y.sector}
            </span>
            <h1 className="mt-3 text-3xl font-bold drop-shadow-lg sm:text-4xl">{y.name}</h1>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-white/90">
              <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{y.city}</span>
              <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{y.gender}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold text-foreground">אודות הישיבה</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-line">{y.description}</p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Info label="מגזר / זרם" value={y.sector} />
                <Info label="מגדר" value={y.gender} />
                <Info label="עיר" value={y.city} />
                <Info label="סוג מוסד" value={y.type || "ישיבה"} />
                {y.ages && <Info label="גילאים" value={y.ages} />}
                <Info label="פנימייה" value={y.dorm ? "כן" : "לא"} />
              </dl>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">יצירת קשר</h3>
            <div className="mt-4 space-y-3">
              {y.phone && (
                <a href={`tel:${y.phone}`} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5">
                  <div className="rounded-md bg-primary/10 p-2 text-primary"><Phone className="h-4 w-4" /></div>
                  <div>
                    <div className="text-xs text-muted-foreground">טלפון</div>
                    <div className="font-medium text-foreground" dir="ltr">{y.phone}</div>
                  </div>
                </a>
              )}
              {y.website && (
                <a href={y.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-primary/5">
                  <div className="rounded-md bg-primary/10 p-2 text-primary"><Globe className="h-4 w-4" /></div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">אתר רשמי</div>
                    <div className="truncate font-medium text-foreground">{y.website.replace(/^https?:\/\//, "")}</div>
                  </div>
                </a>
              )}
              {!y.phone && !y.website && (
                <p className="text-sm text-muted-foreground">לא הוזנו פרטי יצירת קשר.</p>
              )}
            </div>
          </aside>
        </div>

        {/* Gallery */}
        {y.gallery && y.gallery.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">גלריית תמונות</h2>
              <div className="flex gap-2">
                <button onClick={() => scrollBy(1)} className="rounded-full border border-border bg-card p-2 hover:bg-muted" aria-label="הקודם">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button onClick={() => scrollBy(-1)} className="rounded-full border border-border bg-card p-2 hover:bg-muted" aria-label="הבא">
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:thin]">
              {y.gallery.map((src: string, i: number) => (
                <img
                  key={i}
                  src={src}
                  alt={`${y.name} ${i + 1}`}
                  className="h-64 w-80 flex-shrink-0 rounded-xl border border-border object-cover shadow-sm transition-transform hover:scale-[1.02]"
                />
              ))}
            </div>
          </section>
        )}

        {/* Staff */}
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">צוות הישיבה / רבני הישיבה</h2>
              <p className="mt-1 text-sm text-muted-foreground">הרבנים ואנשי הצוות הפעילים בישיבה</p>
            </div>
          </div>
          {y.staff && y.staff.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {y.staff.map((s: StaffMember) => (
                <div key={s.id} className="group flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                  {s.image ? (
                    <img src={s.image} alt={s.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10 transition-all group-hover:ring-primary/30" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/10 transition-all group-hover:ring-primary/30">
                      {s.name.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="mt-3 font-bold text-foreground">{s.name}</div>
                  {s.role && (
                    <div className="mt-0.5 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {s.role}
                    </div>
                  )}
                  {s.phone && (
                    <a
                      href={`tel:${s.phone}`}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                      dir="ltr"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{s.phone}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              עדיין לא נוספו רבנים או אנשי צוות לישיבה זו.
            </div>
          )}
        </section>

        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="inline-flex items-center gap-2 rounded-full border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30">
            <Link to="/yeshivot/" search={backSearch}>
              <ArrowRight className="h-5 w-5" /> חזרה לאינדקס
            </Link>
          </Button>
        </div>
      </div>
      </PageTransition>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value}</dd>
    </div>
  );
}
