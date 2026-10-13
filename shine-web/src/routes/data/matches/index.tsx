import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fixtureLabel, listMatches, type Match } from "@/lib/matches";

export const Route = createFileRoute("/data/matches/")({
  component: MatchesListPage,
});

function MatchesListPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMatches()
      .then((m) => setMatches([...m].sort((a, b) => b.matchDate.localeCompare(a.matchDate))))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Matches</h1>
      {matches.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches recorded yet.</p>
      ) : (
        <ul className="flex flex-col rounded-2xl border border-border bg-card">
          {matches.map((m) => (
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
