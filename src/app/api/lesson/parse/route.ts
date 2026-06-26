import { NextResponse } from "next/server";
import { callClaudeVisionForJSON, ClaudeToolCallError } from "@/lib/anthropic";
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

  try {
    const result = await callClaudeVisionForJSON<unknown>({
      system: LESSON_PARSE_SYSTEM_PROMPT,
      userMessage: buildLessonParseUserMessage(parsedRequest.data.images.length),
      images: parsedRequest.data.images,
      tool: SUBMIT_LESSON_PARSE_TOOL,
    });

    const validated = aiLessonParseResponseSchema.safeParse(result);
    if (!validated.success) {
      return NextResponse.json({ error: "תגובת ה-AI לא תקינה, נסה/י שוב" }, { status: 502 });
    }

    const vocabulary: ParsedVocabItem[] = validated.data.vocabulary.map((item) => ({
      ...item,
      tempId: crypto.randomUUID(),
    }));

    const response: LessonParseResponse = {
      lessonTitle: validated.data.lessonTitle,
      vocabulary,
      dialogue: validated.data.dialogue,
    };

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof ClaudeToolCallError) {
      return NextResponse.json({ error: "שגיאה בניתוח השיעור, נסה/י שוב" }, { status: 502 });
    }
    throw err;
  }
}
