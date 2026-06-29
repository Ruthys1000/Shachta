import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeForJSON, ClaudeToolCallError, BudgetExceededError } from "@/lib/anthropic";
import {
  SUBMIT_SENTENCE_LESSON_TOOL,
  buildSentenceLessonSystemPrompt,
  buildSentenceLessonUserMessage,
} from "@/lib/ai/sentenceLessonPrompt";
import { sentenceLessonGenerateRequestSchema, aiSentenceLessonResponseSchema } from "@/lib/validators";
import { containsArabicScript } from "@/lib/arabicScript";
import {
  SENTENCE_LESSON_MIN_VOCAB,
  SENTENCE_LESSON_MIN_EXAMPLES,
  SENTENCE_LESSON_MIN_EXERCISES,
  SENTENCE_LESSON_LEVEL_STEP,
  SENTENCE_LESSON_MAX_LEVEL,
  SENTENCE_LESSON_RECENT_TITLES_LIMIT,
} from "@/lib/constants";
import type { SentenceLessonExample, SentenceBuildExercise } from "@/types";

export const maxDuration = 60;

function validateExamples(examples: SentenceLessonExample[]): SentenceLessonExample[] {
  return examples.filter(
    (example) =>
      !containsArabicScript([
        example.arabicTranslit,
        example.hebrewMeaning,
        ...example.words.flatMap((w) => [w.arabicTranslit, w.hebrewMeaning, w.role]),
      ])
  );
}

function validateExercises(exercises: SentenceBuildExercise[]): SentenceBuildExercise[] {
  return exercises.filter(
    (exercise) =>
      exercise.correctOrder.length >= 2 &&
      !containsArabicScript([exercise.hebrewMeaning, ...exercise.correctOrder])
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedRequest = sentenceLessonGenerateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const { vocabularyIds } = parsedRequest.data;
  const vocab = await prisma.vocabulary.findMany({
    where: vocabularyIds ? { id: { in: vocabularyIds } } : undefined,
    select: { arabicTranslit: true, hebrewMeaning: true, itemType: true },
  });

  if (vocab.length < SENTENCE_LESSON_MIN_VOCAB) {
    return NextResponse.json(
      { error: "צריך לפחות 6 מילים באוצר כדי ללמוד בניית משפט" },
      { status: 400 }
    );
  }

  const lessonsCompleted = await prisma.sentenceLessonHistory.count();
  const level = Math.min(SENTENCE_LESSON_MAX_LEVEL, Math.floor(lessonsCompleted / SENTENCE_LESSON_LEVEL_STEP) + 1);
  const recentHistory = await prisma.sentenceLessonHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: SENTENCE_LESSON_RECENT_TITLES_LIMIT,
    select: { title: true },
  });

  const system = buildSentenceLessonSystemPrompt(level);
  const userMessage = buildSentenceLessonUserMessage(
    vocab,
    recentHistory.map((h: { title: string }) => h.title)
  );

  async function attemptGenerate(): Promise<{
    title: string;
    ruleExplanation: string;
    examples: SentenceLessonExample[];
    exercises: SentenceBuildExercise[];
  } | null> {
    let result: unknown;
    try {
      result = await callClaudeForJSON({
        system,
        userMessage,
        tool: SUBMIT_SENTENCE_LESSON_TOOL,
      });
    } catch (err) {
      if (err instanceof ClaudeToolCallError) return null;
      throw err;
    }
    const validated = aiSentenceLessonResponseSchema.safeParse(result);
    if (!validated.success) return null;
    return {
      title: validated.data.title,
      ruleExplanation: validated.data.ruleExplanation,
      examples: validateExamples(validated.data.examples as SentenceLessonExample[]),
      exercises: validateExercises(validated.data.exercises as SentenceBuildExercise[]),
    };
  }

  function isGoodEnough(
    a: { examples: SentenceLessonExample[]; exercises: SentenceBuildExercise[] } | null
  ): boolean {
    return (
      !!a &&
      a.examples.length >= SENTENCE_LESSON_MIN_EXAMPLES &&
      a.exercises.length >= SENTENCE_LESSON_MIN_EXERCISES
    );
  }

  let attempt: {
    title: string;
    ruleExplanation: string;
    examples: SentenceLessonExample[];
    exercises: SentenceBuildExercise[];
  } | null;
  try {
    attempt = await attemptGenerate();

    if (!isGoodEnough(attempt)) {
      const retry = await attemptGenerate();
      if (isGoodEnough(retry)) {
        attempt = retry;
      }
    }
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
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
    examples: attempt.examples,
    exercises: attempt.exercises,
  };

  return NextResponse.json({ lesson });
}
