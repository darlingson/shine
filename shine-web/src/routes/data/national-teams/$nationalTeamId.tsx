import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Fact } from "@/components/data-ui";
import { Pagination } from "@/components/pagination";
import { formatMatchDate } from "@/lib/dates";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
import {
  useNationalSquads,
  useNationalTeam,
  useNationalTeamMatchPage,
  usePlayers,
} from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/national-teams/$nationalTeamId")({
  component: NationalTeamDetailPage,
});

const MATCH_PAGE_SIZE = 10;

function NationalTeamDetailPage() {
  const { nationalTeamId } = Route.useParams();
  const teamId = Number(nationalTeamId);

  const team = useNationalTeam(nationalTeamId);
  const players = usePlayers();
  const squads = useNationalSquads();
  const [page, setPage] = useState(1);
  const matches = useNationalTeamMatchPage({
    nationalTeamId: teamId,
    sort: "matchDate",
    order: "desc",
    page,
    pageSize: MATCH_PAGE_SIZE,
  });

  const names = useMemo(
    () => new Map((players.data ?? []).map((p) => [p.playerId, p])),
    [players.data],
  );

  const playerName = (playerId: number) => {
    const p = names.get(playerId);
    return p ? p.knownAs || p.fullName : "Unknown player";
  };

  // No national-team roster table: a player is here because they were named
  // in at least one matchday squad. Apps count starts and substitute outings.
  const squadSummary = useMemo(() => {
    if (!squads.data) return [];
    const byPlayer = new Map<
      number,
      { playerId: number; apps: number; goals: number }
    >();
    for (const row of squads.data) {
      if (row.nationalTeamId !== teamId) continue;
      const entry = byPlayer.get(row.playerId) ?? {
        playerId: row.playerId,
        apps: 0,
        goals: 0,
      };
      if (row.lineupStatus === "starter" || row.lineupStatus === "substitute")
        entry.apps += 1;
      entry.goals += row.goals;
      byPlayer.set(row.playerId, entry);
    }
    return [...byPlayer.values()].sort((a, b) => {
      if (b.apps !== a.apps) return b.apps - a.apps;
      const aName = names.get(a.playerId)?.fullName ?? "";
      const bName = names.get(b.playerId)?.fullName ?? "";
      return aName.localeCompare(bName);
    });
  }, [squads.data, teamId, names]);

  const error = team.error ?? players.error ?? squads.error ?? matches.error;
  if (error) return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!team.data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const t = team.data;
  const matchItems = matches.data?.items ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t.name}
        </h1>
        {t.nickname && (
          <p className="text-sm text-muted-foreground">{t.nickname}</p>
        )}
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Country">{t.country}</Fact>
        <Fact label="Gender">{t.gender ?? "—"}</Fact>
        <Fact label="Level">{t.level ?? "—"}</Fact>
        <Fact label="Coach">{t.coach ?? "—"}</Fact>
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Players
        </h2>
        <p className="text-sm text-muted-foreground">
          Based on recorded match squads.
        </p>
        {squads.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : squadSummary.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No players recorded for this team yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Player</th>
                  <th className="px-2 py-2 font-medium">Pos</th>
                  <th className="px-2 py-2 text-right font-medium">Apps</th>
                  <th className="px-4 py-2 text-right font-medium">Goals</th>
                </tr>
              </thead>
              <tbody>
                {squadSummary.map((row) => (
                  <tr
                    key={row.playerId}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        to="/data/players/$playerId"
                        params={{ playerId: String(row.playerId) }}
                        className="font-medium outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {playerName(row.playerId)}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">
                      {names.get(row.playerId)?.positionPrimary ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {row.apps}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {row.goals}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Matches
        </h2>
        {matches.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : matchItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No matches recorded for this team yet.
          </p>
        ) : (
          <>
            <ul className="flex flex-col rounded-2xl border border-border bg-card">
              {matchItems.map((m) => (
                <li
                  key={m.matchId}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    to="/data/matches/national/$matchId"
                    params={{ matchId: String(m.matchId) }}
                    className="flex flex-col gap-0.5 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="text-sm font-medium">
                      {nationalTeamMatchLabel(m)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {[
                        formatMatchDate(m.matchDate),
                        m.stage,
                        m.competition,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Pagination
              page={matches.data!.page}
              pageSize={matches.data!.pageSize}
              total={matches.data!.total}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
