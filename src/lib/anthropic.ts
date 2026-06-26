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

export async function callClaudeForJSON<T>({
  system,
  userMessage,
  tool,
}: {
  system: string;
  userMessage: string;
  tool: ToolDefinition;
}): Promise<T> {
  let response;
  try {
    response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: userMessage }],
      tools: [tool as Anthropic.Tool],
      tool_choice: { type: "tool", name: tool.name },
    });
  } catch (err) {
    throw new ClaudeToolCallError(`Claude API call failed: ${(err as Error).message}`);
  }

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new ClaudeToolCallError("Claude did not return a tool_use block");
  }

  return toolUse.input as T;
}

export interface ImageInput {
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}

export async function callClaudeVisionForJSON<T>({
  system,
  userMessage,
  images,
  tool,
}: {
  system: string;
  userMessage: string;
  images: ImageInput[];
  tool: ToolDefinition;
}): Promise<T> {
  const content: Anthropic.ContentBlockParam[] = [
    ...images.map((image): Anthropic.ImageBlockParam => ({
      type: "image",
      source: { type: "base64", media_type: image.mediaType, data: image.data },
    })),
    { type: "text", text: userMessage },
  ];

  let response;
  try {
    response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content }],
      tools: [tool as Anthropic.Tool],
      tool_choice: { type: "tool", name: tool.name },
    });
  } catch (err) {
    throw new ClaudeToolCallError(`Claude API call failed: ${(err as Error).message}`);
  }

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new ClaudeToolCallError("Claude did not return a tool_use block");
  }

  return toolUse.input as T;
}
