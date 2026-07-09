import { GRAMMAR_PRONOUNS, GRAMMAR_TENSES } from "@/lib/constants";

export interface GrammarFocus {
  tense: string;
  pronouns: string[];
}

interface GrammarHistoryRow {
  focus: string;
}

export function formatGrammarFocus(tense: string, pronouns: string[]): string {
  return `${tense}:${pronouns.join(",")}`;
}

function parseGrammarFocus(focus: string): GrammarFocus | null {
  const [tense, pronounList] = focus.split(":");
  if (!tense || !pronounList) return null;
  const pronouns = pronounList
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return pronouns.length > 0 ? { tense, pronouns } : null;
}

const NEVER_USED_WEIGHT = 10;
const MAX_STALE_LESSONS = 12;
const MIN_WEIGHT = 0.5;

// recencyIndex: 0 = most recent lesson, 1 = one lesson before that, etc.
// null = never covered (highest priority).
function weightForRecency(recencyIndex: number | null): number {
  if (recencyIndex === null) return NEVER_USED_WEIGHT;
  const staleness = Math.min(recencyIndex, MAX_STALE_LESSONS) / MAX_STALE_LESSONS;
  return Math.max(MIN_WEIGHT, staleness * NEVER_USED_WEIGHT);
}

/**
 * Weighted random sampling without replacement (Efraimidis–Spirakis / A-Res),
 * same approach as selectVocabularySubset in vocabSelection.ts: higher-weight
 * items are more likely to be picked, but the result still varies between calls.
 */
function weightedPick<T>(items: readonly T[], weight: (item: T) => number, count: number): T[] {
  if (items.length <= count) return [...items];
  return items
    .map((item) => ({ item, key: Math.random() ** (1 / weight(item)) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map(({ item }) => item);
}

/**
 * Picks which tense and which pronouns the next grammar lesson must drill,
 * weighted toward whichever combos have gone longest without appearing in
 * recentHistory (assumed ordered most-recent-first) - so coverage across the
 * full pronoun x tense matrix is systematic instead of left to the AI.
 */
export function selectGrammarFocus(recentHistory: GrammarHistoryRow[], pronounCount: number): GrammarFocus {
  const parsed = recentHistory
    .map((h) => parseGrammarFocus(h.focus))
    .filter((f): f is GrammarFocus => f !== null);

  const tenseLastIndex = new Map<string, number>();
  const pronounLastIndexByTense = new Map<string, Map<string, number>>();

  parsed.forEach((entry, index) => {
    if (!tenseLastIndex.has(entry.tense)) tenseLastIndex.set(entry.tense, index);
    let pronounLastIndex = pronounLastIndexByTense.get(entry.tense);
    if (!pronounLastIndex) {
      pronounLastIndex = new Map();
      pronounLastIndexByTense.set(entry.tense, pronounLastIndex);
    }
    for (const pronoun of entry.pronouns) {
      if (!pronounLastIndex.has(pronoun)) pronounLastIndex.set(pronoun, index);
    }
  });

  const [tense] = weightedPick(
    GRAMMAR_TENSES,
    (t) => weightForRecency(tenseLastIndex.get(t) ?? null),
    1
  );

  const pronounLastIndex = pronounLastIndexByTense.get(tense) ?? new Map<string, number>();
  const pronouns = weightedPick(
    GRAMMAR_PRONOUNS,
    (p) => weightForRecency(pronounLastIndex.get(p) ?? null),
    Math.min(pronounCount, GRAMMAR_PRONOUNS.length)
  );

  return { tense, pronouns };
}
