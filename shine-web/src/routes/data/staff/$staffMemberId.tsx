import { Link, createFileRoute } from "@tanstack/react-router";
import {
  useStaffAppointmentPage,
  useStaffMember,
} from "@/lib/queries";
import {
  appointmentPeriod,
  appointmentTeamName,
  isOngoing,
  staffRoleLabel,
} from "@/lib/staff";
import { parseApiError } from "@/lib/users";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/data/staff/$staffMemberId")({
  component: StaffMemberDetailPage,
});

function StaffMemberDetailPage() {
  const { staffMemberId } = Route.useParams();
  const member = useStaffMember(staffMemberId);
  const appointments = useStaffAppointmentPage({
    staffMemberId: Number(staffMemberId),
    sort: "startDate",
    order: "desc",
    page: 1,
    pageSize: 100,
  });

  const error = member.error ?? appointments.error;
  if (error) return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!member.data)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  const m = member.data;
  const roles = appointments.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {m.knownAs || m.fullName}
        </h1>
        {m.knownAs && m.knownAs !== m.fullName && (
          <p className="text-sm text-muted-foreground">{m.fullName}</p>
        )}
        {m.sourceUrl && (
          <a
            href={m.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Source
          </a>
        )}
      </div>

      <dl className="rounded-2xl border border-border bg-card px-4">
        <div className="grid grid-cols-[10rem_1fr] gap-2 border-b border-border py-2.5 text-sm">
          <dt className="text-muted-foreground">Nationality</dt>
          <dd>{m.nationality}</dd>
        </div>
        <div className="grid grid-cols-[10rem_1fr] gap-2 py-2.5 text-sm last:border-b-0">
          <dt className="text-muted-foreground">Player link</dt>
          <dd>
            {m.playerId ? (
              <Link
                to="/data/players/$playerId"
                params={{ playerId: String(m.playerId) }}
                className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                Player #{m.playerId}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Roles
        </h2>
        <p className="text-sm text-muted-foreground">
          Dated appointments at clubs and national teams — an open end date
          means the role is ongoing.
        </p>
        {appointments.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roles recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Team</th>
                  <th className="px-2 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 text-right font-medium">Period</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((a) => (
                  <tr
                    key={a.staffAppointmentId}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-2.5">{appointmentTeamName(a) ?? "—"}</td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{staffRoleLabel(a.role)}</Badge>
                        {isOngoing(a) && <Badge variant="outline">ongoing</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {appointmentPeriod(a)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
