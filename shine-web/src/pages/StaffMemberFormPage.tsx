import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Field, FormError } from "@/components/data-ui";
import {
  createStaffMember,
  updateStaffMember,
  type StaffMember,
  type StaffMemberForm,
} from "@/lib/staff";
import { usePlayers, useStaffMember } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

/** Shared add/edit page for one staff person. Pass staffMemberId to edit. */
export function StaffMemberFormPage({
  staffMemberId,
}: {
  staffMemberId?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("staff:write");
  const editing = staffMemberId !== undefined;
  const memberQuery = useStaffMember(staffMemberId ?? "", editing);

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit staff member" : "Add staff member"}</CardTitle>
          <CardDescription>
            You need the staff:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/staff" />}
          >
            <ArrowLeftIcon />
            Back to staff
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing && memberQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (editing && (memberQuery.isError || !memberQuery.data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Staff member not found</CardTitle>
          <CardDescription>
            No staff member with id “{staffMemberId}” exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/staff" />}
          >
            <ArrowLeftIcon />
            Back to staff
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <StaffMemberForm
      key={staffMemberId ?? "new"}
      staffMemberId={staffMemberId}
      initial={editing ? (memberQuery.data as StaffMember) : undefined}
    />
  );
}

function StaffMemberForm({
  staffMemberId,
  initial,
}: {
  staffMemberId?: string;
  initial?: StaffMember;
}) {
  const navigate = useNavigate();
  const playersQuery = usePlayers();
  const playerOptions: ComboboxOption[] = (playersQuery.data ?? [])
    .slice()
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .map((p) => ({
      value: p.playerId.toString(),
      label: p.knownAs || p.fullName,
    }));

  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [knownAs, setKnownAs] = useState(initial?.knownAs ?? "");
  const [nationality, setNationality] = useState(initial?.nationality ?? "Malawi");
  const [playerId, setPlayerId] = useState(
    initial?.playerId?.toString() ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const dto: StaffMemberForm = {
      fullName: fullName.trim(),
      knownAs: knownAs.trim() || undefined,
      nationality: nationality.trim() || "Malawi",
      playerId: playerId !== "" ? Number(playerId) : undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    };
    try {
      if (staffMemberId !== undefined) {
        await updateStaffMember(Number(staffMemberId), dto);
        setSaved(true);
      } else {
        await createStaffMember(dto);
        // The registry is the destination — appointments are added from there.
        await navigate({ to: "/manage/staff" });
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const editing = staffMemberId !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to="/manage/staff" />}
        >
          <ArrowLeftIcon />
          Back to staff
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit staff member" : "Add staff member"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "Update the record. Appointments (dated roles at teams) are edited on the Staff page."
            : "Register a coach, manager or technical director. Roles at teams are assigned afterwards."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="staff-full">
              <Input
                id="staff-full"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder='e.g. "Mario Marinica"'
              />
            </Field>
            <Field label="Known as" htmlFor="staff-known">
              <Input
                id="staff-known"
                value={knownAs}
                onChange={(e) => setKnownAs(e.target.value)}
                placeholder="Only when it differs — the name used publicly"
              />
            </Field>
            <Field label="Nationality" htmlFor="staff-nationality">
              <Input
                id="staff-nationality"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="Malawi"
              />
            </Field>
            <Field label="Player link" htmlFor="staff-player">
              <Combobox
                id="staff-player"
                aria-label="Linked player registry record"
                value={playerId}
                onValueChange={setPlayerId}
                options={playerOptions}
                placeholder="None"
                searchPlaceholder="Search players…"
                emptyMessage="No players registered yet."
              />
            </Field>
            <Field label="Source URL" htmlFor="staff-source">
              <Input
                id="staff-source"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <div className="sm:col-span-2">
              <FormError message={error} />
            </div>
            <div className="flex items-center justify-end gap-3 sm:col-span-2">
              {saved && (
                <span className="text-xs text-muted-foreground">Saved ✓</span>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                nativeButton={false}
                render={<Link to="/manage/staff" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || fullName.trim() === ""}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add staff member"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
