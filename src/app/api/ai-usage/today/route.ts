import { NextResponse } from "next/server";
import { getBudgetStatus } from "@/lib/aiUsage";
import { getSessionRole } from "@/lib/session";

export async function GET() {
  const role = (await getSessionRole()) ?? "owner";
  const status = await getBudgetStatus(role);
  return NextResponse.json(status);
}
