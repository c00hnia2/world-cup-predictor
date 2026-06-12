function areRankingCriteriaEqual(
  left: readonly number[],
  right: readonly number[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

/**
 * Standard competition ranking (1, 1, 3, …) for a list sorted by criteria descending.
 * Tied players share the same position when all criteria match; the next distinct
 * result skips intervening ranks.
 */
export function assignCompetitionPositions<T>(
  items: readonly T[],
  getCriteria: (item: T) => readonly number[],
): number[] {
  if (items.length === 0) {
    return [];
  }

  const positions: number[] = [1];

  for (let index = 1; index < items.length; index++) {
    if (
      areRankingCriteriaEqual(
        getCriteria(items[index]),
        getCriteria(items[index - 1]),
      )
    ) {
      positions.push(positions[index - 1]);
    } else {
      positions.push(index + 1);
    }
  }

  return positions;
}
