import { NextResponse } from "next/server";
import { checkPassword, createSessionToken } from "@/lib/auth";
import { isLoginLocked, recordLoginFailure, recordLoginSuccess } from "@/lib/rateLimit";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

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

  if (!password || !checkPassword(password)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
  }

  recordLoginSuccess(ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
