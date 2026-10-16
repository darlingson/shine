import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { fixtureLabel, type Match } from "@/lib/matches";
import { type Club } from "@/lib/clubs";
import { useClub, useMatches, usePlayerClubs, usePlayers } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/clubs/$clubId")({
  component: ClubDetailPage,
});

function matchesClub(m: Match, club: Club): boolean {
  const names = [club.name, club.shortName]
    .filter(Boolean)
    .map((n) => (n as string).toLowerCase());
  const teams = [m.homeTeam, m.awayTeam]
    .filter(Boolean)
    .map((t) => (t as string).toLowerCase());
  return names.some((n) => teams.includes(n));
}

function ClubDetailPage() {
  const { clubId } = Route.useParams();
  const club = useClub(clubId);
  const players = usePlayers();
  const affils = usePlayerClubs();
  const matches = useMatches();

  const clubPlayers = useMemo(() => {
    if (!club.data || !players.data || !affils.data) return [];
    const playerIds = new Set(
      affils.data
        .filter((a) => a.clubId === club.data.clubId && a.isCurrent)
        .map((a) => a.playerId),
    );
    return players.data.filter((p) => playerIds.has(p.playerId));
  }, [club.data, players.data, affils.data]);

  const clubMatches = useMemo(() => {
    if (!club.data || !matches.data) return [];
    return matches.data
      .filter((m) => matchesClub(m, club.data))
      .sort((a, b) => b.matchDate.localeCompare(a.matchDate));
  }, [club.data, matches.data]);

  const error = club.error ?? players.error ?? affils.error ?? matches.error;
  if (error) return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!club.data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const c = club.data;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {c.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {[c.city, c.country].filter(Boolean).join(", ")}
          {c.foundedYear ? ` · Founded ${c.foundedYear}` : ""}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Players</h2>
        {clubPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No players recorded.</p>
        ) : (
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {clubPlayers.map((p) => (
              <li key={p.playerId} className="border-b border-border last:border-b-0">
                <Link
                  to="/data/players/$playerId"
                  params={{ playerId: String(p.playerId) }}
                  className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">{p.knownAs || p.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.positionPrimary ?? "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Matches</h2>
        {clubMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches recorded.</p>
        ) : (
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {clubMatches.map((m) => (
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
      </section>
    </div>
  );
}
