"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitPrediction } from "@/app/actions";
import type { PredictionFormState } from "@/types/prediction";

interface PredictionFormProps {
  matchId: string;
}

const initialPredictionState: PredictionFormState = {
  status: "idle",
  message: "",
};

const scoreInputClass =
  "h-14 w-14 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 text-center text-2xl font-bold text-zinc-900 shadow-inner outline-none backdrop-blur transition-all duration-200 [appearance:textfield] placeholder:text-zinc-300 hover:border-zinc-300 focus:border-emerald-500/60 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 dark:border-zinc-700/70 dark:bg-zinc-800/60 dark:text-zinc-50 dark:placeholder:text-zinc-600 dark:hover:border-zinc-600 dark:focus:border-emerald-400/60 dark:focus:bg-zinc-800 dark:focus:ring-emerald-400/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

function SubmitButton() {
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
        <span>Typuj</span>
      )}
    </button>
  );
}

export function PredictionForm({ matchId }: PredictionFormProps) {
  const [state, formAction] = useActionState(
    submitPrediction,
    initialPredictionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
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
          className={scoreInputClass}
        />

        <SubmitButton />

        <input
          type="number"
          name="score_b"
          min={0}
          inputMode="numeric"
          placeholder="0"
          aria-label="Wynik gości"
          required
          className={scoreInputClass}
        />
      </div>

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
