export function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl bg-white shadow-premium ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10">
          <div className="h-52 animate-pulse bg-slate-200 dark:bg-white/10" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-4 w-2/5 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-10 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
