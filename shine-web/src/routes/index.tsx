import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  DatabaseIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/")({ component: LandingPage });

const LEDGER: Array<{ name: string; what: string }> = [
  {
    name: "Player",
    what: "Identity and basic biography — name, positions, status, and where the fact came from.",
  },
  {
    name: "Club",
    what: "Team registry — names, locations, and founding details.",
  },
  {
    name: "Affiliation",
    what: "Who played for which club, when, and in what capacity — permanent, loan, youth, or trial.",
  },
  {
    name: "Match",
    what: "The event squads attach to — date, competition, teams, score, and venue.",
  },
  {
    name: "Club squad",
    what: "Who featured in a club match — starters, substitutes, minutes, goals, assists, cards, captaincy.",
  },
  {
    name: "National squad",
    what: "The same participation detail for national sides, including youth and women's teams.",
  },
];

const SQUAD_FIELDS = [
  "lineup status",
  "minutes",
  "goals",
  "assists",
  "cards",
  "captaincy",
  "notes",
  "source URL",
];

const READERS = [
  "Sports journalists",
  "Researchers and analysts",
  "Fans and supporter communities",
  "Scouts, agents, and clubs",
  "National team staff",
  "Developers and media makers",
];

function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Masthead */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-xl font-semibold tracking-tight">
              Shine
            </span>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Malawi football player database
            </span>
          </div>
          <Button variant="outline" render={<Link to="/manage" />}>
            Staff sign in
            <ArrowRightIcon />
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-14">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
              Malawian football, on the record.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Player data lives in PDFs, social posts, club records, and
              memory. Shine gathers it into one structured, source-backed
              database — who played for which club, who featured in which
              match — so basic questions finally have one place to go.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link to="/manage" />}>
                Sign in to contribute
                <ArrowRightIcon />
              </Button>
              <Button size="lg" variant="outline" render={<a href="#records" />}>
                How records work
              </Button>
            </div>
          </div>

          {/* Anatomy of a squad record — the one memorable object */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <FileTextIcon className="size-4 text-muted-foreground" />
                Anatomy of a squad record
              </p>
              <Badge variant="secondary">sourced</Badge>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-1.5">
              {SQUAD_FIELDS.map((f) => (
                <Badge key={f} variant="outline">
                  {f}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every entry names its source. Useful even when incomplete —
              readers see what is known, where it came from, and how reliable
              it is.
            </p>
          </div>
        </section>

        {/* Ledger */}
        <section id="records" className="flex scroll-mt-20 flex-col gap-2">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            What gets recorded
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Six linked entities cover players, clubs, matches, and
            participation. Small on purpose — built to grow without redesign.
          </p>
          <dl className="mt-4">
            {LEDGER.map((row) => (
              <div
                key={row.name}
                className="grid gap-1 border-t border-border py-4 last:border-b sm:grid-cols-[12rem_1fr] sm:gap-4"
              >
                <dt className="flex items-center gap-2 text-sm font-medium">
                  <DatabaseIcon className="size-4 text-muted-foreground" />
                  {row.name}
                </dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                  {row.what}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Principles */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheckIcon className="size-4 text-muted-foreground" />
              Source-backed, not authoritative
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Shine is a tool for recording, linking, correcting, and
              retrieving data — not an official registry, a live score
              service, or a scouting platform. Corrections with a cited
              source are part of the workflow.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-medium">Built to be reused</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Search and filter across player, club, match, competition,
              date, and squad role, with export for research, media, and
              open-data projects. Coverage grows incrementally, guided by
              the maintainers.
            </p>
          </div>
        </section>

        {/* Who it's for */}
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-semibold tracking-tight">
            Who it serves
          </h2>
          <ul className="flex flex-wrap gap-1.5">
            {READERS.map((r) => (
              <Badge key={r} variant="secondary" className="px-3 py-1.5">
                {r}
              </Badge>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-start gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:px-10">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            Spotted a gap? Bring a source.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed opacity-90">
            Contributions and corrections keep the record honest. Sign in
            with a staff account to add players, clubs, matches, and squads.
          </p>
          <Button
            variant="secondary"
            size="lg"
            render={<Link to="/manage" />}
          >
            Go to staff sign in
            <ArrowRightIcon />
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Shine — a structured record of Malawian football players.
          </p>
          <Button variant="link" render={<Link to="/manage" />}>
            Staff sign in
          </Button>
        </div>
      </footer>
    </div>
  );
}
