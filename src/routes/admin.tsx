import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Trash2, Plus, X, Upload, UserPlus, Check, EyeOff, Eye, MessageSquare } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useYeshivot, SECTORS, GENDERS, PRICE_PERIODS, formatPrice, type Yeshiva, type Sector, type Gender, type StaffMember } from "@/lib/yeshivot-store";
import { useReviews, formatDate, type Review } from "@/lib/reviews-store";
import { StarRating } from "@/components/star-rating";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ניהול ישיבות — אינדקס" },
      { name: "description", content: "פאנל ניהול להוספה, עריכה ומחיקה של ישיבות מהאינדקס." },
    ],
  }),
  component: AdminPage,
});

type Draft = Omit<Yeshiva, "id">;
const empty: Draft = {
  name: "", sector: "ליטאי", gender: "בנים", city: "", description: "",
  image: "", phone: "", website: "", address: "", mapsUrl: "", ages: "", dorm: false, type: "",
  price: null, pricePeriod: "חודשי", priceNote: "",
  gallery: [], staff: [],
};

function fileToDataUrl(f: File): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(f);
  });
}

function AdminPage() {
  const { list, add, update, remove } = useYeshivot();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [showForm, setShowForm] = useState(false);

  const startEdit = (y: Yeshiva) => {
    setEditing(y.id);
    const { id: _id, ...rest } = y;
    setDraft({ ...empty, ...rest, gallery: rest.gallery ?? [], staff: rest.staff ?? [] });
    setShowForm(true);
  };
  const startAdd = () => { setEditing(null); setDraft(empty); setShowForm(true); };
  const cancel = () => { setShowForm(false); setEditing(null); setDraft(empty); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim() || !draft.city.trim()) return;
    if (editing) update(editing, draft);
    else add(draft);
    cancel();
  };

  const addGalleryFiles = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setDraft(d => ({ ...d, gallery: [...(d.gallery ?? []), ...urls] }));
  };
  const removeGalleryAt = (i: number) =>
    setDraft(d => ({ ...d, gallery: (d.gallery ?? []).filter((_, idx) => idx !== i) }));

  const addStaff = () =>
    setDraft(d => ({ ...d, staff: [...(d.staff ?? []), { id: crypto.randomUUID(), name: "", role: "", image: "", phone: "" }] }));
  const updateStaff = (id: string, patch: Partial<StaffMember>) =>
    setDraft(d => ({ ...d, staff: (d.staff ?? []).map(s => s.id === id ? { ...s, ...patch } : s) }));
  const removeStaff = (id: string) =>
    setDraft(d => ({ ...d, staff: (d.staff ?? []).filter(s => s.id !== id) }));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ניהול ישיבות</h1>
            <p className="mt-1 text-muted-foreground">הוספה, עריכה ומחיקה של ישיבות באינדקס</p>
          </div>
          {!showForm && (
            <Button onClick={startAdd}>
              <Plus className="ms-1 h-4 w-4" /> הוספת ישיבה
            </Button>
          )}
        </div>

        {showForm && (
          <form onSubmit={submit} className="mb-8 space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {editing ? "עריכת ישיבה" : "הוספת ישיבה חדשה"}
              </h2>
              <button type="button" onClick={cancel} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Basic */}
            <Section title="פרטים בסיסיים">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="שם הישיבה">
                  <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} required maxLength={100} />
                </Field>
                <Field label="עיר">
                  <Input value={draft.city} onChange={e => setDraft({ ...draft, city: e.target.value })} required maxLength={50} />
                </Field>
                <Field label="מגזר / זרם">
                  <select
                    value={draft.sector}
                    onChange={e => setDraft({ ...draft, sector: e.target.value as Sector })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="מגדר">
                  <select
                    value={draft.gender}
                    onChange={e => setDraft({ ...draft, gender: e.target.value as Gender })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {GENDERS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </Field>
                <Field label="טלפון">
                  <Input dir="ltr" value={draft.phone ?? ""} onChange={e => setDraft({ ...draft, phone: e.target.value })} placeholder="02-1234567" />
                </Field>
                <Field label="אתר רשמי">
                  <Input dir="ltr" type="url" value={draft.website ?? ""} onChange={e => setDraft({ ...draft, website: e.target.value })} placeholder="https://..." />
                </Field>
                <Field label="כתובת מלאה">
                  <Input value={draft.address ?? ""} onChange={e => setDraft({ ...draft, address: e.target.value })} placeholder="רחוב, מספר, שכונה" />
                </Field>
                <Field label="קישור Google Maps">
                  <Input dir="ltr" type="url" value={draft.mapsUrl ?? ""} onChange={e => setDraft({ ...draft, mapsUrl: e.target.value })} placeholder="https://maps.google.com/..." />
                </Field>
                <Field label="גילאים">
                  <Input value={draft.ages ?? ""} onChange={e => setDraft({ ...draft, ages: e.target.value })} placeholder="לדוגמה: 14-18" />
                </Field>
                <Field label="סוג ישיבה">
                  <Input value={draft.type ?? ""} onChange={e => setDraft({ ...draft, type: e.target.value })} placeholder="ישיבה קטנה / גדולה / הסדר וכו'" />
                </Field>
                <Field label="עלות הישיבה (₪)">
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    value={draft.price ?? ""}
                    onChange={e => setDraft({ ...draft, price: e.target.value === "" ? null : Number(e.target.value) })}
                    placeholder="לדוגמה: 1500"
                  />
                </Field>
                <Field label="תקופת התשלום">
                  <select
                    value={draft.pricePeriod ?? "חודשי"}
                    onChange={e => setDraft({ ...draft, pricePeriod: e.target.value as "חודשי" | "שנתי" })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {PRICE_PERIODS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="הערה על העלות (אופציונלי)">
                    <Input
                      value={draft.priceNote ?? ""}
                      onChange={e => setDraft({ ...draft, priceNote: e.target.value })}
                      placeholder="לדוגמה: כולל פנימייה וארוחות"
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={!!draft.dorm}
                      onChange={e => setDraft({ ...draft, dorm: e.target.checked })}
                      className="h-4 w-4 rounded border-input"
                    />
                    כוללת פנימייה
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <Field label="תיאור">
                    <Textarea
                      value={draft.description}
                      onChange={e => setDraft({ ...draft, description: e.target.value })}
                      rows={4}
                      maxLength={1000}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Main image */}
            <Section title="תמונה ראשית">
              <div className="space-y-2">
                <Input
                  type="url"
                  placeholder="קישור לתמונה https://..."
                  value={draft.image ?? ""}
                  onChange={e => setDraft({ ...draft, image: e.target.value })}
                />
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-muted-foreground file:ms-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const url = await fileToDataUrl(f);
                      setDraft(d => ({ ...d, image: url }));
                    }}
                  />
                  {draft.image && (
                    <button type="button" onClick={() => setDraft({ ...draft, image: "" })} className="text-sm text-muted-foreground hover:text-destructive">הסר</button>
                  )}
                </div>
                {draft.image && (
                  <img src={draft.image} alt="תצוגה מקדימה" className="mt-2 h-40 w-auto rounded-md border border-border object-cover" />
                )}
              </div>
            </Section>

            {/* Gallery */}
            <Section title="גלריית תמונות">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground hover:border-primary hover:text-primary">
                <Upload className="h-4 w-4" />
                <span>בחירת תמונות מהמחשב (ניתן לבחור כמה)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => { addGalleryFiles(e.target.files); e.target.value = ""; }}
                />
              </label>
              {(draft.gallery ?? []).length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(draft.gallery ?? []).map((src, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-md border border-border">
                      <img src={src} alt={`גלריה ${i + 1}`} className="h-28 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryAt(i)}
                        className="absolute top-1 end-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="הסר תמונה"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Staff */}
            <Section title="רבנים וצוות">
              <div className="space-y-3">
                {(draft.staff ?? []).map(s => (
                  <div key={s.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">
                        {s.image ? (
                          <img src={s.image} alt={s.name || "צוות"} className="h-16 w-16 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <UserPlus className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="grid flex-1 gap-2 sm:grid-cols-2">
                        <Input placeholder="שם מלא" value={s.name} onChange={e => updateStaff(s.id, { name: e.target.value })} />
                        <Input placeholder="תפקיד (ראש ישיבה, משגיח...)" value={s.role ?? ""} onChange={e => updateStaff(s.id, { role: e.target.value })} />
                        <Input dir="ltr" placeholder="טלפון" value={s.phone ?? ""} onChange={e => updateStaff(s.id, { phone: e.target.value })} className="sm:col-span-2" />
                        <input
                          type="file"
                          accept="image/*"
                          className="col-span-full block w-full text-xs text-muted-foreground file:ms-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1.5 file:text-secondary-foreground"
                          onChange={async e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const url = await fileToDataUrl(f);
                            updateStaff(s.id, { image: url });
                            e.target.value = "";
                          }}
                        />
                      </div>
                      <button type="button" onClick={() => removeStaff(s.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="הסר">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addStaff}>
                  <Plus className="ms-1 h-4 w-4" /> הוספת רב / מורה
                </Button>
              </div>
            </Section>

            <div className="flex gap-2">
              <Button type="submit">{editing ? "שמירה" : "הוספה"}</Button>
              <Button type="button" variant="outline" onClick={cancel}>ביטול</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="border-b border-border bg-muted/40 text-foreground">
              <tr>
                <Th>שם</Th>
                <Th>מגזר</Th>
                <Th>מגדר</Th>
                <Th>עיר</Th>
                <Th>עלות</Th>
                <Th className="text-center">פעולות</Th>
              </tr>
            </thead>
            <tbody>
              {list.map(y => (
                <tr key={y.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <Td className="font-medium text-foreground">{y.name}</Td>
                  <Td>{y.sector}</Td>
                  <Td>{y.gender}</Td>
                  <Td>{y.city}</Td>
                  <Td>{formatPrice(y) ?? "—"}</Td>
                  <Td>
                    <div className="flex justify-center gap-1">
                      <button onClick={() => startEdit(y)} className="rounded-md p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary" aria-label="עריכה">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => confirm(`למחוק את "${y.name}"?`) && remove(y.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="מחיקה">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">אין ישיבות באינדקס</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <ReviewsAdmin />
      </div>
    </div>
  );
}

function ReviewsAdmin() {
  const { list: yeshivot } = useYeshivot();
  const { list: reviews, remove, setStatus } = useReviews();
  const [tab, setTab] = useState<"pending" | "approved" | "hidden" | "all">("pending");

  const filtered = useMemo(
    () => (tab === "all" ? reviews : reviews.filter(r => r.status === tab)),
    [reviews, tab],
  );

  const counts = {
    pending: reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    hidden: reviews.filter(r => r.status === "hidden").length,
    all: reviews.length,
  };

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "pending", label: `ממתינות (${counts.pending})` },
    { key: "approved", label: `מאושרות (${counts.approved})` },
    { key: "hidden", label: `מוסתרות (${counts.hidden})` },
    { key: "all", label: `הכל (${counts.all})` },
  ];

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">ניהול חוות דעת ודירוגים</h2>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px rounded-t-md border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          אין חוות דעת בקטגוריה זו.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r: Review) => {
            const y = yeshivot.find(x => x.id === r.yeshivaId);
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground">{r.author}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-medium text-primary">{y?.name || "ישיבה נמחקה"}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <StarRating value={r.rating} readOnly size={14} />
                      <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-foreground">{r.text}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    {r.status !== "approved" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "approved")}>
                        <Check className="ms-1 h-3.5 w-3.5" /> אישור
                      </Button>
                    )}
                    {r.status !== "hidden" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "hidden")}>
                        <EyeOff className="ms-1 h-3.5 w-3.5" /> הסתרה
                      </Button>
                    )}
                    {r.status === "hidden" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "pending")}>
                        <Eye className="ms-1 h-3.5 w-3.5" /> שחזור
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => confirm("למחוק את חוות הדעת לצמיתות?") && remove(r.id)}>
                      <Trash2 className="ms-1 h-3.5 w-3.5" /> מחיקה
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Review["status"] }) {
  const map = {
    pending: { label: "ממתין", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    approved: { label: "מאושר", cls: "bg-green-500/15 text-green-700 dark:text-green-400" },
    hidden: { label: "מוסתר", cls: "bg-muted text-muted-foreground" },
  } as const;
  const s = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${s.cls}`}>{s.label}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-right font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-muted-foreground ${className}`}>{children}</td>;
}
