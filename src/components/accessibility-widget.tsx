import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  X,
  Eye,
  Type,
  Contrast,
  Sparkles,
  Link2,
  RotateCcw,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { useA11y, loadA11y, type ColorMode } from "@/lib/a11y-store";

const colorModes: { value: ColorMode; label: string; hint: string }[] = [
  { value: "none", label: "רגיל", hint: "ללא שינוי צבעים" },
  { value: "red-green", label: "אדום–ירוק", hint: "התאמה לעיוורון אדום־ירוק" },
  { value: "blue-yellow", label: "כחול–צהוב", hint: "התאמה לעיוורון כחול־צהוב" },
  { value: "grayscale", label: "גווני אפור", hint: "ללא צבע כלל" },
];

function Toggle({
  label,
  desc,
  icon,
  on,
  onChange,
}: {
  label: string;
  desc: string;
  icon: React.ReactNode;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-colors ${
        on ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"
      }`}
    >
      <span className={`mt-0.5 ${on ? "text-primary" : "text-muted-foreground"}`}>{icon}</span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          on ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
        aria-hidden="true"
      >
        {on && <Check className="h-3.5 w-3.5" />}
      </span>
    </button>
  );
}

export function AccessibilityWidget() {
  const { settings, update, reset } = useA11y();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadA11y();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* פילטרים לעיוורי צבעים */}
      <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="a11y-red-green">
            <feColorMatrix
              type="matrix"
              values="0.8 0.2 0 0 0
                      0.26 0.74 0 0 0
                      0 0.14 0.86 0 0
                      0 0 0 1 0"
            />
          </filter>
          <filter id="a11y-blue-yellow">
            <feColorMatrix
              type="matrix"
              values="0.95 0.05 0 0 0
                      0 0.43 0.57 0 0
                      0 0.48 0.52 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "סגור תפריט נגישות" : "פתח תפריט נגישות"}
        aria-expanded={open}
        title="נגישות"
        className="fixed bottom-4 start-4 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <Accessibility className="h-7 w-7" />}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="הגדרות נגישות"
          className="fixed bottom-20 start-4 z-[60] max-h-[75vh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center gap-2">
            <Accessibility className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">הגדרות נגישות</h2>
          </div>

          <section className="mb-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <Eye className="h-4 w-4 text-primary" /> התאמות לעיוורי צבעים
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {colorModes.map((m) => {
                const active = settings.colorMode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    aria-pressed={active}
                    title={m.hint}
                    onClick={() => update({ colorMode: m.value })}
                    className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {active && <Check className="me-1 inline h-3 w-3" aria-hidden="true" />}
                    {m.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mb-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
              <Type className="h-4 w-4 text-primary" /> גודל טקסט
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="הקטן טקסט"
                onClick={() => update({ fontScale: Math.max(0, settings.fontScale - 1) })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex-1 text-center text-sm font-semibold text-foreground">
                {settings.fontScale === 0 ? "רגיל" : `+${settings.fontScale}`}
              </span>
              <button
                type="button"
                aria-label="הגדל טקסט"
                onClick={() => update({ fontScale: Math.min(4, settings.fontScale + 1) })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <div className="space-y-2">
            <Toggle
              label="גופן קריא"
              desc="גופן ברור יותר לקריאה"
              icon={<Type className="h-4 w-4" />}
              on={settings.readableFont}
              onChange={(v) => update({ readableFont: v })}
            />
            <Toggle
              label="מרווחים גדולים"
              desc="ריווח בין שורות ואותיות"
              icon={<Type className="h-4 w-4" />}
              on={settings.spacing}
              onChange={(v) => update({ spacing: v })}
            />
            <Toggle
              label="ניגודיות גבוהה"
              desc="שחור־לבן חד וברור"
              icon={<Contrast className="h-4 w-4" />}
              on={settings.highContrast}
              onChange={(v) => update({ highContrast: v })}
            />
            <Toggle
              label="הפחתת אנימציות"
              desc="ביטול תנועות ומעברים"
              icon={<Sparkles className="h-4 w-4" />}
              on={settings.reduceMotion}
              onChange={(v) => update({ reduceMotion: v })}
            />
            <Toggle
              label="הדגשת קישורים וכפתורים"
              desc="מסגרת וקו תחתון ברורים"
              icon={<Link2 className="h-4 w-4" />}
              on={settings.highlightLinks}
              onChange={(v) => update({ highlightLinks: v })}
            />
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" /> איפוס הגדרות נגישות
          </button>
        </div>
      )}
    </>
  );
}
