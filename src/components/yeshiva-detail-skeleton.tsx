import { Skeleton } from "@/components/ui/skeleton";
import { SiteHeader } from "@/components/site-header";

export function YeshivaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 animate-in fade-in duration-300">
        {/* Quick search bar skeleton */}
        <div className="mb-4 rounded-xl border border-border bg-card p-3 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-9 w-28 shrink-0 rounded-full" />
          </div>
        </div>

        {/* Hero skeleton */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 to-primary/10 shadow-xl">
          <Skeleton className="h-72 w-full sm:h-96 rounded-none bg-primary/20" />
          <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="mt-3 h-10 w-3/4 rounded-lg" />
            <div className="mt-2 flex gap-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Skeleton className="h-7 w-32 rounded-lg" />
              <Skeleton className="mt-3 h-4 w-full rounded-full" />
              <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
              <Skeleton className="mt-2 h-4 w-4/6 rounded-full" />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-muted/40 p-3">
                    <Skeleton className="h-3 w-16 rounded-full" />
                    <Skeleton className="mt-1.5 h-5 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <Skeleton className="h-6 w-24 rounded-lg" />
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="mt-1 h-5 w-28 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="mt-1 h-5 w-36 rounded-full" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Gallery skeleton */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-7 w-36 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden pb-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-80 flex-shrink-0 rounded-xl" />
            ))}
          </div>
        </section>

        {/* Staff skeleton */}
        <section className="mt-10">
          <Skeleton className="mb-4 h-7 w-32 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="mt-1 h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex justify-center">
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
