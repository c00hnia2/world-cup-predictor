import { describe, expect, it } from "vitest";
import {
  areAllComparisonPlayersSelected,
  buildComparisonChartRows,
  buildExactScorePieData,
  buildOverallAccuracyPieData,
  buildPointsTimeline,
  buildProfileChartData,
  buildProfilePredictionStats,
  createMockTimelineComparison,
  getVisibleComparisonPlayers,
  PROFILE_MOCK_PREDICTION_STATS,
} from "@/lib/profile-chart-data";
import type { UserPredictionEntry } from "@/types/prediction";

function createFinishedPrediction(
  overrides: Partial<UserPredictionEntry> & {
    kickoff_time: string;
    points_earned: number;
  },
): UserPredictionEntry {
  return {
    id: overrides.id ?? "prediction-id",
    predicted_score_a: overrides.predicted_score_a ?? 1,
    predicted_score_b: overrides.predicted_score_b ?? 0,
    points_earned: overrides.points_earned,
    match: {
      id: overrides.match?.id ?? "match-id",
      kickoff_time: overrides.kickoff_time,
      status: "finished",
      score_a: overrides.match?.score_a ?? 1,
      score_b: overrides.match?.score_b ?? 0,
      team_a: overrides.match?.team_a ?? { name: "Team A" },
      team_b: overrides.match?.team_b ?? { name: "Team B" },
    },
  };
}

describe("buildProfilePredictionStats", () => {
  it("liczy rozłącznie dokładne wyniki, trafiony rezultat i pomyłki", () => {
    const stats = buildProfilePredictionStats([
      createFinishedPrediction({
        kickoff_time: "2026-06-10T18:00:00.000Z",
        points_earned: 3,
      }),
      createFinishedPrediction({
        kickoff_time: "2026-06-11T18:00:00.000Z",
        points_earned: 1,
      }),
      createFinishedPrediction({
        kickoff_time: "2026-06-12T18:00:00.000Z",
        points_earned: 0,
      }),
    ]);

    expect(stats).toEqual({
      totalFinishedPredictions: 3,
      exactScoresCount: 1,
      correctOutcomesCount: 1,
      missedCount: 1,
    });
  });
});

describe("buildExactScorePieData", () => {
  it("buduje stosunek trafionych dokładnych wyników do wszystkich typów", () => {
    const pie = buildExactScorePieData(PROFILE_MOCK_PREDICTION_STATS);

    expect(pie).toHaveLength(2);
    expect(pie[0]).toMatchObject({
      name: "Trafione dokładne wyniki (🎯)",
      value: 6,
    });
    expect(pie[1]).toMatchObject({
      name: "Pozostałe typy",
      value: 22,
    });
  });
});

describe("buildOverallAccuracyPieData", () => {
  it("sumuje trafione dokładne wyniki i trafiony rezultat", () => {
    const pie = buildOverallAccuracyPieData(PROFILE_MOCK_PREDICTION_STATS);

    expect(pie[0]).toMatchObject({
      name: "Trafione (🎯 + ✔️)",
      value: 17,
    });
    expect(pie[1]).toMatchObject({
      name: "Nietrafione typy",
      value: 11,
    });
  });
});

describe("buildPointsTimeline", () => {
  it("zwraca narastającą sumę punktów w kolejności meczów", () => {
    const timeline = buildPointsTimeline([
      createFinishedPrediction({
        kickoff_time: "2026-06-10T18:00:00.000Z",
        points_earned: 3,
      }),
      createFinishedPrediction({
        kickoff_time: "2026-06-11T18:00:00.000Z",
        points_earned: 1,
      }),
      createFinishedPrediction({
        kickoff_time: "2026-06-12T18:00:00.000Z",
        points_earned: 0,
      }),
    ]);

    expect(timeline.map((point) => point.value)).toEqual([3, 4, 4]);
  });
});

describe("createMockTimelineComparison", () => {
  it("mapuje dane mocków na ID zalogowanego użytkownika", () => {
    const comparison = createMockTimelineComparison("user-123", "Jan");

    expect(comparison.currentUser.id).toBe("user-123");
    expect(comparison.pointsTimeline[0]?.values["user-123"]).toBe(4);
    expect(comparison.pointsTimeline[0]?.values["mock-player-1"]).toBe(6);
  });

  it("wylicza pozycje rankingu z punktów, a nie ze stałej listy", () => {
    const comparison = createMockTimelineComparison("user-123", "Jan");
    const firstRound = comparison.rankingTimeline[0]?.values;

    expect(firstRound?.["mock-player-5"]).toBe(1);
    expect(firstRound?.["mock-player-1"]).toBe(2);
    expect(firstRound?.["user-123"]).toBe(4);
  });
});

describe("getVisibleComparisonPlayers", () => {
  it("domyślnie zwraca tylko zalogowanego gracza", () => {
    const comparison = createMockTimelineComparison("user-123", "Jan");
    const visible = getVisibleComparisonPlayers(comparison, []);

    expect(visible).toHaveLength(1);
    expect(visible[0]?.id).toBe("user-123");
  });

  it("dodaje wybranych graczy do widocznej listy", () => {
    const comparison = createMockTimelineComparison("user-123", "Jan");
    const visible = getVisibleComparisonPlayers(comparison, [
      "mock-player-1",
      "mock-player-3",
    ]);

    expect(visible.map((player) => player.id)).toEqual([
      "user-123",
      "mock-player-1",
      "mock-player-3",
    ]);
  });
});

describe("buildComparisonChartRows", () => {
  it("tworzy wiersze z kluczami graczy dla wielu serii", () => {
    const comparison = createMockTimelineComparison("user-123", "Jan");
    const rows = buildComparisonChartRows(comparison.pointsTimeline, [
      "user-123",
      "mock-player-1",
    ]);

    expect(rows[0]).toMatchObject({
      label: "1. kolejka",
      "user-123": 4,
      "mock-player-1": 6,
    });
  });
});

describe("areAllComparisonPlayersSelected", () => {
  it("zwraca true, gdy zaznaczeni są wszyscy gracze porównawczy", () => {
    const comparison = createMockTimelineComparison("user-123", "Jan");

    expect(
      areAllComparisonPlayersSelected(comparison.comparePlayers, [
        "mock-player-1",
        "mock-player-2",
        "mock-player-3",
        "mock-player-4",
        "mock-player-5",
        "mock-player-6",
      ]),
    ).toBe(true);
  });
});

describe("buildProfileChartData", () => {
  it("używa mocków historii, gdy brakuje wystarczających danych rzeczywistych", () => {
    const chartData = buildProfileChartData([], null, {
      currentUserId: "user-123",
      currentUserDisplayName: "Jan",
    });

    expect(chartData.usingMockTimeline).toBe(true);
    expect(chartData.timelineComparison.rankingTimeline.length).toBeGreaterThan(1);
    expect(chartData.timelineComparison.pointsTimeline.length).toBeGreaterThan(1);
    expect(chartData.timelineComparison.comparePlayers.length).toBeGreaterThan(0);
  });
});
