import { prisma } from "@/lib/prisma";

// Single row that holds the app-wide learner settings (single-user app).
const SETTINGS_ID = "singleton";

/**
 * The learner's placement level (1..4) as set by the placement test, or 1 when
 * the test has never been taken. This is a *baseline* — see withPlacementFloor.
 */
export async function getPlacementLevel(): Promise<number> {
  const settings = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  return settings?.placementLevel ?? 1;
}

/**
 * Persist the placement result (upserting the single settings row).
 */
export async function savePlacementResult(
  placementLevel: number,
  score: number,
  total: number
): Promise<void> {
  await prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      placementLevel,
      placementScore: score,
      placementTotal: total,
      placementTakenAt: new Date(),
    },
    update: {
      placementLevel,
      placementScore: score,
      placementTotal: total,
      placementTakenAt: new Date(),
    },
  });
}

/**
 * Effective level for an activity: the placement level acts as a floor, while
 * activity-specific organic progression (derived from completed-lesson counts)
 * can raise it further — never below the tested baseline, never above maxLevel.
 */
export function withPlacementFloor(
  placement: number,
  derivedFromCount: number,
  maxLevel: number
): number {
  return Math.min(maxLevel, Math.max(placement, derivedFromCount));
}
