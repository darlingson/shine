import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listClubs, type Club } from "@/lib/clubs";
import { listPlayers, type Player } from "@/lib/players";
import { listPlayerClubs } from "@/lib/playerclubs";
import { fixtureLabel, listMatches, type Match } from "@/lib/matches";

export const Route = createFileRoute("/data/clubs/$clubId")({
  component: ClubDetailPage,
});

function involvesClub(m: Match, club: Club): boolean {
  const names = [club.name, club.shortName].filter(Boolean) as string[];
  const teams = [m.homeTeam, m.awayTeam].filter(Boolean) as string[];
  return names.some((n) => teams.some((t) => t.includes(n) || n.includes(t)));
}

function ClubDetailPage() {
  const { clubId } = Route.useParams();
  const [club, setClub] = useState<Club | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [clubList, playerList, affils, matchList] = await Promise.all([
          listClubs(),
          listPlayers(),
          listPlayerClubs(),
          listMatches(),
        ]);
        if (cancelled) return;
        const found = clubList.find((c) => c.clubId === Number(clubId));
        if (!found) {
          setMissing(true);
          return;
        }
        setClub(found);
        const playerIds = new Set(
          affils
            .filter((a) => a.clubId === found.clubId && a.isCurrent)
            .map((a) => a.playerId),
        );
        setPlayers(playerList.filter((p) => playerIds.has(p.playerId)));
        setMatches(
          matchList
            .filter((m) => involvesClub(m, found))
            .sort((a, b) => b.matchDate.localeCompare(a.matchDate)),
        );
      } catch {
        if (!cancelled) setMissing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  if (missing) return <p className="text-sm text-muted-foreground">Club not found.</p>;
  if (!club) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {club.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {[club.city, club.country].filter(Boolean).join(", ")}
          {club.foundedYear ? ` · Founded ${club.foundedYear}` : ""}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Players</h2>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground">No players recorded.</p>
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
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches recorded.</p>
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
      </section>
    </div>
  );
}
