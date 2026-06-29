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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedRequest = lessonParseRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "תמונות לא תקינות" }, { status: 400 });
  }

  let validated;
  try {
    validated = await withToolRetry(async () => {
      try {
        const result = await callClaudeVisionForJSON({
          system: LESSON_PARSE_SYSTEM_PROMPT,
          userMessage: buildLessonParseUserMessage(parsedRequest.data.images.length),
          images: parsedRequest.data.images,
          tool: SUBMIT_LESSON_PARSE_TOOL,
        });
        const parsed = aiLessonParseResponseSchema.safeParse(result);
        return parsed.success ? parsed.data : null;
      } catch (err) {
        if (err instanceof ClaudeToolCallError) return null;
        throw err;
      }
    });
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  if (!validated) {
    return NextResponse.json({ error: "תגובת ה-AI לא תקינה, נסה/י שוב" }, { status: 502 });
  }

  const vocabulary: ParsedVocabItem[] = validated.vocabulary.map((item) => ({
    ...item,
    tempId: crypto.randomUUID(),
  }));

  const response: LessonParseResponse = {
    lessonTitle: validated.lessonTitle,
    vocabulary,
    dialogue: validated.dialogue,
  };

  return NextResponse.json(response);
}
