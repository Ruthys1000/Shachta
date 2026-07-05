import Anthropic from "@anthropic-ai/sdk";
import { CLAUDE_MODEL } from "@/lib/constants";
import { getBudgetStatus, recordUsage } from "@/lib/aiUsage";
import { getSessionRole } from "@/lib/session";

const CLAUDE_CALL_TIMEOUT_MS = 45_000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: CLAUDE_CALL_TIMEOUT_MS,
});

export class ClaudeToolCallError extends Error {}
export class BudgetExceededError extends Error {}

const BUDGET_EXCEEDED_MESSAGE = "חרגת מהתקציב היומי לבינה מלאכותית, נסה/י שוב מחר";

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

function cacheableSystem(system: string): Anthropic.TextBlockParam[] {
  return [{ type: "text", text: system, cache_control: { type: "ephemeral" } }];
}

async function requestToolUse(
  toolName: string,
  params: Omit<Anthropic.MessageCreateParamsNonStreaming, "tools" | "tool_choice" | "system"> & {
    system: string;
  },
  tool: ToolDefinition
): Promise<unknown> {
  // Role comes from the request cookie, so demo generation is capped and logged
  // against the demo's own daily budget (defaults to owner outside a session).
  const role = (await getSessionRole()) ?? "owner";

  const budget = await getBudgetStatus(role);
  if (budget.exceeded) {
    throw new BudgetExceededError(BUDGET_EXCEEDED_MESSAGE);
  }

  let response;
  try {
    response = await anthropic.messages.create({
      ...params,
      system: cacheableSystem(params.system),
      tools: [tool as Anthropic.Tool],
      tool_choice: { type: "tool", name: tool.name },
    });
  } catch (err) {
    console.error(`[anthropic] tool call "${toolName}" failed:`, err);
    throw new ClaudeToolCallError(`Claude API call failed: ${(err as Error).message}`);
  }

  await recordUsage({
    route: toolName,
    role,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  });

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

// Leaves headroom under the client's 115s abort and the route's 120s maxDuration
// ceiling: a retry is only attempted if there's still enough budget left for
// another full-length Claude call (e.g. a slow multi-image vision request), so a
// doomed second attempt can't push the response past those limits.
const TOOL_RETRY_BUDGET_MS = 75_000;

export async function withToolRetry<T>(
  attempt: () => Promise<T | null>,
  maxAttempts = 2
): Promise<T | null> {
  const start = Date.now();
  let result: T | null = null;
  for (let i = 0; i < maxAttempts && !result; i++) {
    if (i > 0 && Date.now() - start + CLAUDE_CALL_TIMEOUT_MS > TOOL_RETRY_BUDGET_MS) break;
    result = await attempt();
  }
  return result;
}
