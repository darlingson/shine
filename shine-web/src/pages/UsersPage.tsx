import { useCallback, useEffect, useMemo, useState } from "react";
import { PlusIcon } from "@phosphor-icons/react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLES, type RoleName } from "@/lib/roles";
import {
  assignRole,
  createUserAsAdmin,
  listUsers,
  parseApiError,
  removeRole,
  type ManagedUser,
} from "@/lib/users";

/* ---------- Add user dialog ---------- */

function AddUserDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
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
      setOpen(false);
      setEmail("");
      setPassword("");
      setRole("Viewer");
      onCreated();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <PlusIcon />
          <span>Add user</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription>
            Create a login for another person. They get the Viewer role by
            default unless you pick another role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">Temporary password</Label>
            <Input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-role">Initial role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as RoleName)}
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
          </div>
          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose>
              <Button type="button" variant="outline" disabled={busy}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={busy}>
              {busy ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Manage roles dialog ---------- */

function ManageRolesDialog({
  user,
  onChanged,
}: {
  user: ManagedUser;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<string[]>(user.roles);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setRoles(user.roles);
      setError(null);
    }
  }

  async function toggle(role: RoleName) {
    setBusy(role);
    setError(null);
    try {
      if (roles.includes(role)) {
        await removeRole(user.id, role);
        setRoles((r) => r.filter((x) => x !== role));
      } else {
        await assignRole(user.id, role);
        setRoles((r) => [...r, role]);
      }
      onChanged();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          Manage roles
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Roles for {user.email}</DialogTitle>
          <DialogDescription>
            Changes apply immediately. Permission claims refresh on the
            user&apos;s next login or token refresh.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
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
        </div>
        {error && (
          <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Users page ---------- */

export function UsersPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("users:manage");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
      void refresh();
    }
  }, [canManage, refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.email.toLowerCase().includes(q));
  }, [users, query]);

  if (!canManage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            You need the <Badge variant="outline">users:manage</Badge>{" "}
            permission to view and manage users.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Users
          </h1>
          <p className="text-sm text-muted-foreground">
            Add people and control who can do what.
          </p>
        </div>
        <AddUserDialog onCreated={refresh} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All users ({users.length})</CardTitle>
          <CardDescription>
            New users start as Viewer. Assign Editor or Admin as needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            placeholder="Search by email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            no role
                          </span>
                        ) : (
                          u.roles.map((r) => (
                            <Badge
                              key={r}
                              variant={
                                r === "Admin" ? "default" : "secondary"
                              }
                            >
                              {r}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <ManageRolesDialog user={u} onChanged={refresh} />
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No users match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
