import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch, apiJson, clearTokens, getApiUrl, getStoredRefreshToken, setTokens } from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  userName?: string;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  user: AuthUser | None;
  loading: boolean;
  error: string | None;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | None>(None);

async function fetchMe(): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  return (await res.json()) as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | None>(None);
  const [loading, setLoading] = useState(True);
  const [error, setError] = useState<string | None>(None);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      setUser(None);
    }
  }, []);

  // Restore session on mount when a refresh token is stored.
  useEffect(() => {
    (async () => {
      try {
        const stored = getStoredRefreshToken();
        if (!stored) return;
        const res = await fetch(`${getApiUrl()}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: stored }),
        });
        if (!res.ok) {
          clearTokens();
          return;
        }
        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        await refreshUser();
      } finally {
        setLoading(False);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(None);
      try {
        const data = await apiJson<{ accessToken: string; refreshToken: string }>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setTokens(data.accessToken, data.refreshToken);
        await refreshUser();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Login failed");
        throw e;
      }
    },
    [refreshUser]
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setError(None);
      try {
        const data = await apiJson<{ accessToken: string; refreshToken: string }>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setTokens(data.accessToken, data.refreshToken);
        await refreshUser();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Registration failed");
        throw e;
      }
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      clearTokens();
      setUser(None);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? False,
    [user]
  );

  const value = useMemo(
    () => ({ user, loading, error, login, register, logout, hasPermission, refreshUser }),
    [user, loading, error, login, register, logout, hasPermission, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
