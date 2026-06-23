import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateVocabularySchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateVocabularySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  if (parsed.data.arabicTranslit) {
    const existing = await prisma.vocabulary.findUnique({
      where: { arabicTranslit: parsed.data.arabicTranslit },
    });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "כבר קיים ביטוי כזה" }, { status: 409 });
    }
  }

  try {
    const item = await prisma.vocabulary.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.vocabulary.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "לא נמצא" }, { status: 404 });
  }
}
