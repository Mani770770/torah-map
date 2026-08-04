import { useEffect, useRef, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { BookOpen, Menu, X, Undo2, RotateCcw, LogIn, User } from "lucide-react";
import { useFavorites } from "@/lib/favorites-store";
import { useAuth } from "@/lib/auth-store";
import { RestartLoader } from "@/components/restart-loader";


export function SiteHeader() {
  const path = useRouterState({ select: s => s.location.pathname });
  const router = useRouter();
  const { favorites } = useFavorites();
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [backClick, setBackClick] = useState(0);
  const [restartClick, setRestartClick] = useState(0);
  const [showRestartLoader, setShowRestartLoader] = useState(false);
  const prev = useRef(favorites.length);

  useEffect(() => {
    if (favorites.length !== prev.current) {
      prev.current = favorites.length;
      setPulse((n) => n + 1);
    }
  }, [favorites.length]);

  const goBack = () => {
    setBackClick((n) => n + 1);
    setTimeout(() => router.history.back(), 180);
  };

  const restart = () => {
    setRestartClick((n) => n + 1);
    setTimeout(() => setShowRestartLoader(true), 180);
  };

  const links = [
    { to: "/", label: "בית" },
    { to: "/yeshivot", label: "אינדקס ישיבות" },
    { to: "/favorites", label: "המועדפים שלי", badge: favorites.length },
    { to: "/reviews", label: "חוות דעת ודירוגים" },
    { to: "/admin", label: "ניהול" },
  ] as const;

  const renderLink = (l: typeof links[number], onClick?: () => void) => {
    const badge = "badge" in l ? l.badge : 0;
    const active = path === l.to;
    return (
      <Link
        key={l.to}
        to={l.to}
        onClick={onClick}
        className={`relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
          active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
        }`}
      >
        <span>{l.label}</span>
        {badge > 0 && (
          <span
            key={`${l.to}-${pulse}`}
            className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white animate-badge-pop"
          >
            {badge}
          </span>
        )}
      </Link>
    );
  };

  const ActionButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`inline-flex items-center gap-1 ${mobile ? "justify-center border-t border-border pt-2" : "me-2"}`}>
      <button
        type="button"
        onClick={goBack}
        aria-label="חזור לדף הקודם"
        title="חזור לדף הקודם"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-all hover:bg-muted hover:scale-105 active:scale-95 ${backClick > 0 ? "animate-btn-spin" : ""}`}
      >
        <Undo2 key={`back-${backClick}`} className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={restart}
        aria-label="ריסטארט לאתר"
        title="ריסטארט לאתר"
        className={`inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-all hover:bg-muted hover:scale-105 active:scale-95 ${restartClick > 0 ? "animate-btn-spin" : ""}`}
      >
        <RotateCcw key={`restart-${restartClick}`} className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-primary" onClick={() => setOpen(false)}>
            <BookOpen className="h-6 w-6" />
            <span className="text-lg font-bold">אינדקס הישיבות</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <nav className="flex items-center gap-1">
              {links.map(l => renderLink(l))}
            </nav>
            <ActionButtons />
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ActionButtons />
            <button
              type="button"
              aria-label={open ? "סגור תפריט" : "פתח תפריט"}
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-all hover:bg-muted hover:scale-105 active:scale-95"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={`overflow-hidden border-border bg-background transition-all duration-300 ease-out lg:hidden ${
            open ? "max-h-[28rem] border-t opacity-100" : "max-h-0 border-t-0 opacity-0"
          }`}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l, i) => (
              <div
                key={l.to}
                className={open ? "animate-fade-in" : ""}
                style={{ animationDelay: open ? `${i * 40}ms` : "0ms", animationFillMode: "both" }}
              >
                {renderLink(l, () => setOpen(false))}
              </div>
            ))}
            <div className={open ? "animate-fade-in" : ""} style={{ animationDelay: open ? "200ms" : "0ms", animationFillMode: "both" }}>
              <ActionButtons mobile />
            </div>
          </nav>
        </div>
      </header>
      {showRestartLoader && <RestartLoader onComplete={() => window.location.reload()} />}
    </>
  );
}
