import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RestartLoader({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const totalPages = 7;

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 2200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const next = Math.min(1, elapsed / duration);
      setProgress(next);
      if (next < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onComplete?.();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const filledPages = Math.max(1, Math.min(totalPages, Math.floor(progress * totalPages) + 1));

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      <div className="relative h-40 w-56" style={{ perspective: "800px" }} aria-hidden>
        {/* Book cover */}
        <div className="absolute inset-0 rounded-r-lg bg-primary shadow-2xl" />
        <div className="absolute left-0 top-0 h-full w-2 bg-primary/40" />

        {/* Inner cover */}
        <div className="absolute inset-y-1 left-1 right-1">
          <div className="h-full w-full rounded-r bg-primary/10" />
        </div>

        {Array.from({ length: totalPages }).map((_, i) => {
          const isActive = i < filledPages;
          const delay = i * 70;
          const stackOffset = i * -3;
          return (
            <div
              key={i}
              className={cn(
                "absolute right-1 top-1 h-[calc(100%-8px)] w-[calc(100%-12px)] origin-right rounded-r border border-border/40 bg-card shadow-md transition-all duration-500 ease-out",
                isActive
                  ? "opacity-100 translate-x-0 translate-y-0 rotate-0"
                  : "opacity-0 translate-x-8 translate-y-4 rotate-12"
              )}
              style={{
                transitionDelay: `${delay}ms`,
                transform: isActive ? `translateY(${stackOffset}px)` : undefined,
              }}
            >
              <div className="absolute inset-0 flex flex-col gap-1.5 p-3">
                <div className="h-2 w-3/4 rounded bg-muted" />
                <div className="h-2 w-1/2 rounded bg-muted" />
                <div className="h-2 w-5/6 rounded bg-muted" />
                <div className="h-2 w-2/3 rounded bg-muted" />
              </div>
              <div className="absolute inset-y-0 right-0 w-1 rounded-r bg-gradient-to-l from-primary/20 to-transparent" />
            </div>
          );
        })}

        {/* Progress bar */}
        <div className="absolute -bottom-6 left-1/2 h-1.5 w-44 -translate-x-1/2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-14 text-center">
        <p className="text-lg font-semibold text-foreground">טוענים מחדש...</p>
        <p className="mt-1 text-sm text-muted-foreground">{Math.round(progress * 100)}%</p>
      </div>
    </div>
  );
}
