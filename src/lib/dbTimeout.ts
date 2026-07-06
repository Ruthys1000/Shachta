export class DbTimeoutError extends Error {}

const DB_CALL_TIMEOUT_MS = 10_000;

// Prisma calls have no built-in timeout, so a cold/unreachable pooled
// connection can stall a request all the way to the platform's maxDuration
// ceiling. This bounds that wait so callers can fail fast with a clear error.
export function withDbTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new DbTimeoutError(`Database call "${label}" timed out`)),
        DB_CALL_TIMEOUT_MS
      )
    ),
  ]);
}
