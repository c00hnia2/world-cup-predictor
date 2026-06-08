import { formatKickoffTime, formatKickoffTimeOnly } from "@/lib/format-kickoff";
import {
  formatTeamDisplayName,
  teamDisplayTitle,
} from "@/lib/format-team-name";
import { getCountryCode } from "@/lib/country-codes";
import { isPredictionLocked } from "@/lib/prediction-lock";
import { PredictionForm } from "@/components/PredictionForm";
import { OtherPredictions } from "@/components/OtherPredictions";
import { TeamFlag } from "@/components/TeamFlag";
import type { Match } from "@/types/match";
import type { ExistingMatchPrediction } from "@/types/prediction";

interface MatchCardProps {
  match: Match;
  /** Gdy mecz jest w sekcji dnia — na karcie tylko godzina. */
  showTimeOnly?: boolean;
  existingPrediction?: ExistingMatchPrediction | null;
}

interface TeamLabelProps {
  name: string;
  rawName: string;
  align: "left" | "right";
}

function TeamLabel({ name, rawName, align }: TeamLabelProps) {
  const title = teamDisplayTitle(rawName, name);
  const code = getCountryCode(rawName) ?? getCountryCode(name);
  const isRight = align === "right";

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${isRight ? "justify-end" : "justify-start"}`}
    >
      {code && !isRight ? (
        <TeamFlag code={code} teamName={rawName} />
      ) : null}
      <span
        className="truncate text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-50"
        title={title}
      >
        {name}
      </span>
      {code && isRight ? (
        <TeamFlag code={code} teamName={rawName} />
      ) : null}
      {!code ? (
        <span
          className="inline-flex h-5 w-8 shrink-0 items-center justify-center rounded-sm bg-zinc-100 text-zinc-400 shadow-sm dark:bg-zinc-800 dark:text-zinc-500"
          title="Brak flagi w słowniku"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-3.5 w-3.5"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
          </svg>
        </span>
      ) : null}
    </div>
  );
}

export function MatchCard({
  match,
  showTimeOnly = false,
  existingPrediction = null,
}: MatchCardProps) {
  const teamARaw = match.team_a?.name ?? "—";
  const teamBRaw = match.team_b?.name ?? "—";
  const teamA = formatTeamDisplayName(teamARaw);
  const teamB = formatTeamDisplayName(teamBRaw);
  const isLocked = isPredictionLocked(match.kickoff_time);
  const hasExistingPrediction = existingPrediction !== null;

  return (
    <article className="group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm ring-1 ring-transparent transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:shadow-xl hover:shadow-emerald-900/5 hover:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500/30 dark:hover:shadow-black/30 sm:p-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2">
        <TeamLabel name={teamA} rawName={teamARaw} align="right" />
        <span className="shrink-0 px-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          vs
        </span>
        <TeamLabel name={teamB} rawName={teamBRaw} align="left" />
      </div>

      <time
        dateTime={match.kickoff_time}
        className="text-center text-xs text-zinc-500 dark:text-zinc-400"
      >
        {showTimeOnly
          ? formatKickoffTimeOnly(match.kickoff_time)
          : formatKickoffTime(match.kickoff_time)}
      </time>

      <div className="mt-auto border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
        <PredictionForm
          matchId={match.id}
          isLocked={isLocked}
          initialScoreA={existingPrediction?.predicted_score_a}
          initialScoreB={existingPrediction?.predicted_score_b}
          hasExistingPrediction={hasExistingPrediction}
        />
      </div>

      <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800/80">
        <OtherPredictions matchId={match.id} isLocked={isLocked} />
      </div>
    </article>
  );
}
