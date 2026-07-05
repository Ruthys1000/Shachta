import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { verifySessionToken, type SessionRole } from "@/lib/auth";

// Reads the current request's session role. Kept separate from auth.ts (which is
// pure crypto and imported by the edge proxy) so next/headers isn't pulled into the
// proxy bundle. Callable from Route Handlers / Server Components — cookies() is async
// in this Next version.
export async function getSessionRole(): Promise<SessionRole | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function isDemo(): Promise<boolean> {
  return (await getSessionRole()) === "demo";
}

export const DEMO_READ_ONLY_MESSAGE = "מצב הדגמה: לא ניתן לשמור שינויים";
