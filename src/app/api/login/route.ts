import { NextResponse } from "next/server";
import { checkDemoCode, checkPassword, createSessionToken, type SessionRole } from "@/lib/auth";
import { isLoginLocked, recordLoginFailure, recordLoginSuccess } from "@/lib/rateLimit";
import {
  DEMO_SESSION_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/constants";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isLoginLocked(ip)) {
    return NextResponse.json(
      { error: "יותר מדי ניסיונות כושלים, נסה/י שוב בעוד כמה דקות" },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  let role: SessionRole | null = null;
  if (password && checkPassword(password)) {
    role = "owner";
  } else if (password && checkDemoCode(password)) {
    role = "demo";
  }

  if (!role) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  recordLoginSuccess(ip);

  const maxAge = role === "demo" ? DEMO_SESSION_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
