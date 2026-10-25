import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { nationalTeamMatchLabel, type NationalTeamMatch } from "@/lib/nationalTeamMatches";
import { nationalTeamLabel } from "@/lib/nationalTeams";
import { positionLabel } from "@/lib/positions";
import {
  useClubs,
  useNationalSquads,
  useNationalTeamMatches,
  useNationalTeams,
  usePlayer,
  usePlayerClubs,
} from "@/lib/queries";
import { SQUAD_STATUS_LABELS } from "@/lib/matchRecords";
import { nationalEntryKey, statLine, type NationalSquad } from "@/lib/squads";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/players/$playerId")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { playerId } = Route.useParams();
  const player = usePlayer(playerId);
  const clubs = useClubs();
  const affils = usePlayerClubs();
  const nationalSquads = useNationalSquads();
  const nationalMatches = useNationalTeamMatches();
  const nationalTeams = useNationalTeams();

  const playerClubs = useMemo(() => {
    if (!player.data || !clubs.data || !affils.data) return [];
    const clubIds = new Set(
      affils.data
        .filter((a) => a.playerId === player.data.playerId)
        .map((a) => a.clubId),
    );
    return clubs.data.filter((c) => clubIds.has(c.clubId));
  }, [player.data, clubs.data, affils.data]);

  const teamNames = useMemo(
    () => new Map((nationalTeams.data ?? []).map((t) => [t.nationalTeamId, t])),
    [nationalTeams.data],
  );

  const appearances = useMemo(() => {
    if (!player.data || !nationalSquads.data || !nationalMatches.data) return [];
    const matches = new Map(nationalMatches.data.map((m) => [m.matchId, m]));
    const rows: Array<{ squad: NationalSquad; match: NationalTeamMatch }> = [];
    for (const s of nationalSquads.data) {
      if (s.playerId !== player.data.playerId) continue;
      const match = matches.get(s.matchId);
      if (match) rows.push({ squad: s, match });
    }
    return rows.sort((a, b) => b.match.matchDate.localeCompare(a.match.matchDate));
  }, [player.data, nationalSquads.data, nationalMatches.data]);

  const error =
    player.error ??
    clubs.error ??
    affils.error ??
    nationalSquads.error ??
    nationalMatches.error ??
    nationalTeams.error;
  if (error) return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!player.data)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  const p = player.data;
  const facts: Array<[string, string | undefined | null]> = [
    ["Known as", p.knownAs],
    ["Date of birth", p.dateOfBirth],
    [
      "Position",
      [p.positionPrimary, p.positionSecondary]
        .filter(Boolean)
        .map((code) => positionLabel(code))
        .join(" / ") || null,
    ],
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

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          National team
        </h2>
        {appearances.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No national team appearances recorded.
          </p>
        ) : (
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {appearances.map(({ squad, match }) => {
              const team = teamNames.get(squad.nationalTeamId);
              return (
                <li
                  key={nationalEntryKey(squad)}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    to="/data/matches/national/$matchId"
                    params={{ matchId: String(match.matchId) }}
                    className="flex items-start justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-medium">
                        {nationalTeamMatchLabel(match)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {[
                          team ? nationalTeamLabel(team) : null,
                          match.matchDate,
                          match.competition,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </span>
                    <span className="flex flex-col items-end text-xs text-muted-foreground">
                      <span>
                        {SQUAD_STATUS_LABELS[squad.lineupStatus] ??
                          squad.lineupStatus}
                        {squad.captain ? " (C)" : ""}
                      </span>
                      <span>{statLine(squad)}</span>
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
