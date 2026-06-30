import { NextResponse } from "next/server";
import {
  callClaudeVisionForJSON,
  withToolRetry,
  ClaudeToolCallError,
  BudgetExceededError,
} from "@/lib/anthropic";
import {
  SUBMIT_LESSON_PARSE_TOOL,
  LESSON_PARSE_SYSTEM_PROMPT,
  buildLessonParseUserMessage,
} from "@/lib/ai/lessonParsePrompt";
import { lessonParseRequestSchema, aiLessonParseResponseSchema } from "@/lib/validators";
import type { LessonParseResponse, ParsedVocabItem } from "@/types";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedRequest = lessonParseRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "תמונות לא תקינות" }, { status: 400 });
  }

  const images = parsedRequest.data.images;

  // Each page is parsed in its own Claude call (run in parallel) instead of one call
  // covering all pages: this keeps every request small/fast regardless of how many
  // pages are uploaded, and lets images stay at full compression quality.
  let pageResults;
  try {
    pageResults = await Promise.all(
      images.map((image, index) =>
        withToolRetry(async () => {
          try {
            const result = await callClaudeVisionForJSON({
              system: LESSON_PARSE_SYSTEM_PROMPT,
              userMessage: buildLessonParseUserMessage(index + 1, images.length),
              images: [image],
              tool: SUBMIT_LESSON_PARSE_TOOL,
            });
            const parsed = aiLessonParseResponseSchema.safeParse(result);
            return parsed.success ? parsed.data : null;
          } catch (err) {
            if (err instanceof ClaudeToolCallError) return null;
            throw err;
          }
        })
      )
    );
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const parsedPages = pageResults.filter((page) => page !== null);
  if (parsedPages.length === 0) {
    return NextResponse.json({ error: "תגובת ה-AI לא תקינה, נסה/י שוב" }, { status: 502 });
  }

  const vocabulary: ParsedVocabItem[] = parsedPages.flatMap((page) =>
    page.vocabulary.map((item) => ({ ...item, tempId: crypto.randomUUID() }))
  );
  const dialogue = parsedPages.flatMap((page) => page.dialogue);

  if (vocabulary.length === 0 && dialogue.length === 0) {
    return NextResponse.json({ error: "תגובת ה-AI לא תקינה, נסה/י שוב" }, { status: 502 });
  }

  const response: LessonParseResponse = {
    lessonTitle: parsedPages.find((page) => page.lessonTitle)?.lessonTitle,
    vocabulary,
    dialogue,
  };

  return NextResponse.json(response);
}
