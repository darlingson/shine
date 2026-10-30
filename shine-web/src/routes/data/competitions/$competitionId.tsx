import { Link, createFileRoute } from "@tanstack/react-router";
import { Fact } from "@/components/data-ui";
import {
  useClubMatchPage,
  useCompetition,
  useCompetitionSeasons,
  useNationalTeamMatchPage,
} from "@/lib/queries";
import { clubMatchLabel } from "@/lib/clubMatches";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
import { seasonLabel } from "@/lib/competitions";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/competitions/$competitionId")({
  component: CompetitionDetailPage,
});

const LATEST_PAGE_SIZE = 5;

function CompetitionDetailPage() {
  const { competitionId } = Route.useParams();
  const id = Number(competitionId);

  const competition = useCompetition(competitionId);
  const seasons = useCompetitionSeasons(competitionId);
  const clubMatches = useClubMatchPage({
    competitionId: id,
    sort: "matchDate",
    order: "desc",
    page: 1,
    pageSize: LATEST_PAGE_SIZE,
  });
  const nationalMatches = useNationalTeamMatchPage({
    competitionId: id,
    sort: "matchDate",
    order: "desc",
    page: 1,
    pageSize: LATEST_PAGE_SIZE,
  });

  const error =
    competition.error ?? seasons.error ?? clubMatches.error ?? nationalMatches.error;
  if (error)
    return <p className="text-sm text-destructive">{parseApiError(error)}</p>;
  if (!competition.data)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  const c = competition.data;
  const seasonItems = [...(seasons.data ?? [])].sort((a, b) => {
    // Most recent edition first: label desc, then creation order desc.
    return (b.label ?? "").localeCompare(a.label ?? "") || b.seasonId - a.seasonId;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {c.name}
        </h1>
        {c.shortName && (
          <p className="text-sm text-muted-foreground">{c.shortName}</p>
        )}
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Kind">{c.kind}</Fact>
        <Fact label="Tier">
          {c.tier !== null && c.tier !== undefined ? `Tier ${c.tier}` : "—"}
        </Fact>
        <Fact label="Scope">{c.scope ?? "—"}</Fact>
        <Fact label="Region">{c.region ?? "—"}</Fact>
        <Fact label="Source">
          {c.sourceUrl ? (
            <a
              href={c.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Link
            </a>
          ) : (
            "—"
          )}
        </Fact>
      </dl>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          Seasons ({seasonItems.length})
        </h2>
        {seasons.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : seasonItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No seasons recorded for this competition yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Edition</th>
                  <th className="px-4 py-2 font-medium">Label</th>
                  <th className="px-4 py-2 font-medium">Covers</th>
                </tr>
              </thead>
              <tbody>
                {seasonItems.map((s) => (
                  <tr key={s.seasonId} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2 font-medium">{seasonLabel(s)}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {s.label ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {(s.startDate ?? s.endDate)
                        ? `${s.startDate ?? "?"} – ${s.endDate ?? "open"}`
                        : "—"}
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
          Latest matches
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Club</h3>
            {clubMatches.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (clubMatches.data?.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No club matches linked yet.
              </p>
            ) : (
              <>
                <ul className="flex flex-col rounded-2xl border border-border bg-card">
                  {(clubMatches.data?.items ?? []).map((m) => (
                    <li
                      key={m.matchId}
                      className="border-b border-border last:border-b-0"
                    >
                      <Link
                        to="/data/matches/club/$matchId"
                        params={{ matchId: String(m.matchId) }}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="text-sm font-medium">
                          {clubMatchLabel(m)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.matchDate}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">National</h3>
            {nationalMatches.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (nationalMatches.data?.items ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No national matches linked yet.
              </p>
            ) : (
              <>
                <ul className="flex flex-col rounded-2xl border border-border bg-card">
                  {(nationalMatches.data?.items ?? []).map((m) => (
                    <li
                      key={m.matchId}
                      className="border-b border-border last:border-b-0"
                    >
                      <Link
                        to="/data/matches/national/$matchId"
                        params={{ matchId: String(m.matchId) }}
                        className="flex items-center justify-between gap-2 px-4 py-2.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="text-sm font-medium">
                          {nationalTeamMatchLabel(m)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.matchDate}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
