import { describe, expect, it } from "vitest";
import { assignCompetitionPositions } from "@/lib/competition-rank";

describe("assignCompetitionPositions", () => {
  it("przypisuje kolejne miejsca przy unikalnych wynikach", () => {
    const items = [{ points: 10 }, { points: 8 }, { points: 5 }];

    expect(
      assignCompetitionPositions(items, (item) => item.points),
    ).toEqual([1, 2, 3]);
  });

  it("nadaje to samo miejsce graczom z równą liczbą punktów", () => {
    const items = [
      { points: 3 },
      { points: 3 },
      { points: 3 },
      { points: 1 },
    ];

    expect(
      assignCompetitionPositions(items, (item) => item.points),
    ).toEqual([1, 1, 1, 4]);
  });

  it("obsługuje remisy w środku listy", () => {
    const items = [
      { points: 10 },
      { points: 7 },
      { points: 7 },
      { points: 4 },
      { points: 4 },
      { points: 0 },
    ];

    expect(
      assignCompetitionPositions(items, (item) => item.points),
    ).toEqual([1, 2, 2, 4, 4, 6]);
  });

  it("zwraca pustą tablicę dla pustej listy", () => {
    expect(assignCompetitionPositions([], () => 0)).toEqual([]);
  });
});
