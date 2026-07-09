import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDemo } from "@/lib/session";
import { grammarLessonCompleteRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = grammarLessonCompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  // Read-only demo: accept the request but persist nothing.
  if (await isDemo()) {
    return NextResponse.json({ ok: true });
  }

  await prisma.grammarLessonHistory.create({
    data: {
      title: parsed.data.title,
      focus: parsed.data.focus,
      correctCount: parsed.data.correctCount,
      wrongCount: parsed.data.wrongCount,
    },
  });

  return NextResponse.json({ ok: true });
}
