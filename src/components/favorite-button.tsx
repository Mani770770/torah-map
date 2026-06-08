import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites-store";
import { cn } from "@/lib/utils";

export function FavoriteButton({ id, className, size = "md" }: { id: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(id);
  const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const icon = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      aria-label={fav ? "הסר ממועדפים" : "הוסף למועדפים"}
      aria-pressed={fav}
      className={cn(
        "inline-flex items-center justify-center rounded-full border bg-background/90 backdrop-blur transition-all hover:scale-110 shadow-sm",
        dims,
        fav ? "border-rose-300 text-rose-500" : "border-border text-muted-foreground hover:text-rose-500 hover:border-rose-300",
        className,
      )}
    >
      <Heart className={cn(icon, fav && "fill-rose-500")} />
    </button>
  );
}
