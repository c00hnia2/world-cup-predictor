import { describe, expect, it } from "vitest";
import { computeRankingValuesByUserId } from "@/lib/compute-round-ranking";

describe("computeRankingValuesByUserId", () => {
  it("sortuje graczy przed przypisaniem pozycji (wyższe punkty = niższa pozycja)", () => {
    const ranking = computeRankingValuesByUserId([
      {
        id: "low",
        total_points: 5,
        exact_scores_count: 0,
        correct_outcomes_count: 0,
      },
      {
        id: "high",
        total_points: 20,
        exact_scores_count: 0,
        correct_outcomes_count: 0,
      },
      {
        id: "mid",
        total_points: 12,
        exact_scores_count: 0,
        correct_outcomes_count: 0,
      },
    ]);

    expect(ranking).toEqual({
      high: 1,
      mid: 2,
      low: 3,
    });
  });

  it("obsługuje remisy w rankingu konkurencyjnym", () => {
    const ranking = computeRankingValuesByUserId([
      {
        id: "a",
        total_points: 10,
        exact_scores_count: 2,
        correct_outcomes_count: 1,
      },
      {
        id: "b",
        total_points: 10,
        exact_scores_count: 2,
        correct_outcomes_count: 1,
      },
      {
        id: "c",
        total_points: 8,
        exact_scores_count: 1,
        correct_outcomes_count: 2,
      },
    ]);

    expect(ranking.a).toBe(1);
    expect(ranking.b).toBe(1);
    expect(ranking.c).toBe(3);
  });
});
