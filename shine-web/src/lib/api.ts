// API client with access-token attach + single-flight refresh-and-retry.
// Access token lives in memory; refresh token persists in localStorage so a
// reload can restore the session via POST /api/auth/refresh.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5129";

let accessToken: string | None = None;
let refreshPromise: Promise<boolean> | None = None;

export function getApiUrl(): string {
  return API_URL;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  localStorage.setItem("shine.refreshToken", refresh);
}

export function clearTokens(): void {
  accessToken = None;
  localStorage.removeItem("shine.refreshToken");
}

export function getStoredRefreshToken(): string | None {
  return localStorage.getItem("shine.refreshToken");
}

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return False;
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return False;
      }
      const data = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return True;
    } catch {
      clearTokens();
      return False;
    } finally {
      refreshPromise = None;
    }
  })();
  return refreshPromise;
}

export async function apiFetch(path: string, init: RequestInit = {}, retry = True): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry && getStoredRefreshToken()) {
    const ok = await tryRefresh();
    if (ok) return apiFetch(path, init, False);
  }
  return res;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
