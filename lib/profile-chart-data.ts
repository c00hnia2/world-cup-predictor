import { computeRankingValuesByUserId } from "@/lib/compute-round-ranking";
import { calculatePoints } from "@/lib/scoring";
import { getPredictionRankingBuckets } from "@/lib/ranking-stats";
import type { UserPredictionEntry } from "@/types/prediction";

export interface PieChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface TimelinePoint {
  label: string;
  value: number;
}

export interface ComparisonPlayer {
  id: string;
  displayName: string;
  username?: string | null;
  isCurrentUser: boolean;
}

export interface ComparisonTimelinePoint {
  label: string;
  values: Record<string, number>;
}

export interface TimelineComparisonDataset {
  currentUserId: string;
  currentUser: ComparisonPlayer;
  comparePlayers: ComparisonPlayer[];
  rankingTimeline: ComparisonTimelinePoint[];
  pointsTimeline: ComparisonTimelinePoint[];
}

export interface ProfilePredictionStats {
  totalFinishedPredictions: number;
  exactScoresCount: number;
  correctOutcomesCount: number;
  missedCount: number;
}

export interface ProfileChartData {
  exactScorePie: PieChartSlice[];
  overallAccuracyPie: PieChartSlice[];
  timelineComparison: TimelineComparisonDataset;
  stats: ProfilePredictionStats;
  usingMockTimeline: boolean;
}

export const PROFILE_CHART_COLORS = {
  exact: "#10b981",
  success: "#34d399",
  miss: "#a1a1aa",
  remaining: "#d4d4d8",
  rankingLine: "#10b981",
  pointsLine: "#059669",
} as const;

export const CURRENT_USER_LINE_COLOR = PROFILE_CHART_COLORS.rankingLine;

export const COMPARISON_LINE_COLORS = [
  "#3b82f6",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#06b6d4",
  "#eab308",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
  "#8b5cf6",
] as const;

const MOCK_CURRENT_USER_KEY = "__current_user__";

function resolvePointsEarned(prediction: UserPredictionEntry): number {
  const match = prediction.match;

  if (
    match?.status === "finished" &&
    match.score_a !== null &&
    match.score_b !== null
  ) {
    return (
      prediction.points_earned ??
      calculatePoints(
        prediction.predicted_score_a,
        prediction.predicted_score_b,
        match.score_a,
        match.score_b,
      )
    );
  }

  return 0;
}

export function getFinishedPredictions(
  predictions: UserPredictionEntry[],
): UserPredictionEntry[] {
  return predictions.filter(
    (prediction) =>
      prediction.match?.status === "finished" &&
      prediction.match.score_a !== null &&
      prediction.match.score_b !== null,
  );
}

export function buildProfilePredictionStats(
  predictions: UserPredictionEntry[],
): ProfilePredictionStats {
  const finished = getFinishedPredictions(predictions);

  let exactScoresCount = 0;
  let correctOutcomesCount = 0;

  for (const prediction of finished) {
    const buckets = getPredictionRankingBuckets(resolvePointsEarned(prediction));

    if (buckets.exactScore) {
      exactScoresCount += 1;
    } else if (buckets.correctOutcome) {
      correctOutcomesCount += 1;
    }
  }

  const totalFinishedPredictions = finished.length;
  const successfulCount = exactScoresCount + correctOutcomesCount;

  return {
    totalFinishedPredictions,
    exactScoresCount,
    correctOutcomesCount,
    missedCount: Math.max(totalFinishedPredictions - successfulCount, 0),
  };
}

export function buildExactScorePieData(
  stats: ProfilePredictionStats,
): PieChartSlice[] {
  const total = stats.totalFinishedPredictions;

  if (total === 0) {
    return [
      {
        name: "Brak rozegranych typów",
        value: 1,
        color: PROFILE_CHART_COLORS.remaining,
      },
    ];
  }

  return [
    {
      name: "Trafione dokładne wyniki (🎯)",
      value: stats.exactScoresCount,
      color: PROFILE_CHART_COLORS.exact,
    },
    {
      name: "Pozostałe typy",
      value: total - stats.exactScoresCount,
      color: PROFILE_CHART_COLORS.remaining,
    },
  ];
}

export function buildOverallAccuracyPieData(
  stats: ProfilePredictionStats,
): PieChartSlice[] {
  const total = stats.totalFinishedPredictions;

  if (total === 0) {
    return [
      {
        name: "Brak rozegranych typów",
        value: 1,
        color: PROFILE_CHART_COLORS.remaining,
      },
    ];
  }

  const successfulCount =
    stats.exactScoresCount + stats.correctOutcomesCount;

  return [
    {
      name: "Trafione (🎯 + ✔️)",
      value: successfulCount,
      color: PROFILE_CHART_COLORS.success,
    },
    {
      name: "Nietrafione typy",
      value: stats.missedCount,
      color: PROFILE_CHART_COLORS.miss,
    },
  ];
}

