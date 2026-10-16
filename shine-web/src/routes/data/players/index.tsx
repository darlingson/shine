import { Link, createFileRoute } from "@tanstack/react-router";
import { usePlayers } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/players/")({
  component: PlayersListPage,
});

function PlayersListPage() {
  const { data: players = [], isLoading, error } = usePlayers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Players
      </h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : players.length === 0 ? (
        <p className="text-sm text-muted-foreground">No players recorded yet.</p>
      ) : (
        <ul className="flex flex-col rounded-2xl border border-border bg-card">
          {players.map((p) => (
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
