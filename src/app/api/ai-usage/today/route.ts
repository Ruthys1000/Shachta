import { NextResponse } from "next/server";
import { getBudgetStatus } from "@/lib/aiUsage";

export async function GET() {
  const status = await getBudgetStatus();
  return NextResponse.json(status);
}
