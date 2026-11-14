import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_READ_ONLY_MESSAGE, isDemo } from "@/lib/session";

/**
 * Reset all practice progress while keeping the vocabulary itself.
 * Clears per-word quiz history, completed sentence/grammar/story lessons and the
 * placement-test result, so exercises restart from the beginner level and the
 * learner progresses again from scratch.
 */
export async function POST() {
  if (await isDemo()) {
    return NextResponse.json({ error: DEMO_READ_ONLY_MESSAGE }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.practiceHistory.deleteMany({}),
    prisma.sentenceLessonHistory.deleteMany({}),
    prisma.grammarLessonHistory.deleteMany({}),
    prisma.storyHistory.deleteMany({}),
    prisma.appSettings.updateMany({
      data: {
        placementLevel: null,
        placementScore: null,
        placementTotal: null,
        placementTakenAt: null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
