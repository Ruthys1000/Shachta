import { LEARNER_MAX_LEVEL, PLACEMENT_BAND_PASS_RATIO } from "@/lib/constants";

export interface PlacementAnswer {
  /** The band the answered question belonged to, 1..LEARNER_MAX_LEVEL. */
  level: number;
  correct: boolean;
}

/**
 * Derive a placement level (1..LEARNER_MAX_LEVEL) from graded answers.
 *
 * A band "passes" when at least PLACEMENT_BAND_PASS_RATIO of its questions were
 * answered correctly. The result is the highest band L such that every band from
 * 1 up to L passed (contiguous mastery). Falls back to 1 if band 1 itself fails
 * or has no questions.
 */
export function computePlacementLevel(answers: PlacementAnswer[]): number {
  const passed = (band: number): boolean => {
    const inBand = answers.filter((a) => a.level === band);
    if (inBand.length === 0) return false;
    const correct = inBand.filter((a) => a.correct).length;
    return correct / inBand.length >= PLACEMENT_BAND_PASS_RATIO;
  };

  let level = 1;
  for (let band = 1; band <= LEARNER_MAX_LEVEL; band++) {
    if (!passed(band)) break;
    level = band;
  }
  return level;
}
