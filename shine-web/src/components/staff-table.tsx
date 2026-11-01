import { Badge } from "@/components/ui/badge";
import {
  appointmentPeriod,
  isOngoing,
  staffRoleLabel,
  type StaffAppointment,
} from "@/lib/staff";

/** Read-only staff list for a club or national team's data page. */
export function StaffTable({
  items,
  emptyMessage,
  loading,
}: {
  items: StaffAppointment[];
  emptyMessage: string;
  loading?: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-2 font-medium">Person</th>
            <th className="px-2 py-2 font-medium">Role</th>
            <th className="px-4 py-2 text-right font-medium">Period</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr
              key={a.staffAppointmentId}
              className="border-b border-border last:border-b-0"
            >
              <td className="px-4 py-2.5 font-medium">
                {a.staffMemberName ?? "Unknown staff member"}
              </td>
              <td className="px-2 py-2.5">
                <span className="flex items-center gap-2">
                  {staffRoleLabel(a.role)}
                  {isOngoing(a) && <Badge variant="secondary">Current</Badge>}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">
                {appointmentPeriod(a)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
