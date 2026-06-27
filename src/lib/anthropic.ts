import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/constants";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export class ClaudeToolCallError extends Error {}

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties?: Record<string, unknown>;
    required?: readonly string[];
  };
}

const DEFAULT_MAX_TOKENS = 8192;

async function requestToolUse(
  toolName: string,
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "tools" | "tool_choice">,
  tool: ToolDefinition
): Promise<unknown> {
  let response;
  try {
    response = await anthropic.messages.create({
      ...params,
      tools: [tool as Anthropic.Tool],
      tool_choice: { type: "tool", name: tool.name },
    });
  } catch (err) {
    console.error(`[anthropic] tool call "${toolName}" failed:`, err);
    throw new ClaudeToolCallError(`Claude API call failed: ${(err as Error).message}`);
  }

  if (response.stop_reason === "max_tokens") {
    console.error(`[anthropic] tool call "${toolName}" truncated at max_tokens`);
    throw new ClaudeToolCallError("Claude response was truncated (max_tokens reached)");
  }

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.error(`[anthropic] tool call "${toolName}" did not return a tool_use block`);
    throw new ClaudeToolCallError("Claude did not return a tool_use block");
  }

  return toolUse.input;
}

export async function callClaudeForJSON({
  system,
  userMessage,
  tool,
}: {
  system: string;
  userMessage: string;
  tool: ToolDefinition;
}): Promise<unknown> {
  return requestToolUse(
    tool.name,
    {
      model: CLAUDE_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system,
      messages: [{ role: "user", content: userMessage }],
    },
    tool
  );
}

export interface ImageInput {
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}

export async function callClaudeVisionForJSON({
  system,
  userMessage,
  images,
  tool,
}: {
  system: string;
  userMessage: string;
  images: ImageInput[];
  tool: ToolDefinition;
}): Promise<unknown> {
  const content: Anthropic.ContentBlockParam[] = [
    ...images.map((image): Anthropic.ImageBlockParam => ({
      type: "image",
      source: { type: "base64", media_type: image.mediaType, data: image.data },
    })),
    { type: "text", text: userMessage },
  ];

  return requestToolUse(
    tool.name,
    {
      model: CLAUDE_MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system,
      messages: [{ role: "user", content }],
    },
    tool
  );
}

export async function withToolRetry<T>(
  attempt: () => Promise<T | null>,
  maxAttempts = 2
): Promise<T | null> {
  let result: T | null = null;
  for (let i = 0; i < maxAttempts && !result; i++) {
    result = await attempt();
  }
  return result;
}
