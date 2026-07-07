import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  callClaudeForJSON,
  withToolRetry,
  ClaudeToolCallError,
  BudgetExceededError,
} from "@/lib/anthropic";
import { withDbTimeout, DbTimeoutError } from "@/lib/dbTimeout";
import { SUBMIT_STORY_TOOL, buildStorySystemPrompt, buildStoryUserMessage } from "@/lib/ai/storyPrompt";
import { storyGenerateRequestSchema, aiStoryResponseSchema } from "@/lib/validators";
import { containsArabicScript } from "@/lib/arabicScript";
import {
  STORY_MIN_VOCAB,
  STORY_MIN_SEGMENTS,
  STORY_MIN_QUESTIONS,
  STORY_CANDIDATE_POOL_SIZE,
  STORY_RECENT_TITLES_LIMIT,
} from "@/lib/constants";
import { selectVocabularySubset } from "@/lib/vocabSelection";
import { shuffle } from "@/lib/shuffle";
import type { Story, StorySegment, StoryQuestion } from "@/types";

export const maxDuration = 120;

function validateSegments(segments: StorySegment[]): StorySegment[] {
  return segments.filter((s) => !containsArabicScript([s.arabicTranslit, s.hebrewMeaning]));
}

function validateQuestions(questions: StoryQuestion[]): StoryQuestion[] {
  return questions.filter((q) => {
    if (containsArabicScript([q.question, q.questionHebrew, q.correctAnswer, ...q.options])) {
      return false;
    }
    if (q.options.length !== 4 || !q.options.includes(q.correctAnswer)) return false;
    return true;
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedRequest = storyGenerateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const { vocabularyIds } = parsedRequest.data;
  let candidates, recentHistory;
  try {
    candidates = await withDbTimeout(
      prisma.vocabulary.findMany({
        where: vocabularyIds ? { id: { in: vocabularyIds } } : undefined,
        include: { practiceHistory: true },
      }),
      "vocabulary.findMany"
    );

    if (candidates.length < STORY_MIN_VOCAB) {
      return NextResponse.json(
        { error: "צריך לפחות 5 מילים באוצר כדי ליצור סיפור" },
        { status: 400 }
      );
    }

    recentHistory = await withDbTimeout(
      prisma.storyHistory.findMany({
        orderBy: { createdAt: "desc" },
        take: STORY_RECENT_TITLES_LIMIT,
        select: { title: true },
      }),
      "storyHistory.findMany"
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

  // Sample a rotating subset (weighted toward weak/stale words) instead of always
  // sending the whole growing vocabulary list, so the story's material - and topic -
  // actually varies between generations.
  const vocab = selectVocabularySubset(candidates, STORY_CANDIDATE_POOL_SIZE);

  const system = buildStorySystemPrompt();
  const userMessage = buildStoryUserMessage(
    vocab,
    recentHistory.map((h: { title: string }) => h.title)
  );

  async function attemptGenerate(): Promise<{
    title: string;
    segments: StorySegment[];
    questions: StoryQuestion[];
  } | null> {
    let result: unknown;
    try {
      result = await callClaudeForJSON({
        system,
        userMessage,
        tool: SUBMIT_STORY_TOOL,
      });
    } catch (err) {
      if (err instanceof ClaudeToolCallError) return null;
      throw err;
    }
    const validated = aiStoryResponseSchema.safeParse(result);
    if (!validated.success) return null;
    const built = {
      title: validated.data.title,
      segments: validateSegments(validated.data.segments as StorySegment[]),
      questions: validateQuestions(validated.data.questions as StoryQuestion[]),
    };
    return isGoodEnough(built) ? built : null;
  }

  function isGoodEnough(
    a: { segments: StorySegment[]; questions: StoryQuestion[] } | null
  ): boolean {
    return !!a && a.segments.length >= STORY_MIN_SEGMENTS && a.questions.length >= STORY_MIN_QUESTIONS;
  }

  let attempt: { title: string; segments: StorySegment[]; questions: StoryQuestion[] } | null;
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
      { error: "לא הצלחנו להכין סיפור תקין, נסה/י שוב" },
      { status: 502 }
    );
  }

  // The model tends to list the correct answer first among options, so shuffle
  // before serving — matching against correctAnswer is by value, not index.
  const story: Story = {
    title: attempt.title,
    segments: attempt.segments,
    questions: attempt.questions.map((q) => ({ ...q, options: shuffle(q.options) })),
  };

  return NextResponse.json({ story });
}
