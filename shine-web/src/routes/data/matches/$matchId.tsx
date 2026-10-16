import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fixtureLabel, getMatch, type Match } from "@/lib/matches";
import { listPlayers, type Player } from "@/lib/players";
import { listClubSquads, type ClubSquad } from "@/lib/squads";
import { SQUAD_STATUS_LABELS } from "@/lib/matchRecords";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/matches/$matchId")({
  component: MatchDetailPage,
});

function MatchDetailPage() {
  const { matchId } = Route.useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [squad, setSquad] = useState<ClubSquad[]>([]);
  const [names, setNames] = useState<Map<number, Player>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setMatch(null);
    setSquad([]);
    setNames(new Map());
    setError(null);
    (async () => {
      try {
        const [found, playerList, squads] = await Promise.all([
          getMatch(Number(matchId)),
          listPlayers(),
          listClubSquads(),
        ]);
        if (cancelled) return;
        setMatch(found);
        setNames(new Map(playerList.map((p) => [p.playerId, p])));
        const order: Record<string, number> = { starter: 0, substitute: 1 };
        setSquad(
          squads
            .filter((s) => s.matchId === found.matchId)
            .sort(
              (a, b) =>
                (order[a.lineupStatus] ?? 2) - (order[b.lineupStatus] ?? 2),
            ),
        );
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!match) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {fixtureLabel(match)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {[match.matchDate, match.competition, match.season, match.venue]
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
                  key={`${s.clubId}-${s.playerId}`}
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
