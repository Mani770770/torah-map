import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-store";

export function SiteHeader() {
  const path = useRouterState({ select: s => s.location.pathname });
  const { favorites } = useFavorites();
  const links = [
    { to: "/", label: "בית" },
    { to: "/yeshivot", label: "אינדקס ישיבות" },
    { to: "/favorites", label: "המועדפים שלי", icon: Heart, badge: favorites.length },
    { to: "/reviews", label: "חוות דעת ודירוגים" },
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
          {links.map(l => {
            const Icon = "icon" in l ? l.icon : null;
            const badge = "badge" in l ? l.badge : 0;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  path === l.to
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {Icon && <Icon className={`h-4 w-4 ${badge > 0 ? "fill-rose-500 text-rose-500" : ""}`} />}
                <span className="hidden sm:inline">{l.label}</span>
                {badge > 0 && (
                  <span className="ms-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
