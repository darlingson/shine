import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/data")({ component: DataLayout });

function DataLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNav
        sections={[
          { label: "Players", to: "/data/players" },
          { label: "Clubs", to: "/data/clubs" },
          { label: "Club matches", to: "/data/matches/club" },
          { label: "National matches", to: "/data/matches/national" },
        ]}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-5xl px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Shine — a structured record of Malawian football players.
          </p>
        </div>
      </footer>
    </div>
  );
}
