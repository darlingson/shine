import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

/** Renders children only when the user holds the permission; else fallback (default: nothing). */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { user, loading, hasPermission } = useAuth();
  if (loading) return null;
  if (!user || !hasPermission(permission)) return fallback;
  return <>{children}</>;
}
