import { NextResponse } from "next/server";
import { callClaudeForJSON, withToolRetry, ClaudeToolCallError } from "@/lib/anthropic";
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

  const validated = await withToolRetry(async () => {
    try {
      const result = await callClaudeForJSON({
        system: PARSE_VOCAB_SYSTEM_PROMPT,
        userMessage: buildParseVocabUserMessage(parsedRequest.data.text),
        tool: PARSE_VOCAB_TOOL,
      });
      const parsed = aiParseResponseSchema.safeParse(result);
      return parsed.success ? parsed.data : null;
    } catch (err) {
      if (err instanceof ClaudeToolCallError) return null;
      throw err;
    }
  });

  if (!validated) {
    return NextResponse.json({ error: "תגובת ה-AI לא תקינה, נסה/י שוב" }, { status: 502 });
  }

  const items: ParsedVocabItem[] = validated.items.map((item) => ({
    ...item,
    tempId: crypto.randomUUID(),
  }));

  return NextResponse.json({ items });
}
