import { describe, it, expect } from "vitest";
import {
  isPredictionLocked,
  canSubmitPrediction,
  getPredictionLockDeadline,
  PREDICTION_LOCK_MINUTES,
} from "@/lib/prediction-lock";

const kickoff = "2026-06-11T18:00:00.000Z";
const deadline = new Date("2026-06-11T17:45:00.000Z"); // 15 min przed kickoffem

describe("getPredictionLockDeadline", () => {
  it("zwraca kickoff minus PREDICTION_LOCK_MINUTES", () => {
    expect(getPredictionLockDeadline(kickoff).toISOString()).toBe(
      deadline.toISOString(),
    );
  });

  it("używa stałej 15 minut", () => {
    expect(PREDICTION_LOCK_MINUTES).toBe(15);
  });
});

describe("isPredictionLocked", () => {
  it("nie jest zablokowane na 16 min przed meczem", () => {
    expect(
      isPredictionLocked(kickoff, new Date("2026-06-11T17:44:00.000Z")),
    ).toBe(false);
  });

  it("jest zablokowane dokładnie w momencie deadline (warunek >=)", () => {
    expect(isPredictionLocked(kickoff, deadline)).toBe(true);
  });

  it("jest zablokowane sekundę po deadline", () => {
    expect(
      isPredictionLocked(kickoff, new Date("2026-06-11T17:45:01.000Z")),
    ).toBe(true);
  });

  it("jest zablokowane po rozpoczęciu meczu", () => {
    expect(
      isPredictionLocked(kickoff, new Date("2026-06-11T18:30:00.000Z")),
    ).toBe(true);
  });
});

describe("canSubmitPrediction", () => {
  it("pozwala dla statusu 'upcoming' przed lockiem", () => {
    expect(
      canSubmitPrediction(kickoff, "upcoming", new Date("2026-06-11T17:00:00.000Z")),
    ).toBe(true);
  });

  it("blokuje mecz zakończony, nawet długo przed kickoffem", () => {
    expect(
      canSubmitPrediction(kickoff, "finished", new Date("2026-06-11T10:00:00.000Z")),
    ).toBe(false);
  });

  it("blokuje status 'upcoming' po deadline", () => {
    expect(canSubmitPrediction(kickoff, "upcoming", deadline)).toBe(false);
  });

  it("blokuje nieznany status", () => {
    expect(
      canSubmitPrediction(kickoff, "live", new Date("2026-06-11T17:00:00.000Z")),
    ).toBe(false);
  });
});
