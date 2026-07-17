import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Current placement status for the placement-test page (null level = never taken).
export async function GET() {
  const settings = await prisma.appSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({
    placementLevel: settings?.placementLevel ?? null,
    placementTakenAt: settings?.placementTakenAt ?? null,
  });
}
