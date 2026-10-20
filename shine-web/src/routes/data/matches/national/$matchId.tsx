import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Fact } from "@/components/data-ui";
import { MatchSquad } from "@/components/match-squad";
import { Badge } from "@/components/ui/badge";
import { formatMatchDate } from "@/lib/dates";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
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
  const playerName = (playerId: number) => {
    const p = names.get(playerId);
    return p ? p.knownAs || p.fullName : "Unknown player";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {(m.stage || m.isNeutral) && (
          <div className="flex flex-wrap items-center gap-2">
            {m.stage && <Badge variant="secondary">{m.stage}</Badge>}
            {m.isNeutral && <Badge variant="outline">Neutral venue</Badge>}
          </div>
        )}
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {nationalTeamMatchLabel(m)}
          </h1>
          {(m.competition || m.season) && (
            <p className="text-sm text-muted-foreground">
              {[m.competition, m.season].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
        <Fact label="Date">{formatMatchDate(m.matchDate)}</Fact>
        <Fact label="Kickoff">
          {m.kickoffTime ? `${m.kickoffTime.slice(0, 5)} CAT` : "—"}
        </Fact>
        <Fact label="Venue">{m.venue ?? "—"}</Fact>
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Squad</h2>
        <MatchSquad squad={squad} playerName={playerName} />
      </section>
    </div>
  );
}
