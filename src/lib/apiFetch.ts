type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data.error ?? "שגיאה, נסה/י שוב" };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "בעיית תקשורת, בדק/י את החיבור לאינטרנט ונסה/י שוב" };
  }
}
