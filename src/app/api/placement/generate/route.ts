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
  SUBMIT_PLACEMENT_TEST_TOOL,
  buildPlacementSystemPrompt,
  buildPlacementUserMessage,
} from "@/lib/ai/placementPrompt";
import { placementGenerateRequestSchema, aiPlacementResponseSchema } from "@/lib/validators";
import { containsArabicScript } from "@/lib/arabicScript";
import { selectVocabularySubset } from "@/lib/vocabSelection";
import { shuffle } from "@/lib/shuffle";
import { LEARNER_MAX_LEVEL } from "@/lib/constants";
import type { PlacementQuestion, PlacementTest } from "@/types";

export const maxDuration = 120;

// Size of the vocab hint pool sent to the model (only a topical hint; the test
// deliberately isn't limited to the learner's own words).
const PLACEMENT_VOCAB_HINT_SIZE = 12;
// Require at least one usable question per band so scoring stays meaningful.
const MIN_QUESTIONS = LEARNER_MAX_LEVEL;

function validateQuestions(questions: PlacementQuestion[]): PlacementQuestion[] {
  return questions.filter((q) => {
    if (q.level < 1 || q.level > LEARNER_MAX_LEVEL) return false;
    if (!q.options || q.options.length !== 4) return false;
    if (!q.options.includes(q.correctAnswer)) return false;
    if (containsArabicScript([q.question, q.correctAnswer, ...q.options])) return false;
    return true;
  });
}

// True only when every difficulty band has at least one valid question, so the
// contiguous-band scoring can actually reach the higher levels.
function coversAllBands(questions: PlacementQuestion[]): boolean {
  for (let band = 1; band <= LEARNER_MAX_LEVEL; band++) {
    if (!questions.some((q) => q.level === band)) return false;
  }
  return true;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsedRequest = placementGenerateRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const { vocabularyIds } = parsedRequest.data;
  let candidates;
  try {
    candidates = await withDbTimeout(
      prisma.vocabulary.findMany({
        where: vocabularyIds ? { id: { in: vocabularyIds } } : undefined,
        include: { practiceHistory: true },
      }),
      "vocabulary.findMany"
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

  // A topical hint only — placement works even with an empty vocabulary.
  const vocab = selectVocabularySubset(candidates, PLACEMENT_VOCAB_HINT_SIZE);

  const system = buildPlacementSystemPrompt();
  const userMessage = buildPlacementUserMessage(vocab);

  function isGoodEnough(a: { questions: PlacementQuestion[] } | null): boolean {
    return !!a && a.questions.length >= MIN_QUESTIONS && coversAllBands(a.questions);
  }

  async function attemptGenerate(): Promise<{ title: string; questions: PlacementQuestion[] } | null> {
    let result: unknown;
    try {
      result = await callClaudeForJSON({
        system,
        userMessage,
        tool: SUBMIT_PLACEMENT_TEST_TOOL,
      });
    } catch (err) {
      if (err instanceof ClaudeToolCallError) return null;
      throw err;
    }
    const validated = aiPlacementResponseSchema.safeParse(result);
    if (!validated.success) return null;
    const built = {
      title: validated.data.title,
      questions: validateQuestions(validated.data.questions as PlacementQuestion[]),
    };
    return isGoodEnough(built) ? built : null;
  }

  let attempt: { title: string; questions: PlacementQuestion[] } | null;
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
      { error: "לא הצלחנו להכין מבחן רמה תקין, נסה/י שוב" },
      { status: 502 }
    );
  }

  // Ask easy bands first so the experience ramps up, then shuffle each
  // question's options (the model tends to list the correct one first).
  const sorted = [...attempt.questions].sort((a, b) => a.level - b.level);
  const test: PlacementTest = {
    title: attempt.title,
    questions: sorted.map((q) => ({ ...q, options: shuffle(q.options) })),
  };

  return NextResponse.json({ test });
}
