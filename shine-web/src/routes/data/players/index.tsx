import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ListSearch } from "@/components/list-search";
import { usePlayers } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/players/")({
  component: PlayersListPage,
});

function PlayersListPage() {
  const { data: players = [], isLoading, error } = usePlayers();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        (p.knownAs ?? "").toLowerCase().includes(q),
    );
  }, [players, query]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Players
      </h1>
      <ListSearch
        value={query}
        onValueChange={setQuery}
        placeholder="Search players"
        aria-label="Search players"
        className="max-w-sm"
      />
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : players.length === 0 ? (
        <p className="text-sm text-muted-foreground">No players recorded yet.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No players match “{query.trim()}”.
        </p>
      ) : (
        <ul className="flex flex-col rounded-2xl border border-border bg-card">
          {filtered.map((p) => (
            <li key={p.playerId} className="border-b border-border last:border-b-0">
              <Link
                to="/data/players/$playerId"
                params={{ playerId: String(p.playerId) }}
                className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="text-sm font-medium">{p.knownAs || p.fullName}</span>
                <span className="text-xs text-muted-foreground">
                  {[p.positionPrimary, p.status].filter(Boolean).join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
