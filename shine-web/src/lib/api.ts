// API client with access-token attach + single-flight refresh-and-retry.
// Access token lives in memory; refresh token persists in localStorage so a
// reload can restore the session via POST /api/auth/refresh.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5129";

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

export function getApiUrl(): string {
  return API_URL;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  localStorage.setItem("shine.refreshToken", refresh);
}

export function clearTokens(): void {
  accessToken = null;
  localStorage.removeItem("shine.refreshToken");
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem("shine.refreshToken");
}

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return false;
      }
      const data = await res.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    } catch {
      clearTokens();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

/**
 * Force an access-token refresh from the stored refresh token.
 * The backend re-resolves permissions on refresh, so call this after
 * role/permission changes to keep the token snapshot in sync with the UI.
 * Returns false when no usable refresh token exists.
 */
export function refreshAccessToken(): Promise<boolean> {
  return tryRefresh();
}

export async function apiFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry && getStoredRefreshToken()) {
    const ok = await tryRefresh();
    if (ok) return apiFetch(path, init, false);
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
