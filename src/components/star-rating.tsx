import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}

export function StarRating({ value, onChange, size = 20, readOnly = false }: Props) {
  return (
    <div className="inline-flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= Math.round(value);
        const Icon = (
          <Star
            className={`transition-colors ${filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
            style={{ width: size, height: size }}
          />
        );
        if (readOnly || !onChange) return <span key={n}>{Icon}</span>;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="rounded p-0.5 transition-transform hover:scale-110"
            aria-label={`${n} כוכבים`}
          >
            {Icon}
          </button>
        );
      })}
    </div>
  );
}
