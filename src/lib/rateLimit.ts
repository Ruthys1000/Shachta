const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

interface Entry {
  count: number;
  firstFailureAt: number;
}

const failuresByIp = new Map<string, Entry>();

function isExpired(entry: Entry): boolean {
  return Date.now() - entry.firstFailureAt > LOCKOUT_WINDOW_MS;
}

export function isLoginLocked(ip: string): boolean {
  const entry = failuresByIp.get(ip);
  if (!entry) return false;
  if (isExpired(entry)) {
    failuresByIp.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

export function recordLoginFailure(ip: string): void {
  const entry = failuresByIp.get(ip);
  if (!entry || isExpired(entry)) {
    failuresByIp.set(ip, { count: 1, firstFailureAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function recordLoginSuccess(ip: string): void {
  failuresByIp.delete(ip);
}
