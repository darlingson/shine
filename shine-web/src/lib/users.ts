import { apiFetch, apiJson } from "@/lib/api";
import type { RoleName } from "@/lib/roles";

export interface ManagedUser {
  id: string;
  email: string;
  userName?: string;
  roles: string[];
}

/** GET /api/users — requires users:manage */
export function listUsers(): Promise<ManagedUser[]> {
  return apiJson<ManagedUser[]>("/api/users");
}

/** POST /api/users/{id}/roles { role } — requires users:manage */
export function assignRole(userId: string, role: RoleName): Promise<void> {
  return apiJson<void>(`/api/users/${userId}/roles`, {
    method: "POST",
    body: JSON.stringify({ role }),
  });
}

/** DELETE /api/users/{id}/roles/{role} — requires users:manage */
export async function removeRole(userId: string, role: string): Promise<void> {
  const res = await apiFetch(`/api/users/${userId}/roles/${role}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} remove role: ${text}`);
  }
}

/**
 * Admin-driven "add user" using the existing self-register endpoint.
 * POST /api/auth/register is AllowAnonymous and assigns Viewer by default,
 * so we deliberately ignore the returned tokens to keep the admin session.
 * Afterwards the caller can assign a different role via assignRole().
 * Returns the new user resolved from GET /api/users.
 */
export async function createUserAsAdmin(
  email: string,
  password: string,
): Promise<ManagedUser> {
  const res = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text ? `Could not create user (${res.status}): ${text}` : `Could not create user (${res.status})`,
    );
  }
  // Consume body (tokens for the new user) without applying them.
  await res.json().catch(() => null);

  const users = await listUsers();
  const created = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (!created) throw new Error("User created but not found in list. Refresh to see it.");
  return created;
}

export function parseApiError(e: unknown): string {
  if (e instanceof Error) {
    // Try to surface Identity errors JSON: [{"code":"...","description":"..."}]
    try {
      const parsed = JSON.parse(e.message.slice(e.message.indexOf(": ") + 2 || 0));
      if (Array.isArray(parsed)) {
        const descs = parsed
          .map((x) => (typeof x?.description === "string" ? x.description : null))
          .filter(Boolean);
        if (descs.length > 0) return descs.join(" ");
      }
    } catch {
      /* fall through */
    }
    // Strip "API 400 /api/..." prefix when body already explains it
    const m = e.message.match(/^API \d+ \S+: (.*)$/s);
    if (m) {
      try {
        const parsed = JSON.parse(m[1]);
        if (Array.isArray(parsed)) {
          const descs = parsed
            .map((x) => (typeof x?.description === "string" ? x.description : null))
            .filter(Boolean);
          if (descs.length > 0) return descs.join(" ");
        }
        return m[1];
      } catch {
        return m[1] || e.message;
      }
    }
    return e.message;
  }
  return "Something went wrong.";
}
