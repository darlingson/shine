import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DownloadSimpleIcon,
  PencilSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
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
import { OptionalSelect } from "@/components/OptionalSelect";
import { DeleteButton, Field, FormError } from "@/components/data-ui";
import {
  STAFF_ROLES,
  appointmentPeriod,
  createStaffAppointment,
  deleteStaffAppointment,
  deleteStaffMember,
  isOngoing,
  staffAppointmentsExportHref,
  staffMemberLabel,
  staffMembersExportHref,
  staffRoleLabel,
  updateStaffAppointment,
  type StaffAppointment,
  type StaffAppointmentForm,
  type StaffMember,
} from "@/lib/staff";
import {
  useClubs,
  useNationalTeams,
  useStaffAppointmentPage,
  useStaffMembers,
} from "@/lib/queries";
import { nationalTeamLabel } from "@/lib/nationalTeams";
import { parseApiError } from "@/lib/users";

const ALL = "all";

export function StaffPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("staff:write");
  const members = useStaffMembers();
  const error = members.error ? parseApiError(members.error) : null;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members.data ?? [];
    return (members.data ?? []).filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.knownAs ?? "").toLowerCase().includes(q) ||
        m.nationality.toLowerCase().includes(q),
    );
  }, [members.data, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Staff
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "The cross-team staff directory. Add and appoint people from a club or national team's own page — this view keeps the registry and full role history in one place."
              : "Read-only access — editing needs the staff:write permission."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<a href={staffMembersExportHref("csv")} />}
          >
            <DownloadSimpleIcon />
            <span>People CSV</span>
          </Button>
          <Button
            variant="outline"
            render={<a href={staffAppointmentsExportHref("csv")} />}
          >
            <span>Roles CSV</span>
          </Button>
          <Button
            variant="outline"
            render={<a href={staffMembersExportHref("json")} />}
          >
            Export JSON
          </Button>
          {canWrite && (
            <Button
              nativeButton={false}
              render={<Link to="/manage/staff/people/new" />}
            >
              <PlusIcon />
              <span>Add staff member</span>
            </Button>
          )}
        </div>
      </div>

      <PeopleCard
        canWrite={canWrite}
        query={query}
        setQuery={setQuery}
        loading={members.isLoading}
        error={error}
        people={filtered}
        refetch={members.refetch}
      />

      <ClubStaffCard canWrite={canWrite} />
      <NationalStaffCard canWrite={canWrite} />
    </div>
  );
}

