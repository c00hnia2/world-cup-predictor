import { RankingStatHeader } from "@/components/leaderboard/RankingStatHeader";
import { PlayerNameLink } from "@/components/PlayerNameLink";

export interface RankingTableRow {
  key: string;
  position: number;
  displayName: string;
  username?: string | null;
  exactScoresCount: number;
  correctOutcomesCount: number;
  totalPoints: number;
  isCurrentUser: boolean;
}

interface RankingTableProps {
  rows: RankingTableRow[];
  /** Pełna etykieta kolumny punktów na desktopie (na mobile zawsze „Pkt”). */
  pointsLabel?: string;
  /** Extra horizontal padding on md+ (league ranking). */
  widePadding?: boolean;
}

const statHeaderClass =
  "px-0 py-2 text-center text-[11px] font-semibold leading-none text-zinc-700 md:px-4 md:py-3 md:text-sm dark:text-zinc-300";

export function RankingTable({
  rows,
  pointsLabel = "Punkty",
  widePadding = false,
}: RankingTableProps) {
  const edgePadding = widePadding ? "md:px-8" : "";

  return (
    <div className="min-w-0 max-w-full overflow-hidden">
      <table className="w-full max-w-full table-fixed border-collapse text-xs md:min-w-[36rem] md:table-auto md:text-sm">
        <colgroup className="md:hidden">
          <col className="w-[9%]" />
          <col className="w-[37%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
            <th
              scope="col"
              className={`px-1 py-2 text-left font-semibold text-zinc-700 md:w-16 md:px-4 md:py-3 ${edgePadding}`}
            >
              Lp.
            </th>
            <th
              scope="col"
              className="overflow-hidden px-1 py-2 text-left font-semibold text-zinc-700 md:px-4 md:py-3"
            >
              <span className="md:hidden">Gracz</span>
              <span className="hidden md:inline">Nazwa gracza</span>
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
              className={`px-1 py-2 text-right font-semibold text-zinc-700 md:px-4 md:py-3 ${edgePadding}`}
            >
              <span className="md:hidden">Pkt</span>
              <span className="hidden md:inline">{pointsLabel}</span>
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
              <td
                className={`overflow-hidden px-1 py-2 tabular-nums md:px-4 md:py-3 ${edgePadding}`}
              >
                {row.position}
              </td>
              <td className="overflow-hidden px-1 py-2 md:px-4 md:py-3">
                <div className="flex min-w-0 items-center gap-1 md:gap-2">
                  <PlayerNameLink
                    username={row.username}
                    displayName={row.displayName}
                    className="min-w-0 flex-1 truncate font-inherit text-inherit hover:text-emerald-600 dark:hover:text-emerald-400"
                  />
                  {row.isCurrentUser ? (
                    <span className="shrink-0 rounded-full bg-emerald-600 px-1 py-px text-[9px] font-semibold leading-tight text-white md:px-2 md:py-0.5 md:text-xs dark:bg-emerald-500">
                      Ty
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="overflow-hidden px-0 py-2 text-center tabular-nums md:px-4 md:py-3">
                {row.exactScoresCount}
              </td>
              <td className="overflow-hidden px-0 py-2 text-center tabular-nums md:px-4 md:py-3">
                {row.correctOutcomesCount}
              </td>
              <td
                className={`overflow-hidden px-1 py-2 text-right tabular-nums font-bold md:px-4 md:py-3 md:font-normal ${edgePadding}`}
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
