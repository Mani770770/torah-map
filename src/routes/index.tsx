import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Users, Mail, Bug, MessageCircle, Compass } from "lucide-react";
import { REGIONS, getRegion, type Region } from "@/lib/regions";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useYeshivot } from "@/lib/yeshivot-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "חיפוש ישיבות בישראל — מצאו ישיבה לבנים ולבנות" },
      { name: "description", content: "רשימה מקיפה של כל הישיבות בישראל - חב\"ד, ליטאי, ירושלמי, ספרדי ועוד. חיפוש לפי מגדר, סוג ועיר." },
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
    <div className="min-h-screen bg-background bg-page-glow">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border bg-gradient-brand px-4 py-20 text-primary-foreground">
        <div className="pointer-events-none absolute -top-24 -start-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -end-20 h-80 w-80 rounded-full bg-teal/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold-accent bg-white/10 px-4 py-1 text-xs font-semibold tracking-wide">
            אינדקס הישיבות בישראל
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            כל הישיבות בישראל במקום אחד
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            מצאו את הישיבה המתאימה — לכל המגזרים, הזרמים, לבנים ולבנות
          </p>

          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-xl gap-2 rounded-xl bg-card p-2 shadow-2xl ring-1 ring-gold/25">
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
            <h2 className="text-2xl font-bold text-gradient-brand sm:text-3xl">ישיבות נבחרות</h2>
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

      <RegionsSection />

      <ContactSection />
    </div>
  );
}

const REGION_STYLES: Record<Region, { gradient: string; emoji: string; desc: string }> = {
  "צפון": { gradient: "from-emerald-500 to-teal-600", emoji: "🌲", desc: "ישיבות בגליל, חיפה והצפון" },
  "מרכז": { gradient: "from-blue-500 to-indigo-600", emoji: "🏙️", desc: "ירושלים, גוש דן והמרכז" },
  "דרום": { gradient: "from-amber-500 to-orange-600", emoji: "🏜️", desc: "באר שבע, אשקלון והנגב" },
};

function RegionsSection() {
  const { list } = useYeshivot();
  const counts = REGIONS.reduce<Record<Region, number>>((acc, r) => {
    acc[r] = list.filter((y) => getRegion(y.city) === r).length;
    return acc;
  }, { "צפון": 0, "מרכז": 0, "דרום": 0 });

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">חיפוש לפי איזור</h2>
          <p className="mt-1 text-muted-foreground">מצאו ישיבות לפי איזור בארץ</p>
        </div>
        <Link to="/yeshivot" className="text-sm font-medium text-primary hover:underline">
          לכל הישיבות ←
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {REGIONS.map((r) => {
          const style = REGION_STYLES[r];
          return (
            <Link
              key={r}
              to="/yeshivot"
              search={{ q: "", gender: null, sector: null, region: r, city: null, dorm: null, secularStudies: null, size: null, sort: "default", priceMin: null, priceMax: null, priceMode: "monthly" } as never}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${style.gradient} text-white`}>
                <span className="text-6xl" aria-hidden>{style.emoji}</span>
                <Compass className="absolute end-4 top-4 h-5 w-5 opacity-70" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary">{r}</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {counts[r]} ישיבות
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{style.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<"bug" | "feedback" | "other">("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("נא למלא את תוכן ההודעה");
      return;
    }
    setSending(true);
    const subject = encodeURIComponent(
      topic === "bug" ? "דיווח על באג באתר" : topic === "feedback" ? "משוב על האתר" : "פנייה כללית"
    );
    const body = encodeURIComponent(
      `שם: ${name}\nאימייל: ${email}\n\n${message}`
    );
    window.location.href = `mailto:support@yeshivot.co.il?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSending(false);
      toast.success("נפתחה תוכנת המייל לשליחה");
    }, 500);
  };

  return (
    <section id="contact" className="border-t border-border bg-muted/30 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">יצירת קשר</h2>
          <p className="mt-2 text-muted-foreground">
            מצאתם באג? יש לכם הצעה לשיפור? נשמח לשמוע מכם
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">שם</label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="השם שלכם" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">אימייל</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">סוג הפנייה</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "bug", label: "באג / תקלה", icon: Bug },
                { id: "feedback", label: "משוב / הצעה", icon: MessageCircle },
                { id: "other", label: "אחר", icon: Mail },
              ].map(opt => {
                const Icon = opt.icon;
                const active = topic === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTopic(opt.id as typeof topic)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">תוכן ההודעה *</label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="פרטו כאן את הבעיה / ההצעה / השאלה..."
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={sending} className="w-full sm:w-auto">
            {sending ? "שולח..." : "שליחה"}
          </Button>
        </form>
      </div>
    </section>
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
