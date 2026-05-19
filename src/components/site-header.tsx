import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

export function SiteHeader() {
  const path = useRouterState({ select: s => s.location.pathname });
  const links = [
    { to: "/", label: "בית" },
    { to: "/yeshivot", label: "אינדקס ישיבות" },
    { to: "/admin", label: "ניהול" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg font-bold">אינדקס הישיבות</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                path === l.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
