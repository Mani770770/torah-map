import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MessageSquare, Trash2, Send, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useYeshivot } from "@/lib/yeshivot-store";
import { useReviews, averageRating, formatDate, getOwnerToken } from "@/lib/reviews-store";
import { Check, ChevronDown, X } from "lucide-react";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "חוות דעת ודירוגים — חיפוש ישיבות" },
      { name: "description", content: "שיתוף חוות דעת ודירוג ישיבות על בסיס ניסיון אישי." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { list: yeshivot } = useYeshivot();
  const { list: reviews, add, remove } = useReviews();
  const owner = typeof window !== "undefined" ? getOwnerToken() : "";

  const [yeshivaId, setYeshivaId] = useState("");
  const [yeshivaQuery, setYeshivaQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState("");

  const selectedYeshiva = yeshivot.find(y => y.id === yeshivaId);
  const suggestions = useMemo(() => {
    const q = yeshivaQuery.trim().toLowerCase();
    const base = q
      ? yeshivot.filter(y => y.name.toLowerCase().includes(q) || y.city.toLowerCase().includes(q))
      : yeshivot;
    return base.slice(0, 8);
  }, [yeshivot, yeshivaQuery]);

  const visible = useMemo(
    () => reviews.filter(r => r.status === "approved" && (!filter || r.yeshivaId === filter)),
    [reviews, filter],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!yeshivaId || !author.trim() || !rating || !text.trim()) return;
    add({ yeshivaId, author: author.trim().slice(0, 60), rating, text: text.trim().slice(0, 1000) });
    setAuthor(""); setRating(0); setText(""); setYeshivaId(""); setYeshivaQuery("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">חוות דעת ודירוגים</h1>
          <p className="mt-1 text-muted-foreground">שתפו את חוויית הלימוד שלכם ודרגו את הישיבות.</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mb-8 space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <MessageSquare className="h-5 w-5 text-primary" /> הוספת חוות דעת
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">בחירת ישיבה</span>
              <div className="relative">
                <div className="relative">
                  <Input
                    value={selectedYeshiva && !showSuggestions ? `${selectedYeshiva.name} — ${selectedYeshiva.city}` : yeshivaQuery}
                    onChange={e => {
                      setYeshivaQuery(e.target.value);
                      setYeshivaId("");
                      setShowSuggestions(true);
                      setHighlightIdx(0);
                    }}
                    onFocus={() => { setShowSuggestions(true); if (selectedYeshiva) setYeshivaQuery(""); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onKeyDown={e => {
                      if (!showSuggestions) return;
                      if (e.key === "ArrowDown") { e.preventDefault(); setHighlightIdx(i => Math.min(i + 1, suggestions.length - 1)); }
                      else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightIdx(i => Math.max(i - 1, 0)); }
                      else if (e.key === "Enter" && suggestions[highlightIdx]) {
                        e.preventDefault();
                        const y = suggestions[highlightIdx];
                        setYeshivaId(y.id); setYeshivaQuery(""); setShowSuggestions(false);
                      } else if (e.key === "Escape") { setShowSuggestions(false); }
                    }}
                    placeholder="התחילו להקליד שם ישיבה או עיר..."
                    autoComplete="off"
                    className="pe-9"
                  />
                  {selectedYeshiva ? (
                    <button
                      type="button"
                      onClick={() => { setYeshivaId(""); setYeshivaQuery(""); setShowSuggestions(true); }}
                      className="absolute inset-y-0 left-2 my-auto flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label="נקה"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <ChevronDown className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-popover p-1 shadow-lg animate-fade-in">
                    {suggestions.map((y, i) => (
                      <li key={y.id}>
                        <button
                          type="button"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => { setYeshivaId(y.id); setYeshivaQuery(""); setShowSuggestions(false); }}
                          onMouseEnter={() => setHighlightIdx(i)}
                          className={`flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-right text-sm transition-colors ${
                            i === highlightIdx ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
                          }`}
                        >
                          <span>
                            <span className="font-medium">{y.name}</span>
                            <span className="ms-2 text-xs text-muted-foreground">{y.city}</span>
                          </span>
                          {yeshivaId === y.id && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {showSuggestions && suggestions.length === 0 && (
                  <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover p-3 text-center text-sm text-muted-foreground shadow-lg">
                    לא נמצאו ישיבות תואמות
                  </div>
                )}
              </div>
              <input type="hidden" required value={yeshivaId} onChange={() => {}} />
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">השם שלכם</span>
              <Input value={author} onChange={e => setAuthor(e.target.value)} maxLength={60} required placeholder="לדוגמה: יוסי כהן" />
            </label>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-foreground">דירוג</span>
            <StarRating value={rating} onChange={setRating} size={28} />
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">חוות הדעת</span>
            <Textarea value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={1000} required placeholder="ספרו על החוויה שלכם בישיבה..." />
            <span className="mt-1 block text-xs text-muted-foreground">{text.length}/1000</span>
          </label>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">⚠️ כל חוות דעת ממתינה לאישור מנהל לפני פרסום באתר.</p>
            <Button type="submit" disabled={!yeshivaId || !author.trim() || !rating || !text.trim()}>
              <Send className="ms-1 h-4 w-4" /> שליחה לאישור
            </Button>
          </div>
          {submitted && (
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
              תודה! חוות הדעת נשלחה ותפורסם לאחר אישור מנהל.
            </div>
          )}
        </form>

        {/* Yeshiva ratings summary */}
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">דירוגי הישיבות</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {yeshivot.map(y => {
              const { avg, count } = averageRating(reviews, y.id);
              return (
                <button
                  key={y.id}
                  onClick={() => setFilter(filter === y.id ? "" : y.id)}
                  className={`flex items-center justify-between rounded-xl border p-4 text-right transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    filter === y.id ? "border-primary bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div>
                    <div className="font-bold text-foreground">{y.name}</div>
                    <div className="text-xs text-muted-foreground">{y.city}</div>
                  </div>
                  <div className="text-left">
                    <div className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-foreground">{count ? avg.toFixed(1) : "—"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{count} חוות דעת</div>
                  </div>
                </button>
              );
            })}
          </div>
          {filter && (
            <button onClick={() => setFilter("")} className="mt-3 text-sm text-primary hover:underline">
              ניקוי סינון
            </button>
          )}
        </section>

        {/* Reviews list */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-foreground">
            כל חוות הדעת {filter && `— ${yeshivot.find(y => y.id === filter)?.name}`}
          </h2>
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
              עדיין אין חוות דעת מאושרות. היו הראשונים לשתף!
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map(r => {
                const y = yeshivot.find(x => x.id === r.yeshivaId);
                const mine = r.ownerToken === owner;
                return (
                  <article key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <header className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-foreground">{r.author}</div>
                        {y && (
                          <Link to="/yeshivot/$id" params={{ id: y.id }} className="text-xs text-primary hover:underline">
                            על {y.name}
                          </Link>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">{formatDate(r.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating value={r.rating} readOnly size={16} />
                        {mine && (
                          <button
                            onClick={() => confirm("למחוק את חוות הדעת שלך?") && remove(r.id)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            aria-label="מחק"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </header>
                    <p className="mt-3 leading-relaxed text-foreground whitespace-pre-line">{r.text}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
