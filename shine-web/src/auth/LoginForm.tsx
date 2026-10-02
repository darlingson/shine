import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const { login, register, error } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(False);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(True);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } finally {
      setBusy(False);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm min-w-0 flex-col gap-3">
      <h1 className="font-medium">{mode === "login" ? "Log in" : "Create account"}</h1>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Password
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy}>
        {busy ? "Please wait…" : mode === "login" ? "Log in" : "Register"}
      </Button>
      <button
        type="button"
        className="text-sm text-muted-foreground underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
      </button>
    </form>
  );
}
