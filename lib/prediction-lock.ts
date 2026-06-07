export const PREDICTION_LOCK_MINUTES = 15;

const PREDICTION_LOCK_MS = PREDICTION_LOCK_MINUTES * 60 * 1000;

export function getPredictionLockDeadline(kickoffTime: string): Date {
  return new Date(new Date(kickoffTime).getTime() - PREDICTION_LOCK_MS);
}

export function isPredictionLocked(
  kickoffTime: string,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= getPredictionLockDeadline(kickoffTime).getTime();
}

export function getPredictionLockMessage(): string {
  return `Typy można składać i edytować do ${PREDICTION_LOCK_MINUTES} minut przed rozpoczęciem meczu.`;
}

export function canSubmitPrediction(
  kickoffTime: string,
  status: string,
  now: Date = new Date(),
): boolean {
  return status === "upcoming" && !isPredictionLocked(kickoffTime, now);
}
