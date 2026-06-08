import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MapPin, Users, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/favorite-button";
import { useYeshivot } from "@/lib/yeshivot-store";
import { useFavorites } from "@/lib/favorites-store";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "המועדפים שלי — אינדקס הישיבות" },
      { name: "description", content: "הישיבות ששמרת במועדפים." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { list, loaded } = useYeshivot();
  const { favorites } = useFavorites();
  const items = list.filter(y => favorites.includes(y.id));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageTransition>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <Heart className="h-5 w-5 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">המועדפים שלי</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {loaded ? `${items.length} ישיבות שמורות` : "טוען..."}
              </p>
            </div>
          </div>

          {loaded && items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Heart className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-foreground">עדיין לא הוספת ישיבות למועדפים</h2>
              <p className="mt-2 text-sm text-muted-foreground">לחץ על אייקון הלב בכל ישיבה כדי לשמור אותה כאן.</p>
              <Button asChild className="mt-6">
                <Link to="/yeshivot">עבור לאינדקס הישיבות</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(y => (
                <div key={y.id} className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <FavoriteButton id={y.id} className="absolute top-3 end-3 z-10" />
                  <Link to="/yeshivot/$id" params={{ id: y.id }} className="block">
                    {y.image ? (
                      <img src={y.image} alt={y.name} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-primary/90 to-primary text-primary-foreground">
                        <BookOpen className="h-12 w-12 opacity-80" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-primary">{y.name}</h3>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {y.sector}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{y.city}</span>
                        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{y.gender}</span>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{y.description}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
