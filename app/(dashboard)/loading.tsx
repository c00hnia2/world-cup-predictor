export default function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Ładowanie">
      <div className="mb-10 space-y-3">
        <div className="h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-9 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full max-w-xl rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-2xl border border-zinc-200/70 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-4 h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="mt-6 h-12 w-full rounded-xl bg-zinc-100 dark:bg-zinc-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}