function formatTimelineLabel(isoDate: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
  }).format(new Date(isoDate));
}

export function buildPointsTimeline(
  predictions: UserPredictionEntry[],
): TimelinePoint[] {
  const finished = getFinishedPredictions(predictions);

  let cumulativePoints = 0;

  return finished.map((prediction) => {
    cumulativePoints += resolvePointsEarned(prediction);

    return {
      label: formatTimelineLabel(prediction.match!.kickoff_time),
      value: cumulativePoints,
    };
  });
}

export function getComparisonPlayerColor(
  player: ComparisonPlayer,
  comparePlayers: ComparisonPlayer[],
): string {
  if (player.isCurrentUser) {
    return CURRENT_USER_LINE_COLOR;
  }

  const compareIndex = comparePlayers.findIndex(
    (comparePlayer) => comparePlayer.id === player.id,
  );

  return COMPARISON_LINE_COLORS[
    Math.max(compareIndex, 0) % COMPARISON_LINE_COLORS.length
  ];
}

export function buildPlayerColorMap(
  currentUser: ComparisonPlayer,
  comparePlayers: ComparisonPlayer[],
): Record<string, string> {
  return Object.fromEntries(
    [currentUser, ...comparePlayers].map((player) => [
      player.id,
      getComparisonPlayerColor(player, comparePlayers),
    ]),
  );
}

export function buildComparisonChartRows(
  timeline: ComparisonTimelinePoint[],
  visiblePlayerIds: string[],
): Array<{ label: string } & Record<string, number | string>> {
  return timeline.map((point) => {
    const row: { label: string } & Record<string, number | string> = {
      label: point.label,
    };

    for (const playerId of visiblePlayerIds) {
      row[playerId] = point.values[playerId] ?? null;
    }

    return row;
  });
}

export function getVisibleComparisonPlayers(
  dataset: TimelineComparisonDataset,
  selectedPlayerIds: string[],
): ComparisonPlayer[] {
  const selected = dataset.comparePlayers.filter((player) =>
    selectedPlayerIds.includes(player.id),
  );

  return [dataset.currentUser, ...selected];
}

export function areAllComparisonPlayersSelected(
  comparePlayers: ComparisonPlayer[],
  selectedPlayerIds: string[],
): boolean {
  return (
    comparePlayers.length > 0 &&
    comparePlayers.every((player) => selectedPlayerIds.includes(player.id))
  );
}

export function buildRankingTimelineFromPointsTimeline(
  pointsTimeline: ComparisonTimelinePoint[],
  playerIds: string[],
): ComparisonTimelinePoint[] {
  return pointsTimeline.map((point) => ({
    label: point.label,
    values: computeRankingValuesByUserId(
      playerIds.map((playerId) => ({
        id: playerId,
        total_points: point.values[playerId] ?? 0,
        exact_scores_count: 0,
        correct_outcomes_count: 0,
      })),
    ),
  }));
}

function remapMockTimelineValues(
  values: Record<string, number>,
  currentUserId: string,
): Record<string, number> {
  const remapped: Record<string, number> = {};

  for (const [key, value] of Object.entries(values)) {
    remapped[key === MOCK_CURRENT_USER_KEY ? currentUserId : key] = value;
  }

  return remapped;
}

export function createMockTimelineComparison(
  currentUserId: string,
  currentUserDisplayName: string,
): TimelineComparisonDataset {
  const currentUser: ComparisonPlayer = {
    id: currentUserId,
    displayName: currentUserDisplayName,
    isCurrentUser: true,
  };

  const pointsTimeline = PROFILE_MOCK_POINTS_TIMELINE.map((point) => ({
    label: point.label,
    values: remapMockTimelineValues(point.values, currentUserId),
  }));

  const playerIds = [
    currentUserId,
    ...PROFILE_MOCK_COMPARE_PLAYERS.map((player) => player.id),
  ];

  return {
    currentUserId,
    currentUser,
    comparePlayers: PROFILE_MOCK_COMPARE_PLAYERS,
    rankingTimeline: buildRankingTimelineFromPointsTimeline(
      pointsTimeline,
      playerIds,
    ),
    pointsTimeline,
  };
}

