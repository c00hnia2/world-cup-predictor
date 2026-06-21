"use client";

import { useMemo, useState } from "react";
import { PlayerNameLink } from "@/components/PlayerNameLink";
import {
  areAllComparisonPlayersSelected,
  buildPlayerColorMap,
  type ComparisonPlayer,
} from "@/lib/profile-chart-data";

interface ProfilePlayerComparisonSelectorProps {
  currentUser: ComparisonPlayer;
  comparePlayers: ComparisonPlayer[];
  selectedPlayerIds: string[];
  onSelectedPlayerIdsChange: (playerIds: string[]) => void;
}

export function ProfilePlayerComparisonSelector({
  currentUser,
  comparePlayers,
  selectedPlayerIds,
  onSelectedPlayerIdsChange,
}: ProfilePlayerComparisonSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const colorMap = useMemo(
    () => buildPlayerColorMap(currentUser, comparePlayers),
    [comparePlayers, currentUser],
  );

  const allSelected = areAllComparisonPlayersSelected(
    comparePlayers,
    selectedPlayerIds,
  );

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return comparePlayers;
    }

    return comparePlayers.filter((player) =>
      player.displayName.toLowerCase().includes(normalizedQuery),
    );
  }, [comparePlayers, searchQuery]);

  function togglePlayer(playerId: string) {
    if (selectedPlayerIds.includes(playerId)) {
      onSelectedPlayerIdsChange(
        selectedPlayerIds.filter((id) => id !== playerId),
      );
      return;
    }

    onSelectedPlayerIdsChange([...selectedPlayerIds, playerId]);
  }

  function toggleAllPlayers() {
    if (allSelected) {
      onSelectedPlayerIdsChange([]);
      return;
    }

    onSelectedPlayerIdsChange(comparePlayers.map((player) => player.id));
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Porównaj z innymi graczami
          </h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Twoja linia jest zawsze widoczna. Wybierz dodatkowych graczy lub
            użyj opcji „Wszyscy”, aby nałożyć wszystkie serie na wykresy.
          </p>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {allSelected ? (
            <>
              Wybrano:{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Wszyscy
              </span>
            </>
          ) : (
            <>
              Wybrano:{" "}
              <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {selectedPlayerIds.length}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="mt-5">
        <label htmlFor="player-comparison-search" className="sr-only">
          Szukaj gracza
        </label>
        <input
          id="player-comparison-search"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Szukaj gracza po nazwie..."
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          aria-current="true"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: colorMap[currentUser.id] }}
          />
          <PlayerNameLink
            username={currentUser.username}
            displayName={currentUser.displayName}
            className="font-medium text-emerald-700 dark:text-emerald-300"
          />
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            (Ty)
          </span>
        </span>

        {comparePlayers.length > 0 ? (
          <button
            type="button"
            aria-pressed={allSelected}
            onClick={toggleAllPlayers}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              allSelected
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            }`}
          >
            Wszyscy
          </button>
        ) : null}

        {filteredPlayers.map((player) => {
          const selected = selectedPlayerIds.includes(player.id);

          return (
            <button
              key={player.id}
              type="button"
              aria-pressed={selected}
              onClick={() => togglePlayer(player.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                selected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: colorMap[player.id] }}
              />
              <PlayerNameLink
                username={player.username}
                displayName={player.displayName}
                asSpan
                onClick={(event) => event.stopPropagation()}
              />
            </button>
          );
        })}
      </div>

      {filteredPlayers.length === 0 ? (
        <p
          role="status"
          className="mt-4 text-sm text-zinc-500 dark:text-zinc-400"
        >
          Brak graczy pasujących do wyszukiwania.
        </p>
      ) : null}
    </section>
  );
}
