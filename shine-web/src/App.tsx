import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { LoginForm } from "@/auth/LoginForm";
import { RequirePermission } from "@/auth/RequirePermission";
import { Button } from "@/components/ui/button";

function Shell() {
  const { user, loading, logout } = useAuth();

  if (loading) return <p className="text-sm text-muted-foreground">Loading session…</p>;
  if (!user) return <LoginForm />;

  return (
    <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
      <div>
        <h1 className="font-medium">Welcome, {user.email}</h1>
        <p className="text-muted-foreground">Roles: {user.roles.join(", ") || "none"}</p>
        <p className="text-muted-foreground">Permissions: {user.permissions.join(", ") || "none"}</p>
      </div>
      <RequirePermission
        permission="players:write"
        fallback={<p className="text-muted-foreground">Read-only access — editing needs permission.</p>}
      >
        <Button className="mt-2">Add player (permission-gated demo)</Button>
      </RequirePermission>
      <Button variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}

export function App() {
  return (
    <div className="flex min-h-svh p-6">
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </div>
  );
}

export default App;
