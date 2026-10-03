import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TrashIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { parseApiError } from "@/lib/users";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  );
}

/**
 * Inline two-step delete: first click arms ("Confirm?"), second click
 * deletes. Disarms after a few seconds. No modal.
 */
export function DeleteButton({
  name,
  onConfirm,
}: {
  name: string;
  onConfirm: () => Promise<void>;
}) {
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleClick() {
    if (!armed) {
      setArmed(true);
      setError(null);
      timer.current = setTimeout(() => setArmed(false), 4000);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(parseApiError(e));
      setArmed(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <Button
        variant={armed ? "destructive" : "ghost"}
        size={armed ? "sm" : "icon-sm"}
        title={armed ? `Confirm delete ${name}` : `Delete ${name}`}
        disabled={busy}
        onClick={handleClick}
      >
        {busy ? "…" : armed ? "Confirm?" : <TrashIcon />}
      </Button>
    </span>
  );
}
