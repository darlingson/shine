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
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

async function fetchMe(): Promise<AuthUser> {
  const res = await apiFetch("/api/auth/me");
  if (!res.ok) throw new Error("Not authenticated");
  const data = (await res.json()) as Partial<AuthUser> | null;
  if (!data || typeof data.id !== "string" || typeof data.email !== "string") {
    throw new Error("Not authenticated");
  }
  return {
    id: data.id,
    email: data.email,
    userName: data.userName,
    roles: Array.isArray(data.roles) ? data.roles : [],
    permissions: Array.isArray(data.permissions) ? data.permissions : [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      setUser(null);
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
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
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
      setError(null);
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
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => user?.permissions.includes(permission) ?? false,
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
