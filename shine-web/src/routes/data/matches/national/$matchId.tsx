import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
import { SQUAD_STATUS_LABELS } from "@/lib/matchRecords";
import { useNationalSquads, useNationalTeamMatch, usePlayers } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/matches/national/$matchId")({
  component: NationalTeamMatchDetailPage,
});

function NationalTeamMatchDetailPage() {
  const { matchId } = Route.useParams();
  const match = useNationalTeamMatch(matchId);
  const players = usePlayers();
  const squads = useNationalSquads();

  const names = useMemo(
    () => new Map((players.data ?? []).map((p) => [p.playerId, p])),
    [players.data],
  );

  const squad = useMemo(() => {
    if (!match.data || !squads.data) return [];
    const order: Record<string, number> = { starter: 0, substitute: 1 };
    return squads.data
      .filter((s) => s.matchId === match.data.matchId)
      .sort(
        (a, b) => (order[a.lineupStatus] ?? 2) - (order[b.lineupStatus] ?? 2),
      );
  }, [match.data, squads.data]);

  const error = match.error ?? players.error ?? squads.error;
  if (error) return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!match.data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const m = match.data;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {nationalTeamMatchLabel(m)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {[m.matchDate, m.competition, m.season, m.venue]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Squad</h2>
        {squad.length === 0 ? (
          <p className="text-sm text-muted-foreground">No squad recorded.</p>
        ) : (
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {squad.map((s) => {
              const p = names.get(s.playerId);
              return (
                <li
                  key={`${s.nationalTeamId}-${s.playerId}`}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    to="/data/players/$playerId"
                    params={{ playerId: String(s.playerId) }}
                    className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-medium">
                      {p ? p.knownAs || p.fullName : "Unknown player"}
                      {s.captain ? " (C)" : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {SQUAD_STATUS_LABELS[s.lineupStatus] ?? s.lineupStatus}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
