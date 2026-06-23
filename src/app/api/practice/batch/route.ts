import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { practiceBatchRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = practiceBatchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.results.map((result) =>
      prisma.practiceHistory.upsert({
        where: { vocabularyId: result.vocabularyId },
        create: {
          vocabularyId: result.vocabularyId,
          correctCount: result.correct ? 1 : 0,
          wrongCount: result.correct ? 0 : 1,
          lastPracticed: new Date(),
        },
        update: {
          correctCount: { increment: result.correct ? 1 : 0 },
          wrongCount: { increment: result.correct ? 0 : 1 },
          lastPracticed: new Date(),
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
