"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PlayerNameLink } from "@/components/PlayerNameLink";
import { ProfilePlayerComparisonSelector } from "@/components/profile/ProfilePlayerComparisonSelector";
import {
  buildComparisonChartRows,
  buildPlayerColorMap,
  getVisibleComparisonPlayers,
  type ComparisonPlayer,
  type ComparisonTimelinePoint,
  type TimelineComparisonDataset,
} from "@/lib/profile-chart-data";

interface ProfileTimelineChartsProps {
  timelineComparison: TimelineComparisonDataset;
  usingMockTimeline: boolean;
}

interface ComparisonLineTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
  }>;
  label?: string;
  valueLabel: string;
  playersById: Record<string, ComparisonPlayer>;
}

function ComparisonLineTooltip({
  active,
  payload,
  label,
  valueLabel,
  playersById,
}: ComparisonLineTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const entries = [...payload]
    .filter((entry) => entry.value !== null && entry.value !== undefined)
    .sort((left, right) => {
      const leftPlayer = playersById[left.dataKey];
      const rightPlayer = playersById[right.dataKey];

      if (leftPlayer?.isCurrentUser) {
        return -1;
      }

      if (rightPlayer?.isCurrentUser) {
        return 1;
      }

      return (leftPlayer?.displayName ?? left.dataKey).localeCompare(
        rightPlayer?.displayName ?? right.dataKey,
        "pl",
      );
    });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">{label}</p>
      <ul className="space-y-1">
        {entries.map((entry) => {
          const player = playersById[entry.dataKey];

          return (
            <li
              key={entry.dataKey}
              className="flex items-center justify-between gap-4 tabular-nums"
              style={{ color: entry.color }}
            >
              <PlayerNameLink
                username={player?.username}
                displayName={player?.displayName ?? entry.dataKey}
                className="font-medium"
                style={{ color: entry.color }}
              />
              <span>
                {valueLabel}: {entry.value}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ComparisonLegendContent({
  payload,
  playersById,
}: {
  payload?: ReadonlyArray<{ value?: string; color?: string }>;
  playersById: Record<string, ComparisonPlayer>;
}) {
  if (!payload?.length) {
    return null;
  }

  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
      {payload.map((entry) => {
        if (!entry.value) {
          return null;
        }

        const player = playersById[entry.value];

        return (
          <li key={entry.value} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <PlayerNameLink
              username={player?.username}
              displayName={player?.displayName ?? entry.value}
              className="text-xs"
            />
          </li>
        );
      })}
    </ul>
  );
}

function TimelineCard({
  title,
  timeline,
  visiblePlayers,
  colorMap,
  playersById,
  yLabel,
  reversedY = false,
}: {
  title: string;
  timeline: ComparisonTimelinePoint[];
  visiblePlayers: ComparisonPlayer[];
  colorMap: Record<string, string>;
  playersById: Record<string, ComparisonPlayer>;
  yLabel: string;
  reversedY?: boolean;
}) {
  const chartData = useMemo(
    () =>
      buildComparisonChartRows(
        timeline,
        visiblePlayers.map((player) => player.id),
      ),
    [timeline, visiblePlayers],
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <div className="mt-4 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-zinc-200 dark:stroke-zinc-700"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-zinc-500 dark:text-zinc-400"
              interval="preserveStartEnd"
            />
            <YAxis
              reversed={reversedY}
              allowDecimals={false}
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-zinc-500 dark:text-zinc-400"
              width={36}
            />
            <Tooltip
              content={
                <ComparisonLineTooltip
                  valueLabel={yLabel}
                  playersById={playersById}
                />
              }
            />
            <Legend
              content={(props) => (
                <ComparisonLegendContent
                  payload={props.payload}
                  playersById={playersById}
                />
              )}
            />
            {visiblePlayers.map((player) => (
              <Line
                key={player.id}
                type="monotone"
                dataKey={player.id}
                name={player.id}
                stroke={colorMap[player.id]}
                strokeWidth={player.isCurrentUser ? 3 : 2}
                dot={{ r: player.isCurrentUser ? 4 : 3, strokeWidth: 0 }}
                activeDot={{ r: player.isCurrentUser ? 6 : 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function ProfileTimelineCharts({
  timelineComparison,
  usingMockTimeline,
}: ProfileTimelineChartsProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const visiblePlayers = useMemo(
    () =>
      getVisibleComparisonPlayers(timelineComparison, selectedPlayerIds),
    [selectedPlayerIds, timelineComparison],
  );

  const colorMap = useMemo(
    () =>
      buildPlayerColorMap(
        timelineComparison.currentUser,
        timelineComparison.comparePlayers,
      ),
    [timelineComparison],
  );

  const playersById = useMemo(
    () =>
      Object.fromEntries(
        [timelineComparison.currentUser, ...timelineComparison.comparePlayers].map(
          (player) => [player.id, player],
        ),
      ),
    [timelineComparison],
  );

  return (
    <div className="space-y-6">
      {usingMockTimeline ? (
        <p
          role="status"
          className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-400"
        >
          Wykresy historii pokazują dane przykładowe — po rozegraniu większej liczby
          meczów zostaną zastąpione rzeczywistymi statystykami.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <TimelineCard
          title="Historia Pozycji w Rankingu"
          timeline={timelineComparison.rankingTimeline}
          visiblePlayers={visiblePlayers}
          colorMap={colorMap}
          playersById={playersById}
          yLabel="Pozycja"
          reversedY
        />
        <TimelineCard
          title="Przyrost Punktów w Czasie"
          timeline={timelineComparison.pointsTimeline}
          visiblePlayers={visiblePlayers}
          colorMap={colorMap}
          playersById={playersById}
          yLabel="Punkty"
        />
      </div>

      <ProfilePlayerComparisonSelector
        currentUser={timelineComparison.currentUser}
        comparePlayers={timelineComparison.comparePlayers}
        selectedPlayerIds={selectedPlayerIds}
        onSelectedPlayerIdsChange={setSelectedPlayerIds}
      />
    </div>
  );
}
