import { describe, it, expect } from "vitest";
import { calculatePoints } from "@/lib/scoring";

describe("calculatePoints", () => {
  it("przyznaje 3 pkt za dokładny wynik", () => {
    expect(calculatePoints(2, 1, 2, 1)).toBe(3);
    expect(calculatePoints(0, 0, 0, 0)).toBe(3);
    expect(calculatePoints(3, 3, 3, 3)).toBe(3);
  });

  it("przyznaje 1 pkt za poprawnego zwycięzcę przy złym wyniku", () => {
    expect(calculatePoints(2, 0, 3, 1)).toBe(1); // wygrana gospodarzy
    expect(calculatePoints(0, 2, 1, 4)).toBe(1); // wygrana gości
  });

  it("przyznaje 1 pkt za trafiony remis przy różnym wyniku", () => {
    expect(calculatePoints(1, 1, 2, 2)).toBe(1);
    expect(calculatePoints(0, 0, 3, 3)).toBe(1);
  });

  it("przyznaje 0 pkt za nietrafiony kierunek", () => {
    expect(calculatePoints(2, 1, 1, 2)).toBe(0); // typ: gospodarze, realnie: goście
    expect(calculatePoints(1, 1, 2, 0)).toBe(0); // typ: remis, realnie: wygrana
    expect(calculatePoints(3, 0, 0, 0)).toBe(0); // typ: wygrana, realnie: remis
  });

  it("nie myli dokładnego remisu z trafionym kierunkiem", () => {
    expect(calculatePoints(0, 0, 1, 1)).toBe(1);
    expect(calculatePoints(1, 1, 1, 1)).toBe(3);
  });

  it("jest symetryczne względem zamiany stron", () => {
    expect(calculatePoints(2, 1, 0, 3)).toBe(0);
    expect(calculatePoints(1, 2, 0, 3)).toBe(1);
  });
});
