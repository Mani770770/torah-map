import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, LogOut, Loader2, Star, User as UserIcon, Save } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useProfile } from "@/lib/auth-store";
import { useFavorites } from "@/lib/favorites-store";
import { useYeshivot } from "@/lib/yeshivot-store";
import { useReviews, formatDate } from "@/lib/reviews-store";
import { StarRating } from "@/components/star-rating";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "הפרופיל שלי — אינדקס הישיבות" },
      { name: "description", content: "הפרטים האישיים שלך, הישיבות המועדפות וחוות הדעת שכתבת." },
      { property: "og:title", content: "הפרופיל שלי — אינדקס הישיבות" },
      { property: "og:description", content: "הפרטים האישיים שלך, הישיבות המועדפות וחוות הדעת שכתבת." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, ready, signOut } = useAuth();
  const { profile, loading, save } = useProfile();
  const { favorites } = useFavorites();
  const { list: yeshivot } = useYeshivot();
  const { list: reviews } = useReviews();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready && !user) void navigate({ to: "/auth", replace: true });
  }, [ready, user, navigate]);

  useEffect(() => {
    if (profile) { setName(profile.display_name); setCity(profile.city ?? ""); }
  }, [profile?.id, profile?.display_name, profile?.city]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const favItems = yeshivot.filter(y => favorites.includes(y.id));
  const myReviews = reviews.filter(r => r.userId === user.id);

  const onSave = async () => {
    setSaving(true);
    try {
      await save({ display_name: name, city: city || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const initials = (name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageTransition>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{name || "המשתמש שלי"}</h1>
                <p dir="ltr" className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={async () => { await signOut(); void navigate({ to: "/auth", search: { switch: true }, replace: true }); }}
              >
                <Users className="h-4 w-4" />
                החלפת חשבון
              </Button>
              <Button
                variant="outline"
                onClick={async () => { await signOut(); void navigate({ to: "/", replace: true }); }}
              >
                <LogOut className="h-4 w-4" />
                התנתקות
              </Button>
            </div>

          </div>

          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <UserIcon className="h-5 w-5 text-primary" /> הפרטים שלי
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pname">שם מלא</Label>
                <Input id="pname" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pcity">עיר מגורים</Label>
                <Input id="pcity" value={city} onChange={e => setCity(e.target.value)} disabled={loading} />
              </div>
            </div>
            <Button className="mt-4" onClick={onSave} disabled={saving || loading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saved ? "נשמר!" : "שמור שינויים"}
            </Button>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" /> הישיבות המועדפות שלי ({favItems.length})
            </h2>
            {favItems.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                עדיין לא שמרת ישיבות.{" "}
                <Link to="/yeshivot" className="font-semibold text-primary hover:underline">עבור לאינדקס</Link>
              </p>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {favItems.map(y => (
                  <Link
                    key={y.id}
                    to="/yeshivot/$id"
                    params={{ id: y.id }}
                    className="rounded-xl border border-border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-bold text-foreground">{y.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{y.city} · {y.sector}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> חוות הדעת שלי ({myReviews.length})
            </h2>
            {myReviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                עדיין לא כתבת חוות דעת.{" "}
                <Link to="/reviews" className="font-semibold text-primary hover:underline">כתוב חוות דעת</Link>
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {myReviews.map(r => {
                  const y = yeshivot.find(v => v.id === r.yeshivaId);
                  return (
                    <li key={r.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-bold text-foreground">{y?.name ?? "ישיבה"}</p>
                        <div className="flex items-center gap-2">
                          <StarRating value={r.rating} readOnly size={16} />
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            r.status === "approved" ? "bg-emerald-500/10 text-emerald-600"
                            : r.status === "hidden" ? "bg-muted text-muted-foreground"
                            : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {r.status === "approved" ? "מאושר" : r.status === "hidden" ? "מוסתר" : "ממתין לאישור"}
                          </span>
                        </div>
                      </div>
                      {r.text && <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>}
                      <p className="mt-2 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </PageTransition>
    </div>
  );
}
