import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Fact } from "@/components/data-ui";
import { TeamSquad } from "@/components/match-squad";
import { Badge } from "@/components/ui/badge";
import { formatMatchDate } from "@/lib/dates";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
import { useNationalSquads, useNationalTeamMatch, usePlayers } from "@/lib/queries";
import { parseApiError } from "@/lib/users";
import type { NationalSquad } from "@/lib/squads";

export const Route = createFileRoute("/data/matches/national/$matchId")({
  component: NationalTeamMatchDetailPage,
});

/** Status first (starters, subs, unused…), then shirt number, unknown last. */
function squadSort(a: NationalSquad, b: NationalSquad): number {
  const order: Record<string, number> = { starter: 0, substitute: 1 };
  return (
    (order[a.lineupStatus] ?? 2) - (order[b.lineupStatus] ?? 2) ||
    (a.shirtNumber ?? 9999) - (b.shirtNumber ?? 9999)
  );
}

function NationalTeamMatchDetailPage() {
  const { matchId } = Route.useParams();
  const match = useNationalTeamMatch(matchId);
  const players = usePlayers();
  const squads = useNationalSquads();

  const names = useMemo(
    () => new Map((players.data ?? []).map((p) => [p.playerId, p])),
    [players.data],
  );

  const { homeRows, awayRows, otherRows } = useMemo(() => {
    if (!match.data || !squads.data)
      return { homeRows: [], awayRows: [], otherRows: [] };
    const rows = squads.data
      .filter((s) => s.matchId === match.data.matchId)
      .sort(squadSort);
    const isHome = (s: NationalSquad) => s.nationalTeamId === match.data!.homeNationalTeamId;
    const isAway = (s: NationalSquad) => s.nationalTeamId === match.data!.awayNationalTeamId;
    return {
      homeRows: rows.filter(isHome),
      awayRows: rows.filter(isAway),
      otherRows: rows.filter((s) => !isHome(s) && !isAway(s)),
    };
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

      {homeRows.length === 0 && awayRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No squads recorded.</p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <TeamSquad
            name={m.homeNationalTeamName || `Team ${m.homeNationalTeamId ?? "?"}`}
            rows={homeRows}
            playerName={playerName}
          />
          <TeamSquad
            name={m.awayNationalTeamName || `Team ${m.awayNationalTeamId ?? "?"}`}
            rows={awayRows}
            playerName={playerName}
          />
        </section>
      )}

      {otherRows.length > 0 && (
        <section>
          <TeamSquad
            name="Other squads"
            rows={otherRows}
            playerName={playerName}
          />
        </section>
      )}
    </div>
  );
}
