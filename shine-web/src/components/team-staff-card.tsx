import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton, Field, FormError } from "@/components/data-ui";
import {
  STAFF_ROLES,
  appointmentPeriod,
  createStaffAppointment,
  createStaffMember,
  deleteStaffAppointment,
  isOngoing,
  staffMemberLabel,
  staffRoleLabel,
  updateStaffAppointment,
  updateStaffMember,
  type StaffAppointment,
  type StaffAppointmentForm,
  type StaffMember,
  type StaffMemberForm,
} from "@/lib/staff";
import {
  queryKeys,
  usePlayers,
  useStaffAppointmentPage,
  useStaffMember,
  useStaffMembers,
} from "@/lib/queries";
import { parseApiError } from "@/lib/users";

type TeamKind = "club" | "national";

/** Staff for one club or national team — people are added here, in the team
 * context, and the appointment carries the role and dates. The shared staff
 * registry and its global page still exist for cross-team browsing. */
export function TeamStaffCard({
  teamKind,
  teamId,
  teamName,
}: {
  teamKind: TeamKind;
  teamId: number;
  teamName?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("staff:write");
  const queryClient = useQueryClient();

  const appointments = useStaffAppointmentPage(
    teamKind === "club"
      ? { clubId: teamId, pageSize: 100 }
      : { nationalTeamId: teamId, pageSize: 100 },
  );
  const members = useStaffMembers();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const memberOptions = useMemo<ComboboxOption[]>(
    () =>
      (members.data ?? [])
        .slice()
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((m) => ({
          value: m.staffMemberId.toString(),
          label: staffMemberLabel(m),
        })),
    [members.data],
  );

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.staffAppointments }),
      queryClient.invalidateQueries({ queryKey: queryKeys.staffMembers }),
    ]);
  }

  async function handleSaved() {
    setAdding(false);
    setEditingId(null);
    await refresh();
  }

  const items = appointments.data?.items ?? [];
  const error = appointments.error ?? members.error;
  const teamLabel =
    teamName ?? (teamKind === "club" ? "this club" : "this national team");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff</CardTitle>
        <CardDescription>
          Coaches and other staff at {teamLabel}. Add a person here and give
          them a dated role — no end date means the role is ongoing.
        </CardDescription>
        {canWrite && (
          <CardAction>
            <Button
              size="sm"
              variant={adding ? "outline" : "default"}
              onClick={() => setAdding((value) => !value)}
            >
              <PlusIcon />
              <span>{adding ? "Close" : "Add staff"}</span>
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {adding && canWrite && (
          <AddStaffForm
            teamKind={teamKind}
            teamId={teamId}
            memberOptions={memberOptions}
            membersLoading={members.isLoading}
            onSaved={handleSaved}
            onCancel={() => setAdding(false)}
          />
        )}

        {error ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2">
            <p className="text-sm text-destructive">{parseApiError(error)}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refresh()}
            >
              Retry
            </Button>
          </div>
        ) : appointments.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Period</TableHead>
                  {canWrite && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => (
                  <StaffRow
                    key={a.staffAppointmentId}
                    appointment={a}
                    canWrite={canWrite}
                    editing={editingId === a.staffAppointmentId}
                    onEdit={() => setEditingId(a.staffAppointmentId)}
                    onCancelEdit={() => setEditingId(null)}
                    onSaved={handleSaved}
                    onDelete={async () => {
                      await deleteStaffAppointment(a.staffAppointmentId);
                      await refresh();
                    }}
                  />
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={canWrite ? 4 : 3}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {canWrite
                        ? `No staff recorded at ${teamLabel} yet — add the first person above.`
                        : `No staff recorded at ${teamLabel} yet.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StaffRow({
  appointment,
  canWrite,
  editing,
  onEdit,
  onCancelEdit,
  onSaved,
  onDelete,
}: {
  appointment: StaffAppointment;
  canWrite: boolean;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={canWrite ? 4 : 3}>
          <EditStaffLoader
            appointment={appointment}
            onSaved={onSaved}
            onCancel={onCancelEdit}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        {appointment.staffMemberName ?? "Unknown staff member"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{staffRoleLabel(appointment.role)}</Badge>
          {isOngoing(appointment) && <Badge variant="outline">ongoing</Badge>}
        </div>
      </TableCell>
      <TableCell>{appointmentPeriod(appointment)}</TableCell>
      {canWrite && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              title={`Edit ${appointment.staffMemberName ?? "staff member"}`}
              onClick={onEdit}
            >
              <PencilSimpleIcon />
              <span className="sr-only">Edit</span>
            </Button>
            <DeleteButton
              name={`${appointment.staffMemberName ?? "this person"} (${staffRoleLabel(appointment.role)})`}
              onConfirm={onDelete}
            />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

function EditStaffLoader({
  appointment,
  onSaved,
  onCancel,
}: {
  appointment: StaffAppointment;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const member = useStaffMember(appointment.staffMemberId);

  if (member.isLoading) {
    return (
      <div className="flex flex-col gap-2 py-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (member.error || !member.data) {
    return (
      <div className="flex flex-col gap-2 py-2">
        <FormError
          message={
            member.error
              ? parseApiError(member.error)
              : "Staff member not found."
          }
        />
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <EditStaffForm
      appointment={appointment}
      member={member.data}
      onSaved={onSaved}
      onCancel={onCancel}
    />
  );
}

function AddStaffForm({
  teamKind,
  teamId,
  memberOptions,
  membersLoading,
  onSaved,
  onCancel,
}: {
  teamKind: TeamKind;
  teamId: number;
  memberOptions: ComboboxOption[];
  membersLoading: boolean;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [staffMemberId, setStaffMemberId] = useState("");
  const [fullName, setFullName] = useState("");
  const [knownAs, setKnownAs] = useState("");
  const [nationality, setNationality] = useState("Malawi");
  const [playerId, setPlayerId] = useState("");
  const [personSourceUrl, setPersonSourceUrl] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playersQuery = usePlayers();

  const playerOptions: ComboboxOption[] = useMemo(
    () =>
      (playersQuery.data ?? [])
        .slice()
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((p) => ({
          value: p.playerId.toString(),
          label: p.knownAs || p.fullName,
        })),
    [playersQuery.data],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (role === "") {
      setError("Choose a role for this appointment.");
      return;
    }
    if (mode === "existing" && staffMemberId === "") {
      setError("Choose an existing person, or switch to a new person.");
      return;
    }
    if (mode === "new" && fullName.trim() === "") {
      setError("A new staff member needs a full name.");
      return;
    }

    setBusy(true);
    try {
      let memberId: number;
      if (mode === "existing") {
        memberId = Number(staffMemberId);
      } else {
        const person = await createStaffMember({
          fullName: fullName.trim(),
          knownAs: knownAs.trim() || undefined,
          nationality: nationality.trim() || "Malawi",
          playerId: playerId !== "" ? Number(playerId) : undefined,
          sourceUrl: personSourceUrl.trim() || undefined,
        });
        memberId = person.staffMemberId;
      }

      const dto: StaffAppointmentForm = {
        staffMemberId: memberId,
        role,
        ...(teamKind === "club"
          ? { clubId: teamId }
          : { nationalTeamId: teamId }),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      };
      await createStaffAppointment(dto);
      await onSaved();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "new" ? "default" : "outline"}
          onClick={() => setMode("new")}
        >
          New person
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "existing" ? "default" : "outline"}
          onClick={() => setMode("existing")}
        >
          Existing person
        </Button>
      </div>

      {mode === "existing" ? (
        <Field label="Person" htmlFor="team-staff-add-person">
          <Combobox
            id="team-staff-add-person"
            aria-label="Existing staff member"
            value={staffMemberId}
            onValueChange={setStaffMemberId}
            options={memberOptions}
            placeholder={
              membersLoading ? "Loading people…" : "Select staff member…"
            }
            searchPlaceholder="Search people…"
            emptyMessage="No staff members yet — add a new person instead."
          />
        </Field>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" htmlFor="team-staff-full-name">
            <Input
              id="team-staff-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='e.g. "Mario Marinica"'
            />
          </Field>
          <Field label="Known as" htmlFor="team-staff-known-as">
            <Input
              id="team-staff-known-as"
              value={knownAs}
              onChange={(e) => setKnownAs(e.target.value)}
              placeholder="Only when it differs"
            />
          </Field>
          <Field label="Nationality" htmlFor="team-staff-nationality">
            <Input
              id="team-staff-nationality"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Malawi"
            />
          </Field>
          <Field label="Player link" htmlFor="team-staff-player">
            <Combobox
              id="team-staff-player"
              aria-label="Linked player registry record"
              value={playerId}
              onValueChange={setPlayerId}
              options={playerOptions}
              placeholder="None"
              searchPlaceholder="Search players…"
              emptyMessage="No players registered yet."
            />
          </Field>
          <Field label="Person source URL" htmlFor="team-staff-person-source">
            <Input
              id="team-staff-person-source"
              type="url"
              value={personSourceUrl}
              onChange={(e) => setPersonSourceUrl(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Role" htmlFor="team-staff-add-role">
          <RoleSelect
            id="team-staff-add-role"
            value={role}
            onChange={setRole}
          />
        </Field>
        <Field label="Source URL" htmlFor="team-staff-add-source">
          <Input
            id="team-staff-add-source"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="Start date" htmlFor="team-staff-add-start">
          <Input
            id="team-staff-add-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label="End date" htmlFor="team-staff-add-end">
          <Input
            id="team-staff-add-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
      </div>

      <FormError message={error} />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add to staff"}
        </Button>
      </div>
    </form>
  );
}

function EditStaffForm({
  appointment,
  member,
  onSaved,
  onCancel,
}: {
  appointment: StaffAppointment;
  member: StaffMember;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const playersQuery = usePlayers();
  const [fullName, setFullName] = useState(member.fullName);
  const [knownAs, setKnownAs] = useState(member.knownAs ?? "");
  const [nationality, setNationality] = useState(member.nationality);
  const [playerId, setPlayerId] = useState(member.playerId?.toString() ?? "");
  const [personSourceUrl, setPersonSourceUrl] = useState(
    member.sourceUrl ?? "",
  );
  const [role, setRole] = useState(appointment.role);
  const [startDate, setStartDate] = useState(appointment.startDate ?? "");
  const [endDate, setEndDate] = useState(appointment.endDate ?? "");
  const [sourceUrl, setSourceUrl] = useState(appointment.sourceUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playerOptions: ComboboxOption[] = useMemo(
    () =>
      (playersQuery.data ?? [])
        .slice()
        .sort((a, b) => a.fullName.localeCompare(b.fullName))
        .map((p) => ({
          value: p.playerId.toString(),
          label: p.knownAs || p.fullName,
        })),
    [playersQuery.data],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (fullName.trim() === "") {
      setError("A staff member needs a full name.");
      return;
    }
    if (role === "") {
      setError("Choose a role for this appointment.");
      return;
    }

    setBusy(true);
    try {
      const person: StaffMemberForm = {
        fullName: fullName.trim(),
        knownAs: knownAs.trim() || undefined,
        nationality: nationality.trim() || "Malawi",
        playerId: playerId !== "" ? Number(playerId) : undefined,
        sourceUrl: personSourceUrl.trim() || undefined,
      };
      await updateStaffMember(member.staffMemberId, person);

      const dto: StaffAppointmentForm = {
        staffMemberId: member.staffMemberId,
        role,
        clubId: appointment.clubId ?? undefined,
        nationalTeamId: appointment.nationalTeamId ?? undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      };
      await updateStaffAppointment(appointment.staffAppointmentId, dto);
      await onSaved();
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 py-2">
      <p className="text-xs text-muted-foreground">
        Person details are shared wherever this person works; this role and its
        dates belong to this team.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name" htmlFor="team-staff-edit-full-name">
          <Input
            id="team-staff-edit-full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </Field>
        <Field label="Known as" htmlFor="team-staff-edit-known-as">
          <Input
            id="team-staff-edit-known-as"
            value={knownAs}
            onChange={(e) => setKnownAs(e.target.value)}
            placeholder="Only when it differs"
          />
        </Field>
        <Field label="Nationality" htmlFor="team-staff-edit-nationality">
          <Input
            id="team-staff-edit-nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </Field>
        <Field label="Player link" htmlFor="team-staff-edit-player">
          <Combobox
            id="team-staff-edit-player"
            aria-label="Linked player registry record"
            value={playerId}
            onValueChange={setPlayerId}
            options={playerOptions}
            placeholder="None"
            searchPlaceholder="Search players…"
            emptyMessage="No players registered yet."
          />
        </Field>
        <Field label="Person source URL" htmlFor="team-staff-edit-person-source">
          <Input
            id="team-staff-edit-person-source"
            type="url"
            value={personSourceUrl}
            onChange={(e) => setPersonSourceUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="Role" htmlFor="team-staff-edit-role">
          <RoleSelect
            id="team-staff-edit-role"
            value={role}
            onChange={setRole}
          />
        </Field>
        <Field label="Source URL" htmlFor="team-staff-edit-source">
          <Input
            id="team-staff-edit-source"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <Field label="Start date" htmlFor="team-staff-edit-start">
          <Input
            id="team-staff-edit-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label="End date" htmlFor="team-staff-edit-end">
          <Input
            id="team-staff-edit-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
      </div>

      <FormError message={error} />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function RoleSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next ?? "")}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Select role…" />
      </SelectTrigger>
      <SelectContent>
        {STAFF_ROLES.map((role) => (
          <SelectItem key={role} value={role}>
            {staffRoleLabel(role)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
