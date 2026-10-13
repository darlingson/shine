import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listPlayers, type Player } from "@/lib/players";
import { listClubs, type Club } from "@/lib/clubs";
import { listPlayerClubs } from "@/lib/playerclubs";

export const Route = createFileRoute("/data/players/$playerId")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { playerId } = Route.useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [players, clubList, affils] = await Promise.all([
          listPlayers(),
          listClubs(),
          listPlayerClubs(),
        ]);
        if (cancelled) return;
        const found = players.find((p) => p.playerId === Number(playerId));
        if (!found) {
          setMissing(true);
          return;
        }
        setPlayer(found);
        const clubIds = new Set(
          affils.filter((a) => a.playerId === found.playerId).map((a) => a.clubId),
        );
        setClubs(clubList.filter((c) => clubIds.has(c.clubId)));
      } catch {
        if (!cancelled) setMissing(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (missing)
    return <p className="text-sm text-muted-foreground">Player not found.</p>;
  if (!player)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  const facts: Array<[string, string | undefined | null]> = [
    ["Known as", player.knownAs],
    ["Date of birth", player.dateOfBirth],
    ["Position", [player.positionPrimary, player.positionSecondary].filter(Boolean).join(" / ") || null],
    ["Height", player.heightCm ? `${player.heightCm} cm` : null],
    ["Foot", player.foot],
    ["Status", player.status],
    ["Nationality", player.nationality],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {player.fullName}
        </h1>
        {player.sourceUrl && (
          <a
            href={player.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-primary underline-offset-4 hover:underline"
          >
            Source
          </a>
        )}
      </div>

      <dl className="rounded-2xl border border-border bg-card px-4">
        {facts.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[10rem_1fr] gap-2 border-b border-border py-2.5 text-sm last:border-b-0"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value || "—"}</dd>
          </div>
        ))}
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Clubs</h2>
        {clubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No club affiliations recorded.
          </p>
        ) : (
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {clubs.map((c) => (
              <li key={c.clubId} className="border-b border-border last:border-b-0">
                <Link
                  to="/data/clubs/$clubId"
                  params={{ clubId: String(c.clubId) }}
                  className="block px-4 py-3 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
