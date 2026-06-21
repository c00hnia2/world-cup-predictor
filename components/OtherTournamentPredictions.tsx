"use client";

import { useState, useTransition } from "react";
import { fetchTournamentPredictions } from "@/app/actions/tournament";
import { PlayerNameLink } from "@/components/PlayerNameLink";
import type { TournamentPredictionEntry } from "@/lib/get-tournament-predictions";

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded"; predictions: TournamentPredictionEntry[] }
  | { status: "error"; message: string };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TournamentPredictionRow({ entry }: { entry: TournamentPredictionEntry }) {
  return (
    <li className="flex flex-col gap-1 rounded-xl bg-zinc-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between dark:bg-zinc-800/60">
      <span className="flex min-w-0 items-center gap-2">
        <PlayerNameLink
          username={entry.username}
          displayName={entry.displayName}
          className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100"
        />
        {entry.isCurrentUser ? (
          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            Ty
          </span>
        ) : null}
      </span>
      <span className="text-sm text-zinc-700 dark:text-zinc-300">
        <span className="font-medium text-zinc-500 dark:text-zinc-400">
          Zwycięzca:
        </span>{" "}
        {entry.winnerName}
        <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
        <span className="font-medium text-zinc-500 dark:text-zinc-400">
          Król strzelców:
        </span>{" "}
        {entry.topScorerName}
        {typeof entry.pointsEarned === "number" ? (
          <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            +{entry.pointsEarned} pkt
          </span>
        ) : null}
      </span>
    </li>
  );
}

export function OtherTournamentPredictions() {
  const [open, setOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !open;
    setOpen(next);

    if (next && loadState.status === "idle") {
      startTransition(async () => {
        const result = await fetchTournamentPredictions();

        if (result.status === "ok") {
          setLoadState({ status: "loaded", predictions: result.predictions });
        } else if (result.status === "unauthenticated") {
          setLoadState({
            status: "error",
            message: "Zaloguj się, aby zobaczyć typy innych graczy.",
          });
        } else {
          setLoadState({
            status: "error",
            message: "Nie udało się pobrać typów. Spróbuj ponownie.",
          });
        }
      });
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls="other-tournament-predictions"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-700 outline-none transition-colors hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
      >
        <span>
          {open ? "Ukryj typy turniejowe innych graczy" : "Pokaż typy turniejowe innych graczy"}
        </span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div id="other-tournament-predictions" className="mt-3">
          {isPending || loadState.status === "loading" ? (
            <p
              role="status"
              className="text-center text-xs text-zinc-500 dark:text-zinc-400"
            >
              Wczytywanie…
            </p>
          ) : loadState.status === "error" ? (
            <p
              role="status"
              className="text-center text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {loadState.message}
            </p>
          ) : loadState.status === "loaded" ? (
            loadState.predictions.length > 0 ? (
              <ul className="flex list-none flex-col gap-1.5">
                {loadState.predictions.map((entry) => (
                  <TournamentPredictionRow key={entry.userId} entry={entry} />
                ))}
              </ul>
            ) : (
              <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Nikt jeszcze nie zatypował turnieju.
              </p>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
