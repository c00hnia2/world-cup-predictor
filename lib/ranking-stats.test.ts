import { describe, it, expect } from "vitest";
import { calculatePoints } from "@/lib/scoring";
import { getPredictionRankingBuckets } from "@/lib/ranking-stats";

describe("getPredictionRankingBuckets", () => {
  it("dokładny wynik liczy się tylko jako exact score", () => {
    const points = calculatePoints(2, 1, 2, 1);
    expect(points).toBe(3);
    expect(getPredictionRankingBuckets(points)).toEqual({
      exactScore: true,
      correctOutcome: false,
    });
  });

  it("trafiony zwycięzca bez dokładnego wyniku liczy się tylko jako correct outcome", () => {
    const points = calculatePoints(2, 0, 2, 1);
    expect(points).toBe(1);
    expect(getPredictionRankingBuckets(points)).toEqual({
      exactScore: false,
      correctOutcome: true,
    });
  });

  it("nietrafiony typ nie zwiększa żadnej statystyki", () => {
    const points = calculatePoints(2, 1, 1, 2);
    expect(points).toBe(0);
    expect(getPredictionRankingBuckets(points)).toEqual({
      exactScore: false,
      correctOutcome: false,
    });
  });
});
