import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { storyCompleteRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = storyCompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  await prisma.storyHistory.create({
    data: {
      title: parsed.data.title,
      correctCount: parsed.data.correctCount,
      wrongCount: parsed.data.wrongCount,
    },
  });

  return NextResponse.json({ ok: true });
}
