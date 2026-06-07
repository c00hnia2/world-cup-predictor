import { formatKickoffTime } from "@/lib/format-kickoff";
import {
  formatTeamDisplayName,
  teamDisplayTitle,
} from "@/lib/format-team-name";
import { getCountryCode } from "@/lib/country-codes";
import { calculatePoints } from "@/lib/scoring";
import { TeamFlag } from "@/components/TeamFlag";
import type { UserPredictionEntry } from "@/types/prediction";

interface UserPredictionsListProps {
  predictions: UserPredictionEntry[];
}

interface TeamRowProps {
  name: string;
  rawName: string;
}

function TeamRow({ name, rawName }: TeamRowProps) {
  const code = getCountryCode(rawName) ?? getCountryCode(name);

  return (
    <div className="flex min-w-0 items-center gap-2">
      {code ? <TeamFlag code={code} teamName={rawName} /> : null}
      <span
        className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50"
        title={teamDisplayTitle(rawName, name)}
      >
        {name}
      </span>
    </div>
  );
}

function getPointsLabel(points: number): string {
  if (points === 3) return "Trafiony wynik!";
  if (points === 1) return "Trafiony rezultat";
  return "Nietrafione";
}

function PredictionCard({ prediction }: { prediction: UserPredictionEntry }) {
  const match = prediction.match!;

  const teamARaw = match.team_a?.name ?? "—";
  const teamBRaw = match.team_b?.name ?? "—";
  const teamA = formatTeamDisplayName(teamARaw);
  const teamB = formatTeamDisplayName(teamBRaw);
  const isFinished = match.status === "finished";
  const hasOfficialScore =
    isFinished &&
    typeof match.score_a === "number" &&
    typeof match.score_b === "number";

  const points =
    isFinished && hasOfficialScore
      ? (prediction.points_earned ??
        calculatePoints(
          prediction.predicted_score_a,
          prediction.predicted_score_b,
          match.score_a!,
          match.score_b!,
        ))
      : null;

  return (
    <article className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <time
          dateTime={match.kickoff_time}
          className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
        >
          {formatKickoffTime(match.kickoff_time)}
        </time>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            isFinished
              ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          {isFinished ? "Rozegrany" : "Nadchodzący"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <TeamRow name={teamA} rawName={teamARaw} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          vs
        </span>
        <div className="flex justify-end">
          <TeamRow name={teamB} rawName={teamBRaw} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50/80 px-4 py-3 dark:bg-emerald-950/20">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Twój typ:{" "}
          <span className="font-mono text-base text-emerald-700 dark:text-emerald-300">
            {prediction.predicted_score_a} – {prediction.predicted_score_b}
          </span>
        </p>

        {hasOfficialScore ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Wynik:{" "}
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {match.score_a} – {match.score_b}
            </span>
          </p>
        ) : null}
      </div>

      {isFinished && points !== null ? (
        <p
          className={`mt-3 text-sm font-medium ${
            points > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {points} pkt — {getPointsLabel(points)}
        </p>
      ) : null}
    </article>
  );
}

export function UserPredictionsList({ predictions }: UserPredictionsListProps) {
  if (predictions.length === 0) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
      >
        Nie masz jeszcze zapisanych typów. Przejdź do listy meczów, aby zacząć
        grę!
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {predictions.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} />
      ))}
    </div>
  );
}
