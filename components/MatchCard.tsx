import { formatKickoffTime, formatKickoffTimeOnly } from "@/lib/format-kickoff";
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
    <article className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {teamA}
        </span>
        <span className="shrink-0 text-sm font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
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
    </article>
  );
}
