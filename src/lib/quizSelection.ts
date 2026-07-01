import type { VocabularyWithHistory } from "@/types";

const NEVER_PRACTICED_WEIGHT = 10;
const MAX_STALE_DAYS = 30;
const MIN_WEIGHT = 0.5;

function priorityWeight(item: VocabularyWithHistory): number {
  const history = item.practiceHistory;
  if (!history) return NEVER_PRACTICED_WEIGHT;

  const total = history.correctCount + history.wrongCount;
  const wrongRatio = total > 0 ? history.wrongCount / total : 0;

  const daysSincePracticed = history.lastPracticed
    ? (Date.now() - history.lastPracticed.getTime()) / 86_400_000
    : MAX_STALE_DAYS;
  const staleness = Math.min(daysSincePracticed, MAX_STALE_DAYS) / MAX_STALE_DAYS;

  return Math.max(MIN_WEIGHT, wrongRatio * 8 + staleness * 2);
}

/**
 * Weighted random sampling without replacement (Efraimidis–Spirakis / A-Res):
 * assigns each item a key of Math.random() ** (1/weight) and keeps the top `limit` keys.
 * Higher-weight items are more likely to be picked, but the result still varies
 * between calls so the same words aren't served every time.
 */
export function selectQuizVocabulary<T extends VocabularyWithHistory>(
  vocab: T[],
  limit: number
): T[] {
  if (vocab.length <= limit) return vocab;

  return vocab
    .map((item) => ({ item, key: Math.random() ** (1 / priorityWeight(item)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, limit)
    .map(({ item }) => item);
}
