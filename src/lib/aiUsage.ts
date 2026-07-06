import { prisma } from "@/lib/prisma";
import type { SessionRole } from "@/lib/auth";
import { withDbTimeout } from "@/lib/dbTimeout";
import {
  AI_DAILY_BUDGET_USD,
  AI_DEMO_DAILY_BUDGET_USD,
  CLAUDE_INPUT_PRICE_PER_MTOK_USD,
  CLAUDE_OUTPUT_PRICE_PER_MTOK_USD,
} from "@/lib/constants";

export interface BudgetStatus {
  spentUsd: number;
  budgetUsd: number;
  remainingUsd: number;
  exceeded: boolean;
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function budgetForRole(role: SessionRole): number {
  return role === "demo" ? AI_DEMO_DAILY_BUDGET_USD : AI_DAILY_BUDGET_USD;
}

// Spend is tracked per-role (see AiUsageLog.role) so the demo's stricter cap is
// enforced independently of the owner's daily budget.
export async function getBudgetStatus(role: SessionRole = "owner"): Promise<BudgetStatus> {
  const result = await withDbTimeout(
    prisma.aiUsageLog.aggregate({
      where: { createdAt: { gte: startOfTodayUtc() }, role },
      _sum: { costUsd: true },
    }),
    "aiUsageLog.aggregate"
  );

  const spentUsd = result._sum.costUsd ?? 0;
  const budgetUsd = budgetForRole(role);
  return {
    spentUsd,
    budgetUsd,
    remainingUsd: Math.max(0, budgetUsd - spentUsd),
    exceeded: spentUsd >= budgetUsd,
  };
}

export async function recordUsage({
  route,
  inputTokens,
  outputTokens,
  role = "owner",
}: {
  route: string;
  inputTokens: number;
  outputTokens: number;
  role?: SessionRole;
}): Promise<void> {
  const costUsd =
    (inputTokens / 1_000_000) * CLAUDE_INPUT_PRICE_PER_MTOK_USD +
    (outputTokens / 1_000_000) * CLAUDE_OUTPUT_PRICE_PER_MTOK_USD;

  await withDbTimeout(
    prisma.aiUsageLog.create({
      data: { route, role, inputTokens, outputTokens, costUsd },
    }),
    "aiUsageLog.create"
  );
}
