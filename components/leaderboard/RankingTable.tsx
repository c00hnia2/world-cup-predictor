import { RankingStatHeader } from "@/components/leaderboard/RankingStatHeader";

export interface RankingTableRow {
  key: string;
  position: number;
  displayName: string;
  exactScoresCount: number;
  correctOutcomesCount: number;
  totalPoints: number;
  isCurrentUser: boolean;
}

interface RankingTableProps {
  rows: RankingTableRow[];
  /** Column header for points from 400px upward (narrow mobile always shows "Pkt"). */
  pointsLabel?: string;
  /** Extra horizontal padding on sm+ (league ranking). */
  widePadding?: boolean;
}

const statColumnClass =
  "hidden min-[400px]:table-cell w-10 px-1 py-3 text-center tabular-nums min-[400px]:px-2 md:w-16 md:px-4";
const statHeaderClass =
  "hidden min-[400px]:table-cell w-10 px-1 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 min-[400px]:px-2 md:w-16 md:px-4";

export function RankingTable({
  rows,
  pointsLabel = "Punkty",
  widePadding = false,
}: RankingTableProps) {
  const edgePadding = widePadding ? "md:px-8" : "";

  return (
    <div className="overflow-x-auto md:overflow-x-visible">
      <table className="w-full table-fixed text-left text-sm md:min-w-[36rem] md:table-auto">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <th
              scope="col"
              className={`w-10 px-2 py-3 font-semibold text-zinc-700 dark:text-zinc-300 md:w-16 md:px-4 ${edgePadding}`}
            >
              Lp.
            </th>
            <th
              scope="col"
              className="px-2 py-3 font-semibold text-zinc-700 dark:text-zinc-300 md:px-4"
            >
              Nazwa gracza
            </th>
            <RankingStatHeader
              label="🎯"
              tooltip="Trafione dokładne wyniki"
              className={statHeaderClass}
            />
            <RankingStatHeader
              label="✔️"
              tooltip="Trafiony zwycięzca lub remis"
              className={statHeaderClass}
            />
            <th
              scope="col"
              className={`w-14 px-2 py-3 text-right font-semibold text-zinc-700 dark:text-zinc-300 md:w-auto md:px-4 ${edgePadding}`}
            >
              <span className="min-[400px]:hidden">Pkt</span>
              <span className="hidden min-[400px]:inline">{pointsLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.key}
              className={`border-b border-zinc-100 last:border-0 dark:border-zinc-800 ${
                row.isCurrentUser
                  ? "bg-emerald-50 font-semibold text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-50"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              <td className={`px-2 py-3 tabular-nums md:px-4 ${edgePadding}`}>
                {row.position}
              </td>
              <td className="px-2 py-3 md:px-4">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <span className="truncate">{row.displayName}</span>
                  {row.isCurrentUser ? (
                    <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-emerald-500">
                      Ty
                    </span>
                  ) : null}
                </span>
              </td>
              <td className={statColumnClass}>{row.exactScoresCount}</td>
              <td className={statColumnClass}>{row.correctOutcomesCount}</td>
              <td
                className={`px-2 py-3 text-right tabular-nums max-[399px]:font-bold md:px-4 ${edgePadding}`}
              >
                {row.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