function PeopleCard({
  canWrite,
  query,
  setQuery,
  loading,
  error,
  people,
  refetch,
}: {
  canWrite: boolean;
  query: string;
  setQuery: (q: string) => void;
  loading: boolean;
  error: string | null;
  people: StaffMember[];
  refetch: () => Promise<unknown>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>People ({people.length})</CardTitle>
        <CardDescription>
          One stable record per person. To appoint someone, open the club or
          national team and add them in its Staff section.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input
          aria-label="Search staff by name"
          placeholder="Search by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Player link</TableHead>
                  {canWrite && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((m) => (
                  <TableRow key={m.staffMemberId}>
                    <TableCell className="font-medium">
                      {m.fullName}
                      {m.knownAs && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          “{m.knownAs}”
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{m.nationality}</Badge>
                    </TableCell>
                    <TableCell>
                      {m.playerId ? (
                        <Link
                          to="/manage/players/$playerId"
                          params={{ playerId: String(m.playerId) }}
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Player #{m.playerId}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title={`Edit ${m.fullName}`}
                            aria-label={`Edit ${m.fullName}`}
                            nativeButton={false}
                            render={
                              <Link
                                to="/manage/staff/people/$staffMemberId"
                                params={{
                                  staffMemberId: String(m.staffMemberId),
                                }}
                              />
                            }
                          >
                            <PencilSimpleIcon />
                          </Button>
                          <DeleteButton
                            name={m.fullName}
                            onConfirm={async () => {
                              await deleteStaffMember(m.staffMemberId);
                              await refetch();
                            }}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {people.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={canWrite ? 4 : 3}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No staff members yet — add them from a club or national
                      team's Staff section.
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

/** Dated appointments at one club or one national side — the team's staff
 * list over time. A caretaker stint is just a short window like any other. */
function AppointmentsCard({
  title,
  canWrite,
  teamKind,
  teamOptions,
  teamsLoading,
  emptyTeamsMessage,
}: {
  title: string;
  canWrite: boolean;
  teamKind: "club" | "national";
  teamOptions: ComboboxOption[];
  teamsLoading: boolean;
  emptyTeamsMessage: string;
}) {
  const [teamId, setTeamId] = useState("");
  // Land on the first team so the list is never empty-looking by accident.
  useEffect(() => {
    if (teamId === "" && teamOptions.length > 0) setTeamId(teamOptions[0].value);
  }, [teamId, teamOptions]);

  const selected = teamId !== "" ? Number(teamId) : undefined;
  const page = useStaffAppointmentPage(
    teamKind === "club"
      ? { clubId: selected, pageSize: 100 }
      : { nationalTeamId: selected, pageSize: 100 },
    selected !== undefined,
  );
  const members = useStaffMembers();
  const error = page.error ? parseApiError(page.error) : null;
  const memberError = members.error ? parseApiError(members.error) : null;
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const memberOptions: ComboboxOption[] = (members.data ?? [])
    .slice()
    .sort((a, b) => a.fullName.localeCompare(b.fullName))
    .map((m) => ({
      value: m.staffMemberId.toString(),
      label: staffMemberLabel(m),
    }));

  async function runAndRefetch(op: () => Promise<unknown>) {
    setFormError(null);
    try {
      await op();
      await page.refetch();
      await members.refetch();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  const teamField = teamKind === "club" ? "club" : "national team";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          A dated role at one {teamField} — an empty end date means the role is
          ongoing; a caretaker spell or a one-off is a short window, nothing
          more.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label={teamKind === "club" ? "Club" : "National team"} htmlFor={`staff-team-${teamKind}`}>
            <Select
              value={teamId || ALL}
              onValueChange={(value) => {
                setTeamId(value === ALL ? "" : (value ?? ""));
              }}
            >
              <SelectTrigger id={`staff-team-${teamKind}`} className="min-w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {canWrite && selected !== undefined && !teamsLoading && (
          <AddAppointmentForm
            teamId={selected}
            memberOptions={memberOptions}
            busyId={busyId}
            setBusyId={setBusyId}
          />
        )}
        {formError && <FormError message={formError} />}
        {!teamsLoading && selected === undefined && (
          <p className="text-sm text-muted-foreground">{emptyTeamsMessage}</p>
        )}
        {selected !== undefined &&
        (page.isLoading || memberError) &&
        !formError ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : selected !== undefined && error ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2">
            <p className="text-sm text-destructive">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void page.refetch()}>
              Retry
            </Button>
          </div>
        ) : selected !== undefined ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Period</TableHead>
                  {canWrite && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {(page.data?.items ?? []).map((a) => (
                  <AppointmentRow
                    key={a.staffAppointmentId}
                    appointment={a}
                    memberOptions={memberOptions}
                    canWrite={canWrite}
                    busy={busyId === a.staffAppointmentId}
                    onBusy={(n) => setBusyId(n)}
                    onSave={(dto) =>
                      runAndRefetch(async () => {
                        await updateStaffAppointment(
                          a.staffAppointmentId,
                          dto,
                        );
                      })
                    }
                    onDelete={() =>
                      runAndRefetch(async () => {
                        await deleteStaffAppointment(a.staffAppointmentId);
                      })
                    }
                  />
                ))}
                {(page.data?.items ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={canWrite ? 4 : 3}
                      className="text-center text-sm text-muted-foreground"
                    >
                      {canWrite
                        ? `No staff recorded at this ${teamField} yet — add the first appointment above.`
                        : `No staff recorded at this ${teamField} yet.`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  function AddAppointmentForm({
    teamId,
    memberOptions,
    busyId,
    setBusyId,
  }: {
    teamId: number;
    memberOptions: ComboboxOption[];
    busyId: number | null;
    setBusyId: (n: number | null) => void;
  }) {
    const [staffMemberId, setStaffMemberId] = useState("");
    const [role, setRole] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [sourceUrl, setSourceUrl] = useState("");

    async function onAdd(e: React.FormEvent) {
      e.preventDefault();
      if (staffMemberId === "" || role.trim() === "") {
        setFormError("An appointment needs a person and a role.");
        return;
      }
      setBusyId(-1);
      const dto = toAppointmentDto(
        staffMemberId,
        role,
        teamKind === "club" ? Number(teamId) : undefined,
        teamKind === "national" ? Number(teamId) : undefined,
        startDate,
        endDate,
        sourceUrl,
      );
      await runAndRefetch(async () => {
        await createStaffAppointment(dto);
        setStaffMemberId("");
        setRole("");
        setStartDate("");
        setEndDate("");
        setSourceUrl("");
      });
    }

    return (
      <form
        onSubmit={onAdd}
        className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2"
      >
        <Field label="Person" htmlFor={`staff-add-person-${teamKind}`}>
          <Combobox
            id={`staff-add-person-${teamKind}`}
            aria-label={`Appointed person (${teamKind})`}
            value={staffMemberId}
            onValueChange={setStaffMemberId}
            options={memberOptions}
            placeholder="Select staff member…"
            searchPlaceholder="Search people…"
            emptyMessage="No staff members yet — add one above."
          />
        </Field>
        <Field label="Role" htmlFor={`staff-add-role-${teamKind}`}>
          <OptionalSelect
            id={`staff-add-role-${teamKind}`}
            value={role}
            onChange={setRole}
            options={[...STAFF_ROLES]}
            placeholder="Select role…"
          />
        </Field>
        <Field label="Start date" htmlFor={`staff-add-start-${teamKind}`}>
          <Input
            id={`staff-add-start-${teamKind}`}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Field>
        <Field label="End date" htmlFor={`staff-add-end-${teamKind}`}>
          <Input
            id={`staff-add-end-${teamKind}`}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Field>
        <Field label="Source URL" htmlFor={`staff-add-source-${teamKind}`}>
          <Input
            id={`staff-add-source-${teamKind}`}
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={busyId !== null || memberOptions.length === 0}>
            {busyId === -1 ? "Saving…" : "Add appointment"}
          </Button>
        </div>
      </form>
    );
  }
}

function toAppointmentDto(
  staffMemberId: string,
  role: string,
  clubId: number | undefined,
  nationalTeamId: number | undefined,
  startDate: string,
  endDate: string,
  sourceUrl: string,
): StaffAppointmentForm {
  return {
    staffMemberId: Number(staffMemberId),
    role: role.trim(),
    clubId,
    nationalTeamId,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    sourceUrl: sourceUrl.trim() || undefined,
  };
}

function AppointmentRow({
  appointment: a,
  memberOptions,
  canWrite,
  busy,
  onBusy,
  onSave,
  onDelete,
}: {
  appointment: StaffAppointment;
  memberOptions: ComboboxOption[];
  canWrite: boolean;
  busy: boolean;
  onBusy: (n: number | null) => void;
  onSave: (dto: StaffAppointmentForm) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={canWrite ? 4 : 3}>
          <EditAppointmentForm
            appointment={a}
            memberOptions={memberOptions}
            busy={busy}
            onSave={async (dto) => {
              onBusy(a.staffAppointmentId);
              await onSave(dto);
            }}
            onCancel={() => setEditing(false)}
          />
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{a.staffMemberName ?? "—"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{staffRoleLabel(a.role)}</Badge>
          {isOngoing(a) && <Badge variant="outline">ongoing</Badge>}
        </div>
      </TableCell>
      <TableCell>{appointmentPeriod(a)}</TableCell>
      {canWrite && (
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <DeleteButton
              name={`${a.staffMemberName ?? "this person"} (${staffRoleLabel(a.role)})`}
              onConfirm={async () => {
                onBusy(a.staffAppointmentId);
                await onDelete();
              }}
            />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}

function EditAppointmentForm({
  appointment: a,
  memberOptions,
  busy,
  onSave,
  onCancel,
}: {
  appointment: StaffAppointment;
  memberOptions: ComboboxOption[];
  busy: boolean;
  onSave: (dto: StaffAppointmentForm) => Promise<void>;
  onCancel: () => void;
}) {
  const [staffMemberId, setStaffMemberId] = useState(a.staffMemberId.toString());
  const [role, setRole] = useState(a.role);
  const [startDate, setStartDate] = useState(a.startDate ?? "");
  const [endDate, setEndDate] = useState(a.endDate ?? "");
  const [sourceUrl, setSourceUrl] = useState(a.sourceUrl ?? "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(
      toAppointmentDto(
        staffMemberId,
        role,
        a.clubId ?? undefined,
        a.nationalTeamId ?? undefined,
        startDate,
        endDate,
        sourceUrl,
      ),
    );
    onCancel();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <Field label="Person" htmlFor={`staff-edit-person-${a.staffAppointmentId}`}>
        <Combobox
          id={`staff-edit-person-${a.staffAppointmentId}`}
          aria-label={`Appointed person, appointment ${a.staffAppointmentId}`}
          value={staffMemberId}
          onValueChange={setStaffMemberId}
          options={memberOptions}
          placeholder="Select staff member…"
          searchPlaceholder="Search people…"
          emptyMessage="No staff members yet — add one above."
        />
      </Field>
      <Field label="Role" htmlFor={`staff-edit-role-${a.staffAppointmentId}`}>
        <OptionalSelect
          id={`staff-edit-role-${a.staffAppointmentId}`}
          value={role}
          onChange={setRole}
          options={[...STAFF_ROLES]}
        />
      </Field>
      <Field label="Start date" htmlFor={`staff-edit-start-${a.staffAppointmentId}`}>
        <Input
          id={`staff-edit-start-${a.staffAppointmentId}`}
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </Field>
      <Field label="End date" htmlFor={`staff-edit-end-${a.staffAppointmentId}`}>
        <Input
          id={`staff-edit-end-${a.staffAppointmentId}`}
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </Field>
      <Field label="Source URL" htmlFor={`staff-edit-source-${a.staffAppointmentId}`}>
        <Input
          id={`staff-edit-source-${a.staffAppointmentId}`}
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://…"
        />
      </Field>
      <div className="flex items-end justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save appointment"}
        </Button>
      </div>
    </form>
  );
}

function ClubStaffCard({ canWrite }: { canWrite: boolean }) {
  const clubs = useClubs();
  const teamOptions = (clubs.data ?? []).map((c) => ({
    value: c.clubId.toString(),
    label: c.name,
  }));
  return (
    <AppointmentsCard
      title="Club staff"
      canWrite={canWrite}
      teamKind="club"
      teamOptions={teamOptions}
      teamsLoading={clubs.isLoading}
      emptyTeamsMessage="No clubs registered yet — add one under Manage → Clubs."
    />
  );
}

function NationalStaffCard({ canWrite }: { canWrite: boolean }) {
  const nationalTeams = useNationalTeams();
  const teamOptions = (nationalTeams.data ?? []).map((t) => ({
    value: t.nationalTeamId.toString(),
    label: nationalTeamLabel(t),
  }));
  return (
    <AppointmentsCard
      title="National team staff"
      canWrite={canWrite}
      teamKind="national"
      teamOptions={teamOptions}
      teamsLoading={nationalTeams.isLoading}
      emptyTeamsMessage="No national teams registered yet — add one under Manage → National teams."
    />
  );
}
