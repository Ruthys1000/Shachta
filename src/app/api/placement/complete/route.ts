import { NextResponse } from "next/server";
import { isDemo } from "@/lib/session";
import { placementCompleteRequestSchema } from "@/lib/validators";
import { savePlacementResult } from "@/lib/level";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = placementCompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "קלט לא תקין" }, { status: 400 });
  }

  // Read-only demo: accept the request but persist nothing.
  if (await isDemo()) {
    return NextResponse.json({ ok: true });
  }

  await savePlacementResult(parsed.data.placementLevel, parsed.data.score, parsed.data.total);

  return NextResponse.json({ ok: true });
}
