import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  callClaudeForJSON,
  withToolRetry,
  ClaudeToolCallError,
  BudgetExceededError,
} from "@/lib/anthropic";
import { withDbTimeout, DbTimeoutError } from "@/lib/dbTimeout";
import {
  SUBMIT_GRAMMAR_LESSON_TOOL,
  buildGrammarSystemPrompt,
  buildGrammarUserMessage,
} from "@/lib/ai/grammarPrompt";
import { grammarGenerateRequestSchema, aiGrammarLessonResponseSchema } from "@/lib/validators";
import { containsArabicScript } from "@/lib/arabicScript";
import {
  GRAMMAR_LESSON_MIN_VOCAB,
  GRAMMAR_LESSON_MIN_EXERCISES,
  GRAMMAR_LEVEL_STEP,
  GRAMMAR_MAX_LEVEL,
  GRAMMAR_RECENT_FOCUS_LOOKBACK,
} from "@/lib/constants";
import { getPlacementLevel, withPlacementFloor } from "@/lib/level";
import { selectGrammarFocus, formatGrammarFocus } from "@/lib/grammarFocusSelection";
import type { GrammarConjugationExample, GrammarExercise } from "@/types";

export const maxDuration = 120;

// How many pronouns one lesson drills at once, scaled by level.
const PRONOUN_COUNT_BY_LEVEL: Record<number, number> = { 1: 2, 2: 3, 3: 4, 4: 5 };

function validateConjugations(rows: GrammarConjugationExample[]): GrammarConjugationExample[] {
  return rows.filter((r) => !containsArabicScript([r.pronoun, r.arabicTranslit, r.hebrewMeaning]));
}

function validateExercises(exercises: GrammarExercise[]): GrammarExercise[] {
  return exercises.filter((e) => {
    if (containsArabicScript([e.promptHebrew, e.correctAnswer, ...e.options])) return false;
    if (e.options.length !== 4 || !e.options.includes(e.correctAnswer)) return false;
    return true;
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedRequest = grammarGenerateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const { vocabularyIds } = parsedRequest.data;
  let vocab, lessonsCompleted, recentHistory, placementLevel;
  try {
    vocab = await withDbTimeout(
      prisma.vocabulary.findMany({
        where: vocabularyIds ? { id: { in: vocabularyIds } } : undefined,
        select: { arabicTranslit: true, hebrewMeaning: true, itemType: true },
      }),
      "vocabulary.findMany"
    );

    if (vocab.length < GRAMMAR_LESSON_MIN_VOCAB) {
      return NextResponse.json(
        { error: "צריך לפחות 6 מילים באוצר כדי לתרגל דקדוק" },
        { status: 400 }
      );
    }

    [lessonsCompleted, recentHistory, placementLevel] = await withDbTimeout(
      Promise.all([
        prisma.grammarLessonHistory.count(),
        prisma.grammarLessonHistory.findMany({
          orderBy: { createdAt: "desc" },
          take: GRAMMAR_RECENT_FOCUS_LOOKBACK,
          select: { focus: true },
        }),
        getPlacementLevel(),
      ]),
      "grammarLessonHistory"
    );
  } catch (err) {
    if (err instanceof DbTimeoutError) {
      return NextResponse.json(
        { error: "בעיה זמנית בגישה למאגר הנתונים, נסה/י שוב" },
        { status: 503 }
      );
    }
    throw err;
  }

  // Placement test sets a baseline; completed-lesson count can raise it further.
  const derivedLevel = Math.floor(lessonsCompleted / GRAMMAR_LEVEL_STEP) + 1;
  const level = withPlacementFloor(placementLevel, derivedLevel, GRAMMAR_MAX_LEVEL);
  const pronounCount = PRONOUN_COUNT_BY_LEVEL[level] ?? 2;
  const { tense, pronouns } = selectGrammarFocus(recentHistory, pronounCount);
  const focus = formatGrammarFocus(tense, pronouns);

  const system = buildGrammarSystemPrompt(level, tense, pronouns);
  const userMessage = buildGrammarUserMessage(vocab, tense, pronouns);

  async function attemptGenerate(): Promise<{
    title: string;
    ruleExplanation: string;
    conjugationExamples: GrammarConjugationExample[];
    exercises: GrammarExercise[];
  } | null> {
    let result: unknown;
    try {
      result = await callClaudeForJSON({
        system,
        userMessage,
        tool: SUBMIT_GRAMMAR_LESSON_TOOL,
      });
    } catch (err) {
      if (err instanceof ClaudeToolCallError) return null;
      throw err;
    }
    const validated = aiGrammarLessonResponseSchema.safeParse(result);
    if (!validated.success) return null;
    const built = {
      title: validated.data.title,
      ruleExplanation: validated.data.ruleExplanation,
      conjugationExamples: validateConjugations(
        validated.data.conjugationExamples as GrammarConjugationExample[]
      ),
      exercises: validateExercises(validated.data.exercises as GrammarExercise[]),
    };
    return isGoodEnough(built) ? built : null;
  }

  function isGoodEnough(
    a: { conjugationExamples: GrammarConjugationExample[]; exercises: GrammarExercise[] } | null
  ): boolean {
    // The prompt asks for exactly one conjugation row per required pronoun,
    // so that (not a static constant) is the real per-lesson minimum.
    return (
      !!a &&
      a.conjugationExamples.length >= pronouns.length &&
      a.exercises.length >= GRAMMAR_LESSON_MIN_EXERCISES
    );
  }

  let attempt: {
    title: string;
    ruleExplanation: string;
    conjugationExamples: GrammarConjugationExample[];
    exercises: GrammarExercise[];
  } | null;
  try {
    attempt = await withToolRetry(attemptGenerate);
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    if (err instanceof DbTimeoutError) {
      return NextResponse.json(
        { error: "בעיה זמנית בגישה למאגר הנתונים, נסה/י שוב" },
        { status: 503 }
      );
    }
    throw err;
  }

  if (!isGoodEnough(attempt) || !attempt) {
    return NextResponse.json(
      { error: "לא הצלחנו להכין שיעור תקין, נסה/י שוב" },
      { status: 502 }
    );
  }

  const lesson = {
    title: attempt.title,
    ruleExplanation: attempt.ruleExplanation,
    tense,
    pronouns,
    focus,
    conjugationExamples: attempt.conjugationExamples,
    exercises: attempt.exercises,
  };

  return NextResponse.json({ lesson });
}
