import { createHmac, timingSafeEqual } from "node:crypto";
import {
  DEMO_LOGIN_CODE,
  DEMO_SESSION_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/constants";

export type SessionRole = "owner" | "demo";

// Payload prefix per role. Owner keeps the legacy "ok" prefix so sessions issued
// before roles existed stay valid; demo uses its own prefix and shorter lifetime.
const ROLE_PREFIX: Record<SessionRole, string> = { owner: "ok", demo: "demo" };
const ROLE_MAX_AGE_SECONDS: Record<SessionRole, number> = {
  owner: SESSION_MAX_AGE_SECONDS,
  demo: DEMO_SESSION_MAX_AGE_SECONDS,
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(role: SessionRole = "owner"): string {
  const payload = `${ROLE_PREFIX[role]}.${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionRole | null {
  if (!token) return null;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expectedSignature = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  const firstDot = payload.indexOf(".");
  if (firstDot === -1) return null;
  const prefix = payload.slice(0, firstDot);
  const role = (Object.keys(ROLE_PREFIX) as SessionRole[]).find(
    (r) => ROLE_PREFIX[r] === prefix
  );
  if (!role) return null;

  const timestamp = Number(payload.slice(firstDot + 1));
  if (!Number.isFinite(timestamp)) return null;
  if (Date.now() - timestamp > ROLE_MAX_AGE_SECONDS[role] * 1000) return null;

  return role;
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    throw new Error("APP_PASSWORD is not set");
  }

  return safeEquals(candidate, expected);
}

// Read-only demo login. The code is a hardcoded constant (not a secret) — a wrong
// guess just fails like any bad password.
export function checkDemoCode(candidate: string): boolean {
  return safeEquals(candidate, DEMO_LOGIN_CODE);
}

function safeEquals(candidate: string, expected: string): boolean {
  const candidateBuf = Buffer.from(candidate);
  const expectedBuf = Buffer.from(expected);
  if (candidateBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(candidateBuf, expectedBuf);
}
