"use client";

import { useState, useTransition } from "react";
import { resolveMatch } from "@/app/actions/admin";

interface AdminMatchFormProps {
  matchId: string;
  teamAName: string;
  teamBName: string;
}

export function AdminMatchForm({
  matchId,
  teamAName,
  teamBName,
}: AdminMatchFormProps) {
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setFeedback(null);

    const realScoreA = Number(scoreA);
    const realScoreB = Number(scoreB);

    startTransition(async () => {
      const result = await resolveMatch(matchId, realScoreA, realScoreB);

      if (result.success) {
        setFeedback({ type: "success", message: result.message });
        setScoreA("");
        setScoreB("");
      } else {
        setFeedback({ type: "error", message: result.message });
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`score-a-${matchId}`}>
          Wynik {teamAName}
        </label>
        <input
          id={`score-a-${matchId}`}
          type="number"
          min={0}
          inputMode="numeric"
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          placeholder="0"
          aria-label={`Wynik ${teamAName}`}
          className="h-9 w-14 rounded border border-zinc-300 bg-white px-2 text-center text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
        <span className="text-zinc-500">:</span>
        <label className="sr-only" htmlFor={`score-b-${matchId}`}>
          Wynik {teamBName}
        </label>
        <input
          id={`score-b-${matchId}`}
          type="number"
          min={0}
          inputMode="numeric"
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          placeholder="0"
          aria-label={`Wynik ${teamBName}`}
          className="h-9 w-14 rounded border border-zinc-300 bg-white px-2 text-center text-sm dark:border-zinc-600 dark:bg-zinc-800"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending || scoreA === "" || scoreB === ""}
        className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending ? "Rozliczanie…" : "Zakończ mecz"}
      </button>

      {feedback ? (
        <p
          role="status"
          className={`text-xs sm:basis-full ${
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
