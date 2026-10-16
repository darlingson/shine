import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { fixtureLabel } from "@/lib/matches";
import { useMatches } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/matches/")({
  component: MatchesListPage,
});

function MatchesListPage() {
  const { data: matches = [], isLoading, error } = useMatches();
  const sorted = useMemo(
    () => [...matches].sort((a, b) => b.matchDate.localeCompare(a.matchDate)),
    [matches],
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Matches</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches recorded yet.</p>
      ) : (
        <ul className="flex flex-col rounded-2xl border border-border bg-card">
          {sorted.map((m) => (
            <li key={m.matchId} className="border-b border-border last:border-b-0">
              <Link
                to="/data/matches/$matchId"
                params={{ matchId: String(m.matchId) }}
                className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium">{fixtureLabel(m)}</span>
                <span className="text-xs text-muted-foreground">
                  {[m.matchDate, m.competition].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
