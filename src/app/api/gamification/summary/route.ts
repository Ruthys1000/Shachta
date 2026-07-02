import { NextResponse } from "next/server";
import { getGamificationSummary } from "@/lib/gamification";

export async function GET() {
  const summary = await getGamificationSummary();
  return NextResponse.json(summary);
}
