import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sentenceLessonCompleteRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = sentenceLessonCompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  await prisma.sentenceLessonHistory.create({ data: { title: parsed.data.title } });

  return NextResponse.json({ ok: true });
}
