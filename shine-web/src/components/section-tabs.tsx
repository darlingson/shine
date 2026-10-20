import { Link, useMatchRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

type TabTo =
  | "/data/clubs"
  | "/data/national-teams"
  | "/data/matches/club"
  | "/data/matches/national";

const TAB_CLASS =
  "rounded-full px-3 py-1 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";
const ACTIVE_CLASS = "bg-background text-foreground shadow-sm";

function Tab({ to, label }: { to: TabTo; label: string }) {
  const matchRoute = useMatchRoute();
  const active = Boolean(matchRoute({ to, fuzzy: false }));
  return (
    <Link
      to={to}
      aria-current={active ? "page" : undefined}
      className={`${TAB_CLASS} ${active ? ACTIVE_CLASS : ""}`}
    >
      {label}
    </Link>
  );
}

function Tabs({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
      {children}
    </div>
  );
}

/** Clubs / national teams switch shown above both team lists. */
export function TeamTabs() {
  return (
    <Tabs>
      <Tab to="/data/clubs" label="Clubs" />
      <Tab to="/data/national-teams" label="National teams" />
    </Tabs>
  );
}

/** Club / national switch shown above both match lists. */
export function MatchTabs() {
  return (
    <Tabs>
      <Tab to="/data/matches/club" label="Club" />
      <Tab to="/data/matches/national" label="National" />
    </Tabs>
  );
}
