import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchBox } from "@/components/search-box";
import { Separator } from "@/components/ui/separator";
import { SiteNav } from "@/components/site-nav";
import { formatMatchDate } from "@/lib/dates";
import { positionLabel } from "@/lib/positions";
import {
  useClubMatches,
  useClubs,
  useNationalTeamMatches,
  usePlayers,
  useSpotlight,
} from "@/lib/queries";
import type {
  SpotlightMatch,
  SpotlightPlayer,
  SpotlightTeam,
  SpotlightTeamMatch,
} from "@/lib/spotlight";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  const playersQuery = usePlayers();
  const clubsQuery = useClubs();
  const clubMatchesQuery = useClubMatches();
  const nationalMatchesQuery = useNationalTeamMatches();

  const players = playersQuery.data ?? [];
  const loading = playersQuery.isLoading;
  const failed = playersQuery.isError;

  const clubCount = clubsQuery.data?.length ?? 0;
  const matchCount =
    (clubMatchesQuery.data?.length ?? 0) +
    (nationalMatchesQuery.data?.length ?? 0);

  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNav
        sections={[
          { label: "Browse", to: "/data" },
          { label: "Spotlight", href: "#spotlight" },
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
            <SearchBox
              aria-label="Search players, clubs, teams and matches"
              className="max-w-xl"
            />
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

        {/* Spotlight: one player and one team, rotating daily */}
        <SpotlightSection />

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

function SpotlightSection() {
  const spotlight = useSpotlight();

  // The section stays quiet while loading or when the record is empty —
  // the hero and search carry the page on their own.
  if (spotlight.isPending) return <SpotlightSkeleton />;
  if (spotlight.isError) return null;
  const { player, team } = spotlight.data;
  if (!player && !team) return null;

  return (
    <section id="spotlight" className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
          Spotlight
        </h2>
        <p className="text-sm text-muted-foreground">
          A different player and team each day — straight from the record.
        </p>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-5">
        {player && (
          <SpotlightPlayerCard
            player={player}
            className={team ? "lg:col-span-3" : "lg:col-span-5"}
          />
        )}
        {team && (
          <SpotlightTeamCard
            team={team}
            className={player ? "lg:col-span-2" : "lg:col-span-5"}
          />
        )}
      </div>
    </section>
  );
}

function SpotlightPlayerCard({
  player,
  className,
}: {
  player: SpotlightPlayer;
  className?: string;
}) {
  const { record } = player;
  const hasRecord =
    record.clubAppearances > 0 || record.nationalAppearances > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Monogram name={player.name} />
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{player.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {[
                positionLabel(player.positionPrimary),
                player.currentClub,
                player.nationalTeam,
                ageFrom(player.dateOfBirth) !== null
                  ? `${ageFrom(player.dateOfBirth)} yrs`
                  : null,
              ]
                .filter((x) => x && x !== "—")
                .join(" · ")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {hasRecord ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <Stat value={record.clubAppearances} label="Club apps" />
            <Stat value={record.clubGoals} label="Club goals" />
            <Stat value={record.clubAssists} label="Club assists" />
            <Stat value={record.nationalAppearances} label="Caps" />
            <Stat value={record.nationalGoals} label="NT goals" />
            <Stat value={record.nationalAssists} label="NT assists" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Their first recorded match is still to come — the record grows one
            sourced fact at a time.
          </p>
        )}

        {player.recentMatches.length > 0 && (
          <ol className="flex flex-col">
            {player.recentMatches.map((m) => (
              <PlayerMatchRow key={`${m.kind}-${m.matchId}`} match={m} />
            ))}
          </ol>
        )}

        <Button
          variant="outline"
          className="self-start"
          nativeButton={false}
          render={
            <Link
              to="/data/players/$playerId"
              params={{ playerId: String(player.playerId) }}
            />
          }
        >
          View profile
          <ArrowRightIcon />
        </Button>
      </CardContent>
    </Card>
  );
}

function PlayerMatchRow({ match: m }: { match: SpotlightMatch }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-border py-2 text-sm first:border-t-0">
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatMatchDate(m.date)}
        </span>
        <span className="truncate font-medium">{m.label}</span>
      </span>
      <span className="text-xs text-muted-foreground">
        {participation(m)}
      </span>
    </li>
  );
}

