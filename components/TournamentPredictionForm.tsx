"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitTournamentPrediction } from "@/app/actions/tournament";
import { PlayerSearchSelect } from "@/components/PlayerSearchSelect";
import { SearchSelect } from "@/components/SearchSelect";
import { getTournamentLockMessage } from "@/lib/tournament-lock";
import type { Player } from "@/types/player";
import type {
  TeamOption,
  TournamentPrediction,
  TournamentPredictionFormState,
} from "@/types/tournament_prediction";

interface TournamentPredictionFormProps {
  teams: TeamOption[];
  players: Player[];
  prediction: TournamentPrediction | null;
  isLocked: boolean;
}

const initialState: TournamentPredictionFormState = {
  status: "idle",
  message: "",
};

function SubmitButton({
  hasExistingPrediction,
  disabled,
}: {
  hasExistingPrediction: boolean;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-busy={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 outline-none transition-all duration-200 hover:from-emerald-400 hover:to-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-90"
    >
      {pending
        ? "Zapisywanie…"
        : hasExistingPrediction
          ? "Aktualizuj typ turniejowy"
          : "Zapisz typ turniejowy"}
    </button>
  );
}

function LockedTournamentView({
  prediction,
}: {
  prediction: TournamentPrediction | null;
}) {
  return (
    <div className="flex flex-col gap-3">
      {prediction ? (
        <div className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300 sm:grid-cols-2">
          <p>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              Zwycięzca:
            </span>{" "}
            {prediction.predicted_winner?.name ?? "—"}
          </p>
          <p>
            <span className="font-medium text-zinc-500 dark:text-zinc-400">
              Król strzelców:
            </span>{" "}
            {prediction.predicted_top_scorer?.name ?? "—"}
          </p>
          {prediction.points_earned !== null ? (
            <p className="sm:col-span-2 text-emerald-700 dark:text-emerald-300">
              Punkty za typ turniejowy: {prediction.points_earned}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Nie zdążyłeś z typowaniem przed rozpoczęciem turnieju.
        </p>
      )}
      <p
        role="status"
        className="text-xs font-medium text-amber-700 dark:text-amber-400"
      >
        {getTournamentLockMessage()}
      </p>
    </div>
  );
}

export function TournamentPredictionForm({
  teams,
  players,
  prediction,
  isLocked,
}: TournamentPredictionFormProps) {
  const [state, formAction] = useActionState(
    submitTournamentPrediction,
    initialState,
  );
  const [winnerId, setWinnerId] = useState(
    prediction?.predicted_winner_id ?? "",
  );
  const [topScorerId, setTopScorerId] = useState(
    prediction?.predicted_top_scorer_id ?? "",
  );

  const hasExistingPrediction = Boolean(prediction);
  const formKey = `${prediction?.id ?? "new"}-${isLocked}`;

  if (isLocked) {
    return <LockedTournamentView prediction={prediction} />;
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <SearchSelect
          id="predicted_winner_id"
          label="Zwycięzca mundialu"
          options={teams}
          value={winnerId}
          onChange={setWinnerId}
          placeholder="Szukaj kraju…"
          emptyMessage="Brak pasujących krajów"
        />

        <PlayerSearchSelect
          id="predicted_top_scorer_id"
          label="Król strzelców"
          players={players}
          value={topScorerId}
          onChange={setTopScorerId}
        />
      </div>

      <input type="hidden" name="predicted_winner_id" value={winnerId} />
      <input type="hidden" name="predicted_top_scorer_id" value={topScorerId} />

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Typ możesz zmienić do rozpoczęcia pierwszego meczu turnieju. Poprawny
          zwycięzca: 10 pkt, król strzelców: 5 pkt.
        </p>
        <SubmitButton
          hasExistingPrediction={hasExistingPrediction}
          disabled={!winnerId || !topScorerId}
        />
      </div>

      {state.status !== "idle" && state.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`text-sm font-medium ${
            state.status === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
