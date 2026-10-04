import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_PERMISSIONS,
  type RoleName,
} from "@/lib/roles";
import { listUsers, parseApiError, type ManagedUser } from "@/lib/users";

function permissionVariant(p: string): "default" | "secondary" | "outline" {
  if (p === "users:manage" || p === "permissions:grant") return "default";
  if (p.endsWith(":write")) return "secondary";
  return "outline";
}

export function RolesPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("users:manage");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(canManage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) return;
    (async () => {
      try {
        setUsers(await listUsers());
      } catch (e) {
        setError(parseApiError(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [canManage]);

  const membersOf = (role: RoleName) =>
    users.filter((u) => u.roles.includes(role));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Roles
        </h1>
        <p className="text-sm text-muted-foreground">
          Three fixed roles. Assign them to users to grant bundles of
          permissions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ROLES.map((role) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {role}
                <Badge>
                  {canManage
                    ? `${membersOf(role).length} member${membersOf(role).length === 1 ? "" : "s"}`
                    : "fixed"}
                </Badge>
              </CardTitle>
              <CardDescription>{ROLE_DESCRIPTIONS[role]}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1">
                {ROLE_PERMISSIONS[role].map((p) => (
                  <Badge key={p} variant={permissionVariant(p)}>
                    {p}
                  </Badge>
                ))}
              </div>
              {canManage && (
                <div className="flex flex-col gap-1 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Members
                  </p>
                  {loading ? (
                    <Skeleton className="h-5 w-full" />
                  ) : error ? (
                    <p className="text-xs text-destructive">{error}</p>
                  ) : membersOf(role).length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nobody has this role yet.
                    </p>
                  ) : (
                    membersOf(role)
                      .slice(0, 5)
                      .map((u) => (
                        <p key={u.id} className="truncate text-xs">
                          {u.email}
                        </p>
                      ))
                  )}
                  {membersOf(role).length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      +{membersOf(role).length - 5} more
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle>How to change someone&apos;s role</CardTitle>
            <CardDescription>
              Open the Users page, find the person, choose Manage roles, then
              Assign or Remove.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link to="/manage/users" />}>
              Go to Users
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
