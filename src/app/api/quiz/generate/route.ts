import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callClaudeForJSON, ClaudeToolCallError, BudgetExceededError } from "@/lib/anthropic";
import { SUBMIT_QUIZ_TOOL, buildQuizSystemPrompt, buildQuizUserMessage } from "@/lib/ai/quizPrompt";
import { quizGenerateRequestSchema, aiQuizResponseSchema } from "@/lib/validators";
import { containsArabicScript } from "@/lib/arabicScript";
import {
  QUIZ_MIN_QUESTIONS,
  QUIZ_MAX_QUESTIONS,
  QUIZ_MULTIPLE_CHOICE_MIN_VOCAB,
} from "@/lib/constants";
import type { Quiz, QuizQuestion } from "@/types";

export const maxDuration = 120;

function validateQuestions(
  questions: QuizQuestion[],
  validVocabIds: Set<string>
): QuizQuestion[] {
  return questions.filter((q) => {
    if (!validVocabIds.has(q.sourceVocabId)) return false;
    if (containsArabicScript([q.question, q.correctAnswer, ...(q.options ?? [])])) return false;
    if (q.type === "multiple_choice") {
      if (!q.options || q.options.length !== 4) return false;
      if (!q.options.includes(q.correctAnswer)) return false;
    }
    return true;
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedRequest = quizGenerateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const { vocabularyIds } = parsedRequest.data;
  const vocab = await prisma.vocabulary.findMany({
    where: vocabularyIds ? { id: { in: vocabularyIds } } : undefined,
    select: { id: true, arabicTranslit: true, hebrewMeaning: true, itemType: true },
  });

  if (vocab.length === 0) {
    return NextResponse.json({ error: "אין עדיין מילים במאגר" }, { status: 400 });
  }

  const validVocabIds = new Set(vocab.map((v) => v.id));
  const allowMultipleChoice = vocab.length >= QUIZ_MULTIPLE_CHOICE_MIN_VOCAB;
  const questionCount =
    parsedRequest.data.questionCount ??
    Math.min(QUIZ_MAX_QUESTIONS, Math.max(QUIZ_MIN_QUESTIONS, vocab.length));

  const system = buildQuizSystemPrompt(allowMultipleChoice);
  const userMessage = buildQuizUserMessage(vocab, questionCount);

  async function attemptGenerate(): Promise<{ title: string; questions: QuizQuestion[] } | null> {
    let result: unknown;
    try {
      result = await callClaudeForJSON({
        system,
        userMessage,
        tool: SUBMIT_QUIZ_TOOL,
      });
    } catch (err) {
      if (err instanceof ClaudeToolCallError) return null;
      throw err;
    }
    const validated = aiQuizResponseSchema.safeParse(result);
    if (!validated.success) return null;
    return {
      title: validated.data.title,
      questions: validateQuestions(validated.data.questions as QuizQuestion[], validVocabIds),
    };
  }

  let attempt: { title: string; questions: QuizQuestion[] } | null;
  try {
    attempt = await attemptGenerate();

    if (!attempt || attempt.questions.length < QUIZ_MIN_QUESTIONS) {
      const retry = await attemptGenerate();
      if (retry && retry.questions.length >= (attempt?.questions.length ?? 0)) {
        attempt = retry;
      }
    }
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  if (!attempt || attempt.questions.length < QUIZ_MIN_QUESTIONS) {
    return NextResponse.json(
      { error: "לא הצלחנו להכין מבדק תקין, נסה/י שוב" },
      { status: 502 }
    );
  }

  const quiz: Quiz = {
    title: attempt.title,
    questions: attempt.questions.slice(0, questionCount),
  };

  return NextResponse.json({ quiz });
}
