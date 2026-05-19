import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useYeshivot, SECTORS, GENDERS, type Yeshiva, type Sector, type Gender } from "@/lib/yeshivot-store";

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
const empty: Draft = { name: "", sector: "ליטאי", gender: "בנים", city: "", description: "", image: "" };

function AdminPage() {
  const { list, add, update, remove } = useYeshivot();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(empty);
  const [showForm, setShowForm] = useState(false);

  const startEdit = (y: Yeshiva) => {
    setEditing(y.id);
    const { id: _id, ...rest } = y;
    setDraft(rest);
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
          <form onSubmit={submit} className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {editing ? "עריכת ישיבה" : "הוספת ישיבה חדשה"}
              </h2>
              <button type="button" onClick={cancel} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

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
              <div className="sm:col-span-2">
                <Field label="תיאור">
                  <Textarea
                    value={draft.description}
                    onChange={e => setDraft({ ...draft, description: e.target.value })}
                    rows={3}
                    maxLength={500}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="תמונה (קישור או העלאה מהמחשב)">
                  <div className="space-y-2">
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={draft.image ?? ""}
                      onChange={e => setDraft({ ...draft, image: e.target.value })}
                    />
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        className="block w-full text-sm text-muted-foreground file:ms-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground hover:file:bg-primary/90"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onload = () => setDraft(d => ({ ...d, image: String(r.result) }));
                          r.readAsDataURL(f);
                        }}
                      />
                      {draft.image && (
                        <button type="button" onClick={() => setDraft({ ...draft, image: "" })} className="text-sm text-muted-foreground hover:text-destructive">הסר</button>
                      )}
                    </div>
                    {draft.image && (
                      <img src={draft.image} alt="תצוגה מקדימה" className="mt-2 h-32 w-auto rounded-md border border-border object-cover" />
                    )}
                  </div>
                </Field>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button type="submit">{editing ? "שמירה" : "הוספה"}</Button>
              <Button type="button" variant="outline" onClick={cancel}>ביטול</Button>
            </div>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-border bg-muted/40 text-foreground">
              <tr>
                <Th>שם</Th>
                <Th>מגזר</Th>
                <Th>מגדר</Th>
                <Th>עיר</Th>
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
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">אין ישיבות באינדקס</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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
