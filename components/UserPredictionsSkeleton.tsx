export function UserPredictionsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Ładowanie typów">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-zinc-200/70 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-5 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-12 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
        </div>
      ))}
    </div>
  );
}
