import { prisma } from "@/lib/prisma";
import {
  AI_DAILY_BUDGET_USD,
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

export async function getBudgetStatus(): Promise<BudgetStatus> {
  const result = await prisma.aiUsageLog.aggregate({
    where: { createdAt: { gte: startOfTodayUtc() } },
    _sum: { costUsd: true },
  });

  const spentUsd = result._sum.costUsd ?? 0;
  const budgetUsd = AI_DAILY_BUDGET_USD;
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
}: {
  route: string;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  const costUsd =
    (inputTokens / 1_000_000) * CLAUDE_INPUT_PRICE_PER_MTOK_USD +
    (outputTokens / 1_000_000) * CLAUDE_OUTPUT_PRICE_PER_MTOK_USD;

  await prisma.aiUsageLog.create({
    data: { route, inputTokens, outputTokens, costUsd },
  });
}
