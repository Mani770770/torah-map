import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { BookOpen, Loader2, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { getAccounts, forgetAccount, type KnownAccount } from "@/lib/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/page-transition";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { switch?: boolean } => ({
    switch: s.switch === true || s.switch === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "התחברות והרשמה — אינדקס הישיבות" },
      { name: "description", content: "התחברו או הירשמו כדי לשמור ישיבות מועדפות ולנהל את חוות הדעת שלכם." },
      { property: "og:title", content: "התחברות והרשמה — אינדקס הישיבות" },
      { property: "og:description", content: "התחברו או הירשמו כדי לשמור ישיבות מועדפות ולנהל את חוות הדעת שלכם." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const isSwitching = Route.useSearch().switch === true;
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [accounts, setAccounts] = useState<KnownAccount[]>([]);

  useEffect(() => { setAccounts(getAccounts()); }, []);

  useEffect(() => {
    if (ready && user) void navigate({ to: "/profile", replace: true });
  }, [ready, user, navigate]);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setInfo("שלחנו לך מייל אישור — יש ללחוץ על הקישור כדי להשלים את ההרשמה.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "אירעה שגיאה";
      setError(
        msg.includes("Invalid login credentials") ? "אימייל או סיסמה שגויים" :
        msg.includes("already registered") ? "כתובת האימייל כבר רשומה — נסה להתחבר" :
        msg,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageTransition>
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
          <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-primary">
            <BookOpen className="h-7 w-7" />
            <span className="text-xl font-bold">אינדקס הישיבות</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">
              {isSwitching ? "החלפת חשבון" : mode === "login" ? "התחברות" : "הרשמה"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSwitching
                ? "בחר חשבון מהרשימה או התחבר עם חשבון אחר."
                : mode === "login" ? "התחבר כדי לגשת למועדפים ולחוות הדעת שלך." : "צור חשבון ושמור את הישיבות שאהבת."}
            </p>

            {mode === "login" && accounts.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">חשבונות אחרונים במכשיר זה</p>
                {accounts.map(a => (
                  <div
                    key={a.email}
                    className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                      email.toLowerCase() === a.email.toLowerCase() ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => { setEmail(a.email); setPassword(""); setError(""); }}
                      className="flex flex-1 items-center gap-3 text-start"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-bold text-primary-foreground">
                        {(a.name || a.email).trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{a.name || a.email.split("@")[0]}</span>
                        <span dir="ltr" className="block truncate text-xs text-muted-foreground">{a.email}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`הסר את ${a.email} מהרשימה`}
                      onClick={() => { forgetAccount(a.email); setAccounts(getAccounts()); }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" /> יש להזין סיסמה כדי להתחבר לחשבון שנבחר
                </p>
              </div>
            )}


            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">שם מלא</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="ישראל ישראלי" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">אימייל</Label>
                <Input id="email" type="email" required dir="ltr" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">סיסמה</Label>
                <Input id="password" type="password" required minLength={6} dir="ltr" value={password} onChange={e => setPassword(e.target.value)} placeholder="לפחות 6 תווים" />
              </div>

              {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              {info && <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">{info}</p>}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "התחבר" : "הרשמה"}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "login" ? "אין לך חשבון?" : "כבר יש לך חשבון?"}{" "}
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "login" ? "הרשמה" : "התחברות"}
              </button>
            </p>
          </div>

          <Link to="/" className="mt-6 text-center text-sm text-muted-foreground hover:text-foreground">
            חזרה לדף הבית
          </Link>
        </div>
      </PageTransition>
    </div>
  );
}
