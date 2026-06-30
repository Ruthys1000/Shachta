type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

// Just under Vercel Pro's 120s serverless function ceiling (see maxDuration in the
// AI routes), so a hung request surfaces as a clear error instead of leaving the
// caller's loading state stuck forever.
const REQUEST_TIMEOUT_MS = 115_000;

export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error ?? "שגיאה, נסה/י שוב" };
    }
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "הבקשה ארכה זמן רב מהצפוי, נסה/י שוב" };
    }
    return { ok: false, error: "בעיית תקשורת, בדק/י את החיבור לאינטרנט ונסה/י שוב" };
  } finally {
    clearTimeout(timeoutId);
  }
}
