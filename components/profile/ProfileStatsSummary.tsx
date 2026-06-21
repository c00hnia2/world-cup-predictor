interface ProfileStatsSummaryProps {
  displayName: string;
  globalRank: number | null;
  totalPoints: number;
  exactScoresCount: number;
  correctOutcomesCount: number;
  finishedPredictions: number;
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProfileStatsSummary({
  displayName,
  globalRank,
  totalPoints,
  exactScoresCount,
  correctOutcomesCount,
  finishedPredictions,
}: ProfileStatsSummaryProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Zalogowany gracz
          </p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {displayName}
          </h2>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Rozegrane typy:{" "}
          <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {finishedPredictions}
          </span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pozycja w rankingu"
          value={globalRank ? `#${globalRank}` : "—"}
        />
        <StatCard
          label="Suma punktów"
          value={String(totalPoints)}
        />
        <StatCard
          label="Dokładne wyniki"
          value={String(exactScoresCount)}
          hint="🎯 trafione dokładne wyniki"
        />
        <StatCard
          label="Trafiony zwycięzca/remis"
          value={String(correctOutcomesCount)}
          hint="✔️ bez dokładnego wyniku"
        />
      </div>
    </section>
  );
}
