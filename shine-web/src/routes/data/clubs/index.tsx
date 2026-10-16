import { Link, createFileRoute } from "@tanstack/react-router";
import { useClubs } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/clubs/")({
  component: ClubsListPage,
});

function ClubsListPage() {
  const { data: clubs = [], isLoading, error } = useClubs();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Clubs</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : clubs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No clubs recorded yet.</p>
      ) : (
        <ul className="flex flex-col rounded-2xl border border-border bg-card">
          {clubs.map((c) => (
            <li key={c.clubId} className="border-b border-border last:border-b-0">
              <Link
                to="/data/clubs/$clubId"
                params={{ clubId: String(c.clubId) }}
                className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {[c.city, c.country].filter(Boolean).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
