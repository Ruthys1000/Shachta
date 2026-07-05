import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDemo } from "@/lib/session";
import { sentenceLessonCompleteRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = sentenceLessonCompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  // Read-only demo: accept the request but persist nothing.
  if (await isDemo()) {
    return NextResponse.json({ ok: true });
  }

  await prisma.sentenceLessonHistory.create({
    data: {
      title: parsed.data.title,
      correctCount: parsed.data.correctCount,
      wrongCount: parsed.data.wrongCount,
    },
  });

  return NextResponse.json({ ok: true });
}
