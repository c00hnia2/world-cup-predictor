"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { PieChartSlice } from "@/lib/profile-chart-data";

interface ProfileAccuracyPieChartsProps {
  exactScorePie: PieChartSlice[];
  overallAccuracyPie: PieChartSlice[];
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: PieChartSlice }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{entry.name}</p>
      <p className="tabular-nums text-zinc-600 dark:text-zinc-400">
        {entry.value}
      </p>
    </div>
  );
}

function AccuracyPieCard({
  title,
  data,
}: {
  title: string;
  data: PieChartSlice[];
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const primarySlice = data[0];
  const percentage =
    total > 0 ? Math.round((primarySlice.value / total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={2}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {percentage}%
        </span>{" "}
        {primarySlice.name.toLowerCase()}
      </p>
      <ul className="mt-4 space-y-2">
        {data.map((slice) => (
          <li
            key={slice.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate">{slice.name}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium text-zinc-900 dark:text-zinc-100">
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ProfileAccuracyPieCharts({
  exactScorePie,
  overallAccuracyPie,
}: ProfileAccuracyPieChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AccuracyPieCard
        title="Strzały w Dziesiątkę (Dokładne Wyniki)"
        data={exactScorePie}
      />
      <AccuracyPieCard
        title="Ogólna Skuteczność Typowania"
        data={overallAccuracyPie}
      />
    </div>
  );
}
