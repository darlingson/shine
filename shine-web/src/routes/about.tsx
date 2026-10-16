import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  DatabaseIcon,
  MagnifyingGlassIcon,
  PencilLineIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/about")({ component: AboutPage });

const LEDGER: Array<{ name: string; what: string }> = [
  {
    name: "Players",
    what: "The footballers — from Super League regulars to youth and women's internationals the global databases skip.",
  },
  {
    name: "Clubs",
    what: "Where they played — domestic sides and beyond, with grounds and founding details.",
  },
  {
    name: "Affiliations",
    what: "Who was where, and when — permanent moves, loans, youth spells, and trials.",
  },
  {
    name: "Matches",
    what: "The fixtures — league ties, cup games, and qualifiers with scores and venues.",
  },
  {
    name: "Club squads",
    what: "Who made the matchday squad — starters, substitutes, goals, assists, cards, and the armband.",
  },
  {
    name: "National squads",
    what: "The Flames and its siblings — senior, youth, and women's call-ups with the same detail.",
  },
];

const QUESTIONS = [
  "Who played for this club, and when?",
  "Was she in the squad that day? Did she start?",
  "How many caps does he actually have?",
  "Who came off the bench in that final?",
];

const READERS = [
  "Sports journalists",
  "Researchers and analysts",
  "Fans and supporter communities",
  "Scouts, agents, and clubs",
  "National team staff",
  "Developers and media makers",
];

function AboutPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNav
        sections={[
          { label: "Questions", href: "#questions" },
          { label: "The record", href: "#records" },
        ]}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-6 py-14">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
              Malawian football, on the record.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Shine is a structured, source-backed record of Malawian players —
              their clubs, their matches, their national team call-ups. Built
              because this history lives in scattered posts, PDFs, and memory,
              and deserves one place to live.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link to="/manage" />}
              >
                <PencilLineIcon />
                Contribute a record
              </Button>
              <a
                href="#questions"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MagnifyingGlassIcon />
                What you can find
              </a>
            </div>
          </div>

          {/* Questions this database answers — the one memorable object */}
          <div
            id="questions"
            className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
                Questions with answers here
              </p>
              <Badge variant="secondary">sourced</Badge>
            </div>
            <Separator className="my-4" />
            <ul className="flex flex-col gap-3">
              {QUESTIONS.map((q) => (
                <li
                  key={q}
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  “{q}”
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every entry names its source — useful even when incomplete.
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

        {/* Contribute CTA */}
        <section className="flex flex-col items-start gap-4 rounded-2xl bg-primary px-6 py-8 text-primary-foreground sm:px-10">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            Know something the record is missing?
          </h2>
          <p className="max-w-xl text-sm leading-relaxed opacity-90">
            Shine grows one sourced fact at a time. If you can name a player,
            a club spell, or a squad — and point to where you saw it — you
            can help keep the record honest.
          </p>
          <Button
            variant="secondary"
            size="lg"
            nativeButton={false}
            render={<Link to="/manage" />}
          >
            Contribute
            <ArrowRightIcon />
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Shine — a structured record of Malawian football players.
          </p>
          <Button
            variant="link"
            nativeButton={false}
            render={<Link to="/manage" />}
          >
            Contribute
          </Button>
        </div>
      </footer>
    </div>
  );
}
