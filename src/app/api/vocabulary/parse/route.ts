import { NextResponse } from "next/server";
import { callClaudeForJSON, ClaudeToolCallError } from "@/lib/anthropic";
import {
  PARSE_VOCAB_TOOL,
  PARSE_VOCAB_SYSTEM_PROMPT,
  buildParseVocabUserMessage,
} from "@/lib/ai/parseVocabPrompt";
import { parseVocabRequestSchema, aiParseResponseSchema } from "@/lib/validators";
import type { ParsedVocabItem } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedRequest = parseVocabRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return NextResponse.json({ error: "טקסט לא תקין" }, { status: 400 });
  }

  try {
    const result = await callClaudeForJSON<unknown>({
      system: PARSE_VOCAB_SYSTEM_PROMPT,
      userMessage: buildParseVocabUserMessage(parsedRequest.data.text),
      tool: PARSE_VOCAB_TOOL,
    });

    const validated = aiParseResponseSchema.safeParse(result);
    if (!validated.success) {
      return NextResponse.json({ error: "תגובת ה-AI לא תקינה, נסה/י שוב" }, { status: 502 });
    }

    const items: ParsedVocabItem[] = validated.data.items.map((item) => ({
      ...item,
      tempId: crypto.randomUUID(),
    }));

    return NextResponse.json({ items });
  } catch (err) {
    if (err instanceof ClaudeToolCallError) {
      return NextResponse.json({ error: "שגיאה בניתוח הטקסט, נסה/י שוב" }, { status: 502 });
    }
    throw err;
  }
}
