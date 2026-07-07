import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writingSessionRequestSchema } from "@/lib/validators";
import { selectVocabularySubset } from "@/lib/vocabSelection";
import { shuffle } from "@/lib/shuffle";
import { WRITING_SESSION_SIZE } from "@/lib/constants";
import type { WritingPrompt } from "@/types";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = writingSessionRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const candidates = await prisma.vocabulary.findMany({
    where: parsed.data.vocabularyIds ? { id: { in: parsed.data.vocabularyIds } } : undefined,
    include: { practiceHistory: true },
  });

  if (candidates.length === 0) {
    return NextResponse.json({ error: "אין עדיין מילים במאגר" }, { status: 400 });
  }

  const picked = shuffle(
    selectVocabularySubset(candidates, parsed.data.itemCount ?? WRITING_SESSION_SIZE)
  );
  const items: WritingPrompt[] = picked.map((v) => ({
    vocabularyId: v.id,
    hebrewMeaning: v.hebrewMeaning,
    itemType: v.itemType,
    correctAnswer: v.arabicTranslit,
  }));

  return NextResponse.json({ items });
}
