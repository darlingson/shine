import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SiteNav } from "@/components/site-nav";
import { type Player } from "@/lib/players";
import {
  useClubMatches,
  useClubSquads,
  useClubs,
  useNationalSquads,
  useNationalTeamMatches,
  usePlayers,
} from "@/lib/queries";

export const Route = createFileRoute("/")({ component: LandingPage });

interface Scorer {
  playerId: number;
  goals: number;
  assists: number;
  caps: number;
}

function displayName(p: Player): string {
  return p.knownAs || p.fullName;
}

function LandingPage() {
  const playersQuery = usePlayers();
  const clubsQuery = useClubs();
  const clubMatchesQuery = useClubMatches();
  const nationalMatchesQuery = useNationalTeamMatches();
  const clubSquadsQuery = useClubSquads();
  const nationalSquadsQuery = useNationalSquads();
  const [query, setQuery] = useState("");

  const players = playersQuery.data ?? [];
  const loading = playersQuery.isLoading;
  const failed = playersQuery.isError;

  const scorers = useMemo(() => {
    const table = new Map<number, Scorer>();
    const add = (
      playerId: number,
      goals: number,
      assists: number,
      national: boolean,
    ) => {
      const row = table.get(playerId) ?? {
        playerId,
        goals: 0,
        assists: 0,
        caps: 0,
      };
      row.goals += goals;
      row.assists += assists;
      if (national) row.caps += 1;
      table.set(playerId, row);
    };
    for (const s of clubSquadsQuery.data ?? [])
      add(s.playerId, s.goals, s.assists, false);
    for (const s of nationalSquadsQuery.data ?? [])
      add(s.playerId, s.goals, s.assists, true);
    return [...table.values()];
  }, [clubSquadsQuery.data, nationalSquadsQuery.data]);

  const clubCount = clubsQuery.data?.length ?? 0;
  const matchCount =
    (clubMatchesQuery.data?.length ?? 0) +
    (nationalMatchesQuery.data?.length ?? 0);

  const names = useMemo(() => new Map(players.map((p) => [p.playerId, p])), [players]);

  const topScorers = useMemo(
    () =>
      scorers
        .filter((s) => s.goals > 0)
        .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
        .slice(0, 10),
    [scorers],
  );

  const topProviders = useMemo(
    () =>
      scorers
        .filter((s) => s.assists > 0)
        .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
        .slice(0, 10),
    [scorers],
  );

  const topCaps = useMemo(
    () =>
      scorers
        .filter((s) => s.caps > 0)
        .sort((a, b) => b.caps - a.caps || b.goals - a.goals)
        .slice(0, 10),
    [scorers],
  );

  const latestPlayers = useMemo(
    () =>
      [...players]
        .sort(
          (a, b) =>
            (b.createdAt ?? "").localeCompare(a.createdAt ?? "") ||
            b.playerId - a.playerId,
        )
        .slice(0, 10),
    [players],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return players
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          (p.knownAs ?? "").toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [players, query]);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNav
        sections={[
          { label: "Browse", to: "/data" },
          { label: "Scorers", href: "#top-scorers" },
          { label: "Assists", href: "#top-assists" },
          { label: "Caps", href: "#top-caps" },
          { label: "Latest", href: "#latest" },
        ]}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
        {/* Hero: title + live totals + player search */}
        <section className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div className="flex flex-col gap-5">
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
              Malawian footballers
            </h1>
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading the record…
              </p>
            ) : failed ? (
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                The record is unreachable right now — it may still be getting
                started.
              </p>
            ) : (
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {players.length}
                </span>{" "}
                players ·{" "}
                <span className="font-semibold text-foreground">
                  {clubCount}
                </span>{" "}
                clubs ·{" "}
                <span className="font-semibold text-foreground">
                  {matchCount}
                </span>{" "}
                matches on the record — from Super League regulars to youth
                and women&apos;s internationals.
              </p>
            )}
            <div className="relative max-w-xl">
              <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("");
                }}
                placeholder="Search for a player"
                aria-label="Search for a player"
                aria-expanded={results.length > 0}
                role="combobox"
                aria-controls="player-search-results"
                className="pl-9"
              />
              {results.length > 0 && (
                <ul
                  id="player-search-results"
                  role="listbox"
                  className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-card p-1 shadow-md"
                >  {results.map((p) => (
                    <li key={p.playerId}>
                      <Link
                        to="/data/players/$playerId"
                        params={{ playerId: String(p.playerId) }}
                        className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="font-medium">{displayName(p)}</span>
                        <span className="text-xs text-muted-foreground">
                          {[p.positionPrimary, p.status]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      to="/data/players"
                      className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Browse all players
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Contribute card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Spotted a gap?</p>
              <Badge variant="secondary">sourced</Badge>
            </div>
            <Separator className="my-4" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Shine grows one sourced fact at a time. If you can name a
              player, a club spell, or a squad — and point to where you saw
              it — you can help keep the record honest.
            </p>
            <Button
              className="mt-4"
              nativeButton={false}
              render={<Link to="/manage" />}
            >
              Contribute
              <ArrowRightIcon />
            </Button>
          </div>
        </section>

        {/* Leaderboards */}
        {!loading && !failed && (
          <section className="grid gap-4 md:grid-cols-2">
            <div id="top-scorers" className="scroll-mt-20">
            <Leaderboard
              title="Top scorers"
              icon={<TrophyIcon className="size-4 text-muted-foreground" />}
              rows={topScorers}
              names={names}
              value={(s) => `${s.goals}`}
              unit="goals"
              empty="No goals recorded yet."
            />
            </div>
            <div id="top-assists" className="scroll-mt-20">
            <Leaderboard
              title="Top providers"
              rows={topProviders}
              names={names}
              value={(s) => `${s.assists}`}
              unit="assists"
              empty="No assists recorded yet."
            />
            </div>
            <div id="top-caps" className="scroll-mt-20">
            <Leaderboard
              title="Most national caps"
              rows={topCaps}
              names={names}
              value={(s) => `${s.caps}`}
              unit="caps"
              empty="No national appearances recorded yet."
            />
            </div>
            <div id="latest" className="scroll-mt-20">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Latest players added
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestPlayers.length === 0 ? (
                  <Empty text="No players recorded yet." />
                ) : (
                  <ol className="flex flex-col">
                    {latestPlayers.map((p) => (
                      <li
                        key={p.playerId}
                        className="flex items-center justify-between gap-2 border-t border-border py-2 text-sm last:border-b"
                      >
                        <span className="font-medium">{displayName(p)}</span>
                        <span className="text-xs text-muted-foreground">
                          {[p.positionPrimary, p.nationality]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
            </div>
          </section>
        )}

        {/* About strip */}
        <section className="flex flex-col items-start gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:px-10">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            Source-backed, not authoritative.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed opacity-90">
            Every entry names its source. Corrections with a cited source are
            part of the workflow — not an official registry, a live score
            service, or a scouting platform.
          </p>
          <Button
            variant="secondary"
            size="lg"
            nativeButton={false}
            render={<Link to="/about" />}
          >
            How the record works
            <ArrowRightIcon />
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Shine — a structured record of Malawian football players.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="link"
              nativeButton={false}
              render={<Link to="/about" />}
            >
              About
            </Button>
            <Button
              variant="link"
              nativeButton={false}
              render={<Link to="/manage" />}
            >
              Contribute
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Leaderboard({
  title,
  icon,
  rows,
  names,
  value,
  unit,
  empty,
}: {
  title: string;
  icon?: React.ReactNode;
  rows: Scorer[];
  names: Map<number, Player>;
  value: (s: Scorer) => string;
  unit: string;
  empty: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <Empty text={empty} />
        ) : (
          <ol className="flex flex-col">
            <li className="flex items-center justify-between gap-2 pb-1 text-xs text-muted-foreground">
              <span>Player</span>
              <span>{unit}</span>
            </li>
            {rows.map((s, i) => (
              <li
                key={s.playerId}
                className="flex items-center justify-between gap-2 border-t border-border py-2 text-sm last:border-b"
              >
                <span className="flex items-baseline gap-2">
                  <span className="w-5 text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="font-medium">
                    {names.get(s.playerId)
                      ? displayName(names.get(s.playerId)!)
                      : "Unknown player"}
                  </span>
                </span>
                <span className="font-semibold">{value(s)}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground">{text}</p>;
}
