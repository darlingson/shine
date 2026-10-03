/** Role + permission constants mirroring ShineApi/Authorization/Permissions.cs */

export const ROLES = ["Admin", "Editor", "Viewer"] as const;
export type RoleName = (typeof ROLES)[number];

export const PERMISSIONS = [
  "players:read",
  "players:write",
  "clubs:read",
  "clubs:write",
  "matches:read",
  "matches:write",
  "squads:read",
  "squads:write",
  "users:manage",
  "permissions:grant",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  Admin: [...PERMISSIONS],
  Editor: [
    "players:read",
    "players:write",
    "clubs:read",
    "clubs:write",
    "matches:read",
    "matches:write",
    "squads:read",
    "squads:write",
  ],
  Viewer: ["players:read", "clubs:read", "matches:read", "squads:read"],
};

export const ROLE_DESCRIPTIONS: Record<RoleName, string> = {
  Admin: "Full access — manage data, users and permissions.",
  Editor: "Can create and edit football data. Cannot manage users.",
  Viewer: "Read-only access to players, clubs, matches and squads.",
};
