import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/constants";

const SESSION_PAYLOAD = "ok";

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

export function createSessionToken(): string {
  const payload = `${SESSION_PAYLOAD}.${Date.now()}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;

  const payload = token.slice(0, lastDot);
  const signature = token.slice(lastDot + 1);
  const expectedSignature = sign(payload);

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return false;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return false;
  if (!payload.startsWith(`${SESSION_PAYLOAD}.`)) return false;

  const timestamp = Number(payload.slice(SESSION_PAYLOAD.length + 1));
  if (!Number.isFinite(timestamp)) return false;
  if (Date.now() - timestamp > SESSION_MAX_AGE_SECONDS * 1000) return false;

  return true;
}

export function checkPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    throw new Error("APP_PASSWORD is not set");
  }

  const candidateBuf = Buffer.from(candidate);
  const expectedBuf = Buffer.from(expected);
  if (candidateBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(candidateBuf, expectedBuf);
}