/** "Starter · 90' · 1 goal · (c)" — the player's own line in that match. */
function participation(m: SpotlightMatch): string {
  const bits: string[] = [];
  if (m.lineupStatus) bits.push(LINEUP_LABELS[m.lineupStatus] ?? m.lineupStatus);
  if (m.minutesPlayed != null) bits.push(`${m.minutesPlayed}’`);
  if (m.goals > 0) bits.push(m.goals === 1 ? "1 goal" : `${m.goals} goals`);
  if (m.assists > 0)
    bits.push(m.assists === 1 ? "1 assist" : `${m.assists} assists`);
  if (m.captain) bits.push("(c)");
  return bits.join(" · ") || "—";
}

const LINEUP_LABELS: Record<string, string> = {
  starter: "Starter",
  substitute: "Sub",
  matchday_squad: "Matchday squad",
  unused_sub: "Unused sub",
  reserve: "Reserve",
  suspended: "Suspended",
  injured: "Injured",
};

function SpotlightTeamCard({
  team,
  className,
}: {
  team: SpotlightTeam;
  className?: string;
}) {
  const teamHref =
    team.kind === "club"
      ? `/data/clubs/${team.id}`
      : `/data/national-teams/${team.id}`;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Monogram name={team.name} />
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{team.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {[team.subtitle].filter((x) => x).join(" · ") ||
                (team.kind === "club" ? "Club" : "National team")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {[
            team.coach ? `Coach: ${team.coach}` : null,
            team.kind === "club"
              ? `${team.squadSize} in the current squad`
              : `${team.squadSize} players recorded`,
          ]
            .filter((x) => x)
            .join(" · ")}
        </p>

        {team.recentMatches.length > 0 ? (
          <ol className="flex flex-col">
            {team.recentMatches.map((m) => (
              <TeamMatchRow key={`${m.kind}-${m.matchId}`} match={m} />
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recorded matches yet.
          </p>
        )}

        <Button
          variant="outline"
          className="self-start"
          nativeButton={false}
          render={<Link to={teamHref} />}
        >
          View team
          <ArrowRightIcon />
        </Button>
      </CardContent>
    </Card>
  );
}

function TeamMatchRow({ match: m }: { match: SpotlightTeamMatch }) {
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-t border-border py-2 text-sm first:border-t-0">
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatMatchDate(m.date)}
        </span>
        <span className="truncate font-medium">{m.label}</span>
      </span>
      {m.result && (
        <span
          className={`text-xs font-semibold ${
            m.result === "W"
              ? "text-emerald-600 dark:text-emerald-400"
              : m.result === "L"
                ? "text-red-600 dark:text-red-400"
                : "text-muted-foreground"
          }`}
        >
          {m.result}
        </span>
      )}
    </li>
  );
}

function SpotlightSkeleton() {
  return (
    <section id="spotlight" aria-hidden className="scroll-mt-20">
      <div className="mb-4 h-8 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="grid items-start gap-4 lg:grid-cols-5">
        <div className="h-64 animate-pulse rounded-2xl bg-muted lg:col-span-3" />
        <div className="h-64 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
      </div>
    </section>
  );
}

function Monogram({ name }: { name: string }) {
  const initials = useMemo(
    () =>
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join(""),
    [name],
  );
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-semibold text-primary select-none">
      {initials}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-lg bg-muted/50 px-2 py-2 text-center">
      <span className="text-xl leading-none font-semibold">{value}</span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function ageFrom(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null;
  const [y, m, d] = dateOfBirth.split("-").map(Number);
  if (!y || !m || !d) return null;
  const today = new Date();
  const age =
    today.getFullYear() - y - (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d) ? 1 : 0);
  return age >= 0 && age < 120 ? age : null;
}
