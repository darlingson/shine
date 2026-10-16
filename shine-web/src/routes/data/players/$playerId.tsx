import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useClubs, usePlayer, usePlayerClubs } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/players/$playerId")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { playerId } = Route.useParams();
  const player = usePlayer(playerId);
  const clubs = useClubs();
  const affils = usePlayerClubs();

  const playerClubs = useMemo(() => {
    if (!player.data || !clubs.data || !affils.data) return [];
    const clubIds = new Set(
      affils.data
        .filter((a) => a.playerId === player.data.playerId)
        .map((a) => a.clubId),
    );
    return clubs.data.filter((c) => clubIds.has(c.clubId));
  }, [player.data, clubs.data, affils.data]);

  const error = player.error ?? clubs.error ?? affils.error;
  if (error) return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!player.data)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  const p = player.data;
  const facts: Array<[string, string | undefined | null]> = [
    ["Known as", p.knownAs],
    ["Date of birth", p.dateOfBirth],
    ["Position", [p.positionPrimary, p.positionSecondary].filter(Boolean).join(" / ") || null],
    ["Height", p.heightCm ? `${p.heightCm} cm` : null],
    ["Foot", p.foot],
    ["Status", p.status],
    ["Nationality", p.nationality],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {p.fullName}
        </h1>
        {p.sourceUrl && (
          <a
            href={p.sourceUrl}
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
        {playerClubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No club affiliations recorded.
          </p>
        ) : (
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {playerClubs.map((c) => (
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
