import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_READ_ONLY_MESSAGE, isDemo } from "@/lib/session";
import { createVocabularySchema, itemTypeSchema } from "@/lib/validators";

const SORT_ORDER_BY = {
  newest: { createdAt: "desc" as const },
  oldest: { createdAt: "asc" as const },
  alpha: { arabicTranslit: "asc" as const },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() ?? "";
  const typeParam = searchParams.get("type");
  const sortParam = searchParams.get("sort");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") ?? "50") || 50));

  const typeFilter = itemTypeSchema.safeParse(typeParam);
  const orderBy =
    sortParam && sortParam in SORT_ORDER_BY
      ? SORT_ORDER_BY[sortParam as keyof typeof SORT_ORDER_BY]
      : SORT_ORDER_BY.newest;

  const where = {
    ...(typeFilter.success ? { itemType: typeFilter.data } : {}),
    ...(search
      ? {
          OR: [
            { arabicTranslit: { contains: search, mode: "insensitive" as const } },
            { hebrewMeaning: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.vocabulary.findMany({
      where,
      include: { practiceHistory: true },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vocabulary.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(request: Request) {
  if (await isDemo()) {
    return NextResponse.json({ error: DEMO_READ_ONLY_MESSAGE }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createVocabularySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  const existing = await prisma.vocabulary.findUnique({
    where: { arabicTranslit: parsed.data.arabicTranslit },
  });
  if (existing) {
    return NextResponse.json({ error: "duplicate", existing }, { status: 409 });
  }

  const item = await prisma.vocabulary.create({ data: parsed.data });
  return NextResponse.json({ item }, { status: 201 });
}
