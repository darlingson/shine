import { Link } from "@tanstack/react-router";
import { useAuth } from "@/auth/AuthContext";
import { RequirePermission } from "@/auth/RequirePermission";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OverviewPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Welcome, {user?.email}
        </h1>
        <p className="text-sm text-muted-foreground">
          Roles: {(user?.roles ?? []).join(", ") || "none"} · Permissions:{" "}
          {(user?.permissions ?? []).join(", ") || "none"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Football data</CardTitle>
            <CardDescription>
              Players, clubs, matches and squads live here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RequirePermission
              permission="players:write"
              fallback={
                <p className="text-sm text-muted-foreground">
                  Read-only access — editing needs permission.
                </p>
              }
            >
              <Button>Add player (permission-gated demo)</Button>
            </RequirePermission>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team access</CardTitle>
            <CardDescription>
              Add teammates and assign Admin, Editor or Viewer roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" render={<Link to="/manage/users" />}>
              Manage users
            </Button>
            <Button variant="outline" render={<Link to="/manage/roles" />}>
              View roles
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
