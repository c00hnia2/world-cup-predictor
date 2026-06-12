/**
 * Standard competition ranking (1, 1, 3, …) for a list sorted by points descending.
 * Tied players share the same position; the next distinct score skips intervening ranks.
 */
export function assignCompetitionPositions<T>(
  items: readonly T[],
  getPoints: (item: T) => number,
): number[] {
  if (items.length === 0) {
    return [];
  }

  const positions: number[] = [1];

  for (let index = 1; index < items.length; index++) {
    if (getPoints(items[index]) === getPoints(items[index - 1])) {
      positions.push(positions[index - 1]);
    } else {
      positions.push(index + 1);
    }
  }

  return positions;
}
