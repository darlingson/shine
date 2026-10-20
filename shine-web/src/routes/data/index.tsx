import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/data/")({
  component: DataHubPage,
});

const SECTIONS = [
  { to: "/data/search", title: "Search", blurb: "Find a player, club or match by name." },
  { to: "/data/players", title: "Players", blurb: "Find a player, see their clubs." },
  {
    to: "/data/clubs",
    title: "Teams",
    blurb: "Browse clubs and national teams.",
  },
  {
    to: "/data/matches/club",
    title: "Matches",
    blurb: "Browse club and national team matches.",
  },
] as const;

function DataHubPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Browse the record
      </h1>
      <ul className="grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <li key={s.to}>
            <Link
              to={s.to}
              className="flex h-full flex-col gap-1 rounded-2xl border border-border bg-card p-5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-sm font-medium">{s.title}</span>
              <span className="text-sm text-muted-foreground">{s.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
