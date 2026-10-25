import { Link } from "@tanstack/react-router";
import { SQUAD_STATUS_LABELS } from "@/lib/matchRecords";
import { positionLabel } from "@/lib/positions";
import { LINEUP_STATUSES } from "@/lib/squads";

export interface MatchSquadRow {
  playerId: number;
  lineupStatus: string;
  shirtNumber?: number | null;
  position?: string | null;
  captain: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  starter: "Starting XI",
  substitute: "Substitutes",
  matchday_squad: "Matchday squad",
  unused_sub: "Unused substitutes",
  reserve: "Reserves",
  suspended: "Suspended",
  injured: "Injured",
};

/**
 * One team's squad block: team name above its grouped squads. Two of these
 * sit side by side on a match detail page so the two teams' squads stay apart.
 */
export function TeamSquad({
  name,
  rows,
  playerName,
}: {
  name: string;
  rows: MatchSquadRow[];
  playerName: (playerId: number) => string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{name}</h2>
      <MatchSquad squad={rows} playerName={playerName} />
    </div>
  );
}

/**
 * Squad list grouped by lineup status. Rows keep the player link and show the
 * shirt number and position, since the group heading already says the status.
 */
export function MatchSquad({
  squad,
  playerName,
}: {
  squad: MatchSquadRow[];
  playerName: (playerId: number) => string;
}) {
  if (squad.length === 0) {
    return <p className="text-sm text-muted-foreground">No squad recorded.</p>;
  }

  const groups = new Map<string, MatchSquadRow[]>();
  for (const row of squad) {
    const rows = groups.get(row.lineupStatus) ?? [];
    rows.push(row);
    groups.set(row.lineupStatus, rows);
  }

  const known = new Set<string>(LINEUP_STATUSES);
  const statuses = [
    ...LINEUP_STATUSES.filter((status) => groups.has(status)),
    ...[...groups.keys()].filter((status) => !known.has(status)),
  ];

  return (
    <div className="flex flex-col gap-4">
      {statuses.map((status) => {
        const rows = groups.get(status) ?? [];
        const label = GROUP_LABELS[status] ?? SQUAD_STATUS_LABELS[status] ?? status;
        return (
          <div key={status} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}{" "}
              <span className="font-normal">({rows.length})</span>
            </h3>
            <ul className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              {rows.map((row) => (
                <li
                  key={`${status}-${row.playerId}`}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    to="/data/players/$playerId"
                    params={{ playerId: String(row.playerId) }}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                        {row.shirtNumber ?? "–"}
                      </span>
                      <span className="truncate text-sm font-medium">
                        {playerName(row.playerId)}
                        {row.captain ? " (C)" : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {positionLabel(row.position)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
