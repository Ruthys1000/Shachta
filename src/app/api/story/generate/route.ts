import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeForJSON, ClaudeToolCallError, BudgetExceededError } from "@/lib/anthropic";
import { SUBMIT_STORY_TOOL, buildStorySystemPrompt, buildStoryUserMessage } from "@/lib/ai/storyPrompt";
import { storyGenerateRequestSchema, aiStoryResponseSchema } from "@/lib/validators";
import { containsArabicScript } from "@/lib/arabicScript";
import { STORY_MIN_VOCAB, STORY_MIN_SEGMENTS, STORY_MIN_QUESTIONS } from "@/lib/constants";
import type { Story, StorySegment, StoryQuestion } from "@/types";

function validateSegments(segments: StorySegment[]): StorySegment[] {
  return segments.filter((s) => !containsArabicScript([s.arabicTranslit, s.hebrewMeaning]));
}

function validateQuestions(questions: StoryQuestion[]): StoryQuestion[] {
  return questions.filter(
    (q) => !containsArabicScript([q.question, q.questionHebrew, q.correctAnswer])
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedRequest = storyGenerateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const { vocabularyIds } = parsedRequest.data;
  const vocab = await prisma.vocabulary.findMany({
    where: vocabularyIds ? { id: { in: vocabularyIds } } : undefined,
    select: { arabicTranslit: true, hebrewMeaning: true, itemType: true },
  });

  if (vocab.length < STORY_MIN_VOCAB) {
    return NextResponse.json(
      { error: "צריך לפחות 5 מילים באוצר כדי ליצור סיפור" },
      { status: 400 }
    );
  }

  const system = buildStorySystemPrompt();
  const userMessage = buildStoryUserMessage(vocab);

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
    return {
      title: validated.data.title,
      segments: validateSegments(validated.data.segments as StorySegment[]),
      questions: validateQuestions(validated.data.questions as StoryQuestion[]),
    };
  }

  function isGoodEnough(
    a: { segments: StorySegment[]; questions: StoryQuestion[] } | null
  ): boolean {
    return !!a && a.segments.length >= STORY_MIN_SEGMENTS && a.questions.length >= STORY_MIN_QUESTIONS;
  }

  let attempt: { title: string; segments: StorySegment[]; questions: StoryQuestion[] } | null;
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
      { error: "לא הצלחנו להכין סיפור תקין, נסה/י שוב" },
      { status: 502 }
    );
  }

  const story: Story = {
    title: attempt.title,
    segments: attempt.segments,
    questions: attempt.questions,
  };

  return NextResponse.json({ story });
}
