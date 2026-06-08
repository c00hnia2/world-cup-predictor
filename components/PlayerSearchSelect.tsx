"use client";

import { SearchSelect } from "@/components/SearchSelect";
import type { Player } from "@/types/player";

interface PlayerSearchSelectProps {
  id: string;
  label: string;
  players: Player[];
  value: string;
  onChange: (playerId: string) => void;
  disabled?: boolean;
}

export function PlayerSearchSelect({
  players,
  ...props
}: PlayerSearchSelectProps) {
  return (
    <SearchSelect
      {...props}
      options={players}
      placeholder="Szukaj zawodnika…"
      emptyMessage="Brak wyników"
    />
  );
}
