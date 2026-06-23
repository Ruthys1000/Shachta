import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bulkVocabRequestSchema } from "@/lib/validators";
import type { Vocabulary } from "@prisma/client";

interface BulkConflict {
  tempId: string;
  arabicTranslit: string;
  hebrewMeaning: string;
  itemType: Vocabulary["itemType"];
  existing: Vocabulary;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bulkVocabRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  let savedCount = 0;
  const conflicts: BulkConflict[] = [];

  for (const item of parsed.data.items) {
    const existing = await prisma.vocabulary.findUnique({
      where: { arabicTranslit: item.arabicTranslit },
    });

    if (item.resolution === null) {
      if (existing) {
        conflicts.push({
          tempId: item.tempId,
          arabicTranslit: item.arabicTranslit,
          hebrewMeaning: item.hebrewMeaning,
          itemType: item.itemType,
          existing,
        });
        continue;
      }
      await prisma.vocabulary.create({
        data: {
          arabicTranslit: item.arabicTranslit,
          hebrewMeaning: item.hebrewMeaning,
          itemType: item.itemType,
        },
      });
      savedCount += 1;
      continue;
    }

    if (item.resolution === "skip" || item.resolution === "keep") {
      continue;
    }

    if (item.resolution === "replace") {
      if (existing) {
        await prisma.vocabulary.update({
          where: { id: existing.id },
          data: { hebrewMeaning: item.hebrewMeaning, itemType: item.itemType },
        });
      } else {
        await prisma.vocabulary.create({
          data: {
            arabicTranslit: item.arabicTranslit,
            hebrewMeaning: item.hebrewMeaning,
            itemType: item.itemType,
          },
        });
      }
      savedCount += 1;
    }
  }

  return NextResponse.json({ saved: savedCount, conflicts });
}
