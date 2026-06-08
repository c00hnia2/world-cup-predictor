"use client";

import { useState, useTransition } from "react";
import {
  resolveTournamentPredictions,
  saveTournamentResults,
} from "@/app/actions/admin";
import { PlayerSearchSelect } from "@/components/PlayerSearchSelect";
import { SearchSelect } from "@/components/SearchSelect";
import type { Player } from "@/types/player";
import type { TeamOption, TournamentResults } from "@/types/tournament_prediction";

interface AdminTournamentFormProps {
  teams: TeamOption[];
  players: Player[];
  results: TournamentResults | null;
}

export function AdminTournamentForm({
  teams,
  players,
  results,
}: AdminTournamentFormProps) {
  const [winnerId, setWinnerId] = useState(results?.actual_winner_id ?? "");
  const [topScorerId, setTopScorerId] = useState(
    results?.actual_top_scorer_id ?? "",
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isResolving, startResolveTransition] = useTransition();

  function handleSave() {
    setFeedback(null);

    startSaveTransition(async () => {
      const result = await saveTournamentResults(winnerId, topScorerId);

      setFeedback({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    });
  }

  function handleResolve() {
    setFeedback(null);

    startResolveTransition(async () => {
      const result = await resolveTournamentPredictions();

      setFeedback({
        type: result.success ? "success" : "error",
        message: result.message,
      });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SearchSelect
          id="admin_actual_winner_id"
          label="Faktyczny zwycięzca turnieju"
          options={teams}
          value={winnerId}
          onChange={setWinnerId}
          placeholder="Szukaj kraju…"
          emptyMessage="Brak pasujących krajów"
        />

        <PlayerSearchSelect
          id="admin_actual_top_scorer_id"
          label="Faktyczny król strzelców"
          players={players}
          value={topScorerId}
          onChange={setTopScorerId}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !winnerId || !topScorerId}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isSaving ? "Zapisywanie…" : "Zapisz wyniki turnieju"}
        </button>

        <button
          type="button"
          onClick={handleResolve}
          disabled={isResolving}
          className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-500 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
        >
          {isResolving ? "Rozliczanie…" : "Rozlicz typy turniejowe"}
        </button>
      </div>

      {results?.resolved_at ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Ostatnie rozliczenie:{" "}
          {new Date(results.resolved_at).toLocaleString("pl-PL", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className={`text-sm ${
            feedback.type === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </div>
  );
}
