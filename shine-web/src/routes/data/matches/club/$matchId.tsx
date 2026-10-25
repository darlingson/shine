import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Fact } from "@/components/data-ui";
import { TeamSquad } from "@/components/match-squad";
import { formatMatchDate } from "@/lib/dates";
import { clubMatchLabel } from "@/lib/clubMatches";
import { useClubMatch, useClubSquads, usePlayers } from "@/lib/queries";
import { parseApiError } from "@/lib/users";
import type { ClubSquad } from "@/lib/squads";
import { LINEUP_STATUSES } from "@/lib/squads";

export const Route = createFileRoute("/data/matches/club/$matchId")({
  component: ClubMatchDetailPage,
});

/** Status first (canonical LINEUP_STATUSES order, unknown last), then shirt number. */
function squadSort(a: ClubSquad, b: ClubSquad): number {
  const rank = (status: string) => {
    const i = LINEUP_STATUSES.indexOf(status);
    return i === -1 ? LINEUP_STATUSES.length : i;
  };
  return (
    rank(a.lineupStatus) - rank(b.lineupStatus) ||
    (a.shirtNumber ?? 9999) - (b.shirtNumber ?? 9999)
  );
}

function ClubMatchDetailPage() {
  const { matchId } = Route.useParams();
  const match = useClubMatch(matchId);
  const players = usePlayers();
  const squads = useClubSquads();

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
    const isHome = (s: ClubSquad) => s.clubId === match.data!.homeClubId;
    const isAway = (s: ClubSquad) => s.clubId === match.data!.awayClubId;
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
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {clubMatchLabel(m)}
        </h1>
        {(m.competition || m.season) && (
          <p className="text-sm text-muted-foreground">
            {[m.competition, m.season].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
        <Fact label="Date">{formatMatchDate(m.matchDate)}</Fact>
        <Fact label="Venue">{m.venue ?? "—"}</Fact>
      </dl>

      {homeRows.length === 0 && awayRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No squads recorded.</p>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2">
          <TeamSquad
            name={m.homeClubName || `Club ${m.homeClubId ?? "?"}`}
            rows={homeRows}
            playerName={playerName}
          />
          <TeamSquad
            name={m.awayClubName || `Club ${m.awayClubId ?? "?"}`}
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
