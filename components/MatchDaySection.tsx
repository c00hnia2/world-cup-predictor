import { MatchCard } from "@/components/MatchCard";
import type { Match } from "@/types/match";
import type { ExistingMatchPrediction } from "@/types/prediction";

interface MatchDaySectionProps {
  label: string;
  matches: Match[];
  predictionsByMatchId?: Record<string, ExistingMatchPrediction>;
  variant?: "upcoming" | "finished";
}

function pluralizeMecz(count: number): string {
  if (count === 1) return "mecz";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "mecze";
  }
  return "meczów";
}

export function MatchDaySection({
  label,
  matches,
  predictionsByMatchId = {},
  variant = "upcoming",
}: MatchDaySectionProps) {
  return (
    <section className="scroll-mt-6">
      <div className="mb-6 flex items-end gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          {label}
        </h2>
        <span className="mb-1 shrink-0 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {matches.length} {pluralizeMecz(matches.length)}
        </span>
      </div>

      <ul className="grid list-none items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.map((match) => (
          <li key={match.id} className="h-fit w-full">
            <MatchCard
              match={match}
              showTimeOnly
              existingPrediction={predictionsByMatchId[match.id] ?? null}
              variant={variant}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
