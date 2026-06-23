import { levenshteinDistance } from "@/lib/levenshtein";

const SOFIT_MAP: Record<string, string> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};

const PUNCTUATION_PATTERN = /[.,!?;:'"״׳\-_()[\]{}]/g;

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(PUNCTUATION_PATTERN, "")
    .replace(/\s+/g, " ")
    .replace(/[ךםןףץ]/g, (char) => SOFIT_MAP[char])
    .trim();
}

export function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  if (normalizedUser.length === 0) return false;
  if (normalizedUser === normalizedCorrect) return true;

  const maxAllowedDistance = Math.max(1, Math.floor(normalizedCorrect.length * 0.2));
  return levenshteinDistance(normalizedUser, normalizedCorrect) <= maxAllowedDistance;
}
