"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitPrediction } from "@/app/actions";
import { getPredictionLockMessage } from "@/lib/prediction-lock";
import type { PredictionFormState } from "@/types/prediction";

interface PredictionFormProps {
  matchId: string;
  isLocked: boolean;
  initialScoreA?: number;
  initialScoreB?: number;
  hasExistingPrediction?: boolean;
}

const initialPredictionState: PredictionFormState = {
  status: "idle",
  message: "",
};

const scoreInputClass =
  "h-14 w-14 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 text-center text-2xl font-bold text-zinc-900 shadow-inner outline-none backdrop-blur transition-all duration-200 [appearance:textfield] placeholder:text-zinc-300 hover:border-zinc-300 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 dark:border-zinc-700/70 dark:bg-zinc-800/60 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:hover:border-zinc-600 dark:focus:border-emerald-400/60 dark:focus:bg-zinc-800 dark:focus:ring-emerald-400/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

interface SubmitButtonProps {
  hasExistingPrediction: boolean;
}

function SubmitButton({ hasExistingPrediction }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="group relative inline-flex h-11 min-w-28 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 outline-none transition-all duration-200 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/30 focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-90"
    >
      {pending ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
          </svg>
          <span>Zapisywanie…</span>
        </>
      ) : (
        <span>{hasExistingPrediction ? "Aktualizuj" : "Potwierdź"}</span>
      )}
    </button>
  );
}

function LockedPredictionView({
  initialScoreA,
  initialScoreB,
  hasExistingPrediction,
}: {
  initialScoreA?: number;
  initialScoreB?: number;
  hasExistingPrediction: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {hasExistingPrediction ? (
        <p className="text-center text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          Twój typ:{" "}
          <span className="font-mono text-base text-emerald-700 dark:text-emerald-300">
            {initialScoreA} – {initialScoreB}
          </span>
        </p>
      ) : (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Nie zdążyłeś z typowaniem przed zamknięciem okna.
        </p>
      )}
      <p
        role="status"
        className="text-center text-xs font-medium text-amber-700 dark:text-amber-400"
      >
        {getPredictionLockMessage()}
      </p>
    </div>
  );
}

export function PredictionForm({
  matchId,
  isLocked,
  initialScoreA,
  initialScoreB,
  hasExistingPrediction = false,
}: PredictionFormProps) {
  const [state, formAction] = useActionState(
    submitPrediction,
    initialPredictionState,
  );

  const formKey = `${matchId}-${initialScoreA ?? "x"}-${initialScoreB ?? "x"}-${isLocked}`;

  if (isLocked) {
    return (
      <LockedPredictionView
        initialScoreA={initialScoreA}
        initialScoreB={initialScoreB}
        hasExistingPrediction={hasExistingPrediction}
      />
    );
  }

  return (
    <form key={formKey} action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="match_id" value={matchId} />

      <div className="flex items-center justify-center gap-3">
        <input
          type="number"
          name="score_a"
          min={0}
          inputMode="numeric"
          placeholder="0"
          aria-label="Wynik gospodarzy"
          required
          defaultValue={initialScoreA}
          className={scoreInputClass}
        />

        <SubmitButton hasExistingPrediction={hasExistingPrediction} />

        <input
          type="number"
          name="score_b"
          min={0}
          inputMode="numeric"
          placeholder="0"
          aria-label="Wynik gości"
          required
          defaultValue={initialScoreB}
          className={scoreInputClass}
        />
      </div>

      {hasExistingPrediction ? (
        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
          Masz zapisany typ — możesz go zmienić do 15 min przed meczem.
        </p>
      ) : null}

      {state.status !== "idle" && state.message ? (
        <p
          role="status"
          aria-live="polite"
          className={`text-center text-xs font-medium transition-colors ${
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
