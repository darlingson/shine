import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListSearch } from "@/components/list-search";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
import { useNationalTeamMatches } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/matches/national/")({
  component: NationalTeamMatchesListPage,
});

function NationalTeamMatchesListPage() {
  const { data: matches = [], isLoading, error } = useNationalTeamMatches();
  const [query, setQuery] = useState("");
  const sorted = useMemo(
    () => [...matches].sort((a, b) => b.matchDate.localeCompare(a.matchDate)),
    [matches],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((m) =>
      [nationalTeamMatchLabel(m), m.competition ?? "", m.venue ?? ""].some(
        (field) => field.toLowerCase().includes(q),
      ),
    );
  }, [sorted, query]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          National team matches
        </h1>
        <p className="text-sm text-muted-foreground">
          Matches involving national teams.
        </p>
      </div>
      <ListSearch
        value={query}
        onValueChange={setQuery}
        placeholder="Search national team matches"
        aria-label="Search national team matches"
        className="max-w-sm"
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches recorded yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matches match “{query.trim()}”.
        </p>
      ) : (
        <ul className="flex flex-col rounded-2xl border border-border bg-card">
          {filtered.map((m) => (
            <li key={m.matchId} className="border-b border-border last:border-b-0">
              <Link
                to="/data/matches/national/$matchId"
                params={{ matchId: String(m.matchId) }}
                className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium">
                  {nationalTeamMatchLabel(m)}
                </span>
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
