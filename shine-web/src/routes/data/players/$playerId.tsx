import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPlayer, type Player } from "@/lib/players";
import { listClubs, type Club } from "@/lib/clubs";
import { listPlayerClubs } from "@/lib/playerclubs";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/players/$playerId")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { playerId } = Route.useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPlayer(null);
    setClubs([]);
    setError(null);
    (async () => {
      try {
        const [found, clubList, affils] = await Promise.all([
          getPlayer(Number(playerId)),
          listClubs(),
          listPlayerClubs(),
        ]);
        if (cancelled) return;
        setPlayer(found);
        const clubIds = new Set(
          affils.filter((a) => a.playerId === found.playerId).map((a) => a.clubId),
        );
        setClubs(clubList.filter((c) => clubIds.has(c.clubId)));
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (error)
    return <p className="text-sm text-destructive">{error}</p>;
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
