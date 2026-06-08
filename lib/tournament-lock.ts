export function getTournamentLockMessage(): string {
  return "Typowanie turniejowe jest zamknięte — pierwszy mecz turnieju już się rozpoczął.";
}

export function isTournamentPredictionLocked(
  firstMatchKickoff: string | null,
  now: Date = new Date(),
): boolean {
  if (!firstMatchKickoff) {
    return false;
  }

  return now.getTime() >= new Date(firstMatchKickoff).getTime();
}

export function canSubmitTournamentPrediction(
  firstMatchKickoff: string | null,
  now: Date = new Date(),
): boolean {
  return !isTournamentPredictionLocked(firstMatchKickoff, now);
}
