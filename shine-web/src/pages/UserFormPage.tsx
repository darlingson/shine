import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormError } from "@/components/data-ui";
import { ROLES, type RoleName } from "@/lib/roles";
import {
  assignRole,
  createUserAsAdmin,
  listUsers,
  parseApiError,
  removeRole,
} from "@/lib/users";

function NoPermissionCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          You need the users:manage permission to manage users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" render={<Link to="/manage/users" />}>
          <ArrowLeftIcon />
          Back to users
        </Button>
      </CardContent>
    </Card>
  );
}

function BackToUsers({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          render={<Link to="/manage/users" />}
        >
          <ArrowLeftIcon />
          Back to users
        </Button>
        {children}
      </div>
    </div>
  );
}

export function NewUserPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("users:manage");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleName>("Viewer");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await createUserAsAdmin(email.trim(), password);
      if (role !== "Viewer") {
        await assignRole(created.id, role);
      }
      await navigate({ to: "/manage/users" });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!canManage) return <NoPermissionCard title="Add user" />;

  return (
    <BackToUsers>
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        Add user
      </h1>
      <p className="text-sm text-muted-foreground">
        Create a login for another person. They get the Viewer role by
        default unless you pick another role.
      </p>
      <Card className="mt-4">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
            <Field label="Email" htmlFor="new-email">
              <Input
                id="new-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
              />
            </Field>
            <Field label="Temporary password" htmlFor="new-password">
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters, letters and a number"
              />
            </Field>
            <Field label="Initial role" htmlFor="new-role">
              <Select
                value={role}
                onValueChange={(v) => setRole((v ?? "Viewer") as RoleName)}
              >
                <SelectTrigger id="new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <FormError message={error} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                render={<Link to="/manage/users" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create user"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </BackToUsers>
  );
}

export function UserDetailPage({ userId }: { userId: string }) {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("users:manage");
  const [email, setEmail] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await listUsers();
        const found = all.find((u) => u.id === userId);
        if (cancelled) return;
        if (!found) {
          setNotFound(true);
        } else {
          setEmail(found.email);
          setRoles(found.roles);
        }
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canManage, userId]);

  async function toggle(role: RoleName) {
    setBusy(role);
    setError(null);
    try {
      if (roles.includes(role)) {
        await removeRole(userId, role);
        setRoles((r) => r.filter((x) => x !== role));
      } else {
        await assignRole(userId, role);
        setRoles((r) => [...r, role]);
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(null);
    }
  }

  if (!canManage) return <NoPermissionCard title="Manage user" />;

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (notFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User not found</CardTitle>
          <CardDescription>
            No user with this id exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" render={<Link to="/manage/users" />}>
            <ArrowLeftIcon />
            Back to users
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <BackToUsers>
      <h1 className="font-heading text-xl font-semibold tracking-tight">
        {email}
      </h1>
      <p className="text-sm text-muted-foreground">
        Changes apply immediately. Permission claims refresh on the
        user&apos;s next login or token refresh.
      </p>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Assign or remove role bundles for this user.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {ROLES.map((role) => {
            const has = roles.includes(role);
            return (
              <div
                key={role}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{role}</p>
                  <p className="text-xs text-muted-foreground">
                    {has ? "Assigned" : "Not assigned"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={has ? "destructive" : "default"}
                  disabled={busy !== null}
                  onClick={() => toggle(role)}
                >
                  {busy === role ? "Saving…" : has ? "Remove" : "Assign"}
                </Button>
              </div>
            );
          })}
          <FormError message={error} />
        </CardContent>
      </Card>
    </BackToUsers>
  );
}