export function buildProfileChartData(
  predictions: UserPredictionEntry[],
  timelineComparison: TimelineComparisonDataset | null,
  options: {
    currentUserId: string;
    currentUserDisplayName: string;
    forceMockTimeline?: boolean;
  },
): ProfileChartData {
  const stats = buildProfilePredictionStats(predictions);

  const hasRealTimeline =
    !options.forceMockTimeline &&
    timelineComparison !== null &&
    timelineComparison.rankingTimeline.length >= 2 &&
    timelineComparison.pointsTimeline.length >= 2;

  const comparison = hasRealTimeline
    ? timelineComparison
    : createMockTimelineComparison(
        options.currentUserId,
        options.currentUserDisplayName,
      );

  return {
    exactScorePie: buildExactScorePieData(stats),
    overallAccuracyPie: buildOverallAccuracyPieData(stats),
    timelineComparison: comparison,
    stats,
    usingMockTimeline: !hasRealTimeline,
  };
}

export const PROFILE_MOCK_COMPARE_PLAYERS: ComparisonPlayer[] = [
  { id: "mock-player-1", displayName: "AniaK", username: "AniaK", isCurrentUser: false },
  { id: "mock-player-2", displayName: "MarekTyper", username: "MarekTyper", isCurrentUser: false },
  { id: "mock-player-3", displayName: "FutbolFan99", username: "FutbolFan99", isCurrentUser: false },
  { id: "mock-player-4", displayName: "KubaPro", username: "KubaPro", isCurrentUser: false },
  { id: "mock-player-5", displayName: "ZosiaGol", username: "ZosiaGol", isCurrentUser: false },
  { id: "mock-player-6", displayName: "PiotrMS", username: "PiotrMS", isCurrentUser: false },
];

export const PROFILE_MOCK_POINTS_TIMELINE: ComparisonTimelinePoint[] = [
  {
    label: "1. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 4,
      "mock-player-1": 6,
      "mock-player-2": 3,
      "mock-player-3": 5,
      "mock-player-4": 2,
      "mock-player-5": 7,
      "mock-player-6": 1,
    },
  },
  {
    label: "2. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 9,
      "mock-player-1": 11,
      "mock-player-2": 7,
      "mock-player-3": 9,
      "mock-player-4": 6,
      "mock-player-5": 12,
      "mock-player-6": 5,
    },
  },
  {
    label: "3. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 14,
      "mock-player-1": 15,
      "mock-player-2": 10,
      "mock-player-3": 13,
      "mock-player-4": 9,
      "mock-player-5": 16,
      "mock-player-6": 8,
    },
  },
  {
    label: "4. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 18,
      "mock-player-1": 19,
      "mock-player-2": 14,
      "mock-player-3": 16,
      "mock-player-4": 13,
      "mock-player-5": 20,
      "mock-player-6": 11,
    },
  },
  {
    label: "5. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 23,
      "mock-player-1": 24,
      "mock-player-2": 18,
      "mock-player-3": 20,
      "mock-player-4": 17,
      "mock-player-5": 25,
      "mock-player-6": 14,
    },
  },
  {
    label: "6. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 27,
      "mock-player-1": 28,
      "mock-player-2": 22,
      "mock-player-3": 24,
      "mock-player-4": 21,
      "mock-player-5": 29,
      "mock-player-6": 17,
    },
  },
  {
    label: "7. kolejka",
    values: {
      [MOCK_CURRENT_USER_KEY]: 31,
      "mock-player-1": 33,
      "mock-player-2": 26,
      "mock-player-3": 28,
      "mock-player-4": 24,
      "mock-player-5": 34,
      "mock-player-6": 20,
    },
  },
];

export const PROFILE_MOCK_PREDICTION_STATS: ProfilePredictionStats = {
  totalFinishedPredictions: 28,
  exactScoresCount: 6,
  correctOutcomesCount: 11,
  missedCount: 11,
};

// Zachowane dla testów pojedynczej serii.
export const PROFILE_MOCK_RANKING_HISTORY: TimelinePoint[] =
  buildRankingTimelineFromPointsTimeline(PROFILE_MOCK_POINTS_TIMELINE, [
    MOCK_CURRENT_USER_KEY,
    ...PROFILE_MOCK_COMPARE_PLAYERS.map((player) => player.id),
  ]).map((point) => ({
    label: point.label,
    value: point.values[MOCK_CURRENT_USER_KEY],
  }));

export const PROFILE_MOCK_POINTS_HISTORY: TimelinePoint[] =
  PROFILE_MOCK_POINTS_TIMELINE.map((point) => ({
    label: point.label,
    value: point.values[MOCK_CURRENT_USER_KEY],
  }));
