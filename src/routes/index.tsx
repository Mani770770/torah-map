import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYeshivot } from "@/lib/yeshivot-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "אינדקס הישיבות בישראל — חיפוש ישיבות לבנים ובנות" },
      { name: "description", content: "אינדקס מקיף לכל הישיבות בישראל - חב\"ד, ליטאי, ירושלמי, ספרדי ועוד. חיפוש לפי מגדר, מגזר ועיר." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { list } = useYeshivot();
  const featured = list.slice(0, 4);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/yeshivot", search: { q } as never });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border bg-gradient-to-b from-primary to-primary/90 px-4 py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            כל הישיבות בישראל במקום אחד
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            מצאו את הישיבה המתאימה — לכל המגזרים, הזרמים, לבנים ולבנות
          </p>

          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl gap-2 rounded-xl bg-card p-2 shadow-2xl">
            <Search className="ms-2 h-5 w-5 self-center text-muted-foreground" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="חיפוש לפי שם, עיר או מגזר..."
              className="flex-1 border-0 bg-transparent text-foreground focus-visible:ring-0"
            />
            <Button type="submit">חיפוש</Button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">ישיבות נבחרות</h2>
            <p className="mt-1 text-muted-foreground">מבחר מהמוסדות המובילים באינדקס</p>
          </div>
          <Link to="/yeshivot" className="text-sm font-medium text-primary hover:underline">
            לכל הישיבות ←
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((y, i) => (
            <Link
              key={y.id}
              to="/yeshivot/$id"
              params={{ id: y.id }}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {y.image ? (
                <img src={y.image} alt={y.name} className="h-40 w-full object-cover" />
              ) : (
                <div
                  className="flex h-40 items-center justify-center bg-gradient-to-br from-primary/90 to-primary text-primary-foreground"
                  style={{ filter: `hue-rotate(${i * 12}deg)` }}
                >
                  <BookIcon />
                </div>
              )}
              <div className="p-5">
                <h3 className="line-clamp-1 text-lg font-bold text-foreground group-hover:text-primary">
                  {y.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{y.city}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{y.gender}</span>
                </div>
                <span className="mt-3 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {y.sector}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}
