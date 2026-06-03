type MatchOutcome = "win_a" | "win_b" | "draw";

function getOutcome(scoreA: number, scoreB: number): MatchOutcome {
  if (scoreA > scoreB) return "win_a";
  if (scoreA < scoreB) return "win_b";
  return "draw";
}

/**
 * 3 pkt — dokładny wynik; 1 pkt — poprawny zwycięzca/remis; 0 pkt — nietrafiony rezultat.
 */
export function calculatePoints(
  predictedA: number,
  predictedB: number,
  realA: number,
  realB: number,
): number {
  if (predictedA === realA && predictedB === realB) {
    return 3;
  }

  if (getOutcome(predictedA, predictedB) === getOutcome(realA, realB)) {
    return 1;
  }

  return 0;
}
