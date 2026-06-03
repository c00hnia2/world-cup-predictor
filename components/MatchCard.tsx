import { formatKickoffTime, formatKickoffTimeOnly } from "@/lib/format-kickoff";
import { PredictionForm } from "@/components/PredictionForm";
import type { Match } from "@/types/match";

interface MatchCardProps {
  match: Match;
  /** Gdy mecz jest w sekcji dnia — na karcie tylko godzina. */
  showTimeOnly?: boolean;
}

export function MatchCard({ match, showTimeOnly = false }: MatchCardProps) {
  const teamA = match.team_a?.name ?? "—";
  const teamB = match.team_b?.name ?? "—";

  return (
    <article className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-3xl border border-zinc-200/70 bg-white p-6 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:shadow-xl hover:shadow-emerald-900/5 hover:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/30 dark:hover:shadow-black/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {teamA}
        </span>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          vs
        </span>
        <span className="truncate text-right text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {teamB}
        </span>
      </div>

      <time
        dateTime={match.kickoff_time}
        className="text-center text-sm text-zinc-500 dark:text-zinc-400"
      >
        {showTimeOnly
          ? formatKickoffTimeOnly(match.kickoff_time)
          : formatKickoffTime(match.kickoff_time)}
      </time>

      <div className="mt-auto border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
        <PredictionForm matchId={match.id} />
      </div>
    </article>
  );
}
