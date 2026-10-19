import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/data")({ component: DataLayout });

function DataLayout() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <SiteNav
        sections={[
          { label: "Players", to: "/data/players" },
          { label: "Teams", to: "/data/clubs" },
          { label: "Matches", to: "/data/matches/club" },
        ]}
      />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
          <p className="text-sm text-muted-foreground">
            Shine — a structured record of Malawian football players.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>App by Darlingson</span>
            <a href="https://darlingson-dev.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Portfolio</a>
            <a href="https://instagram.com/darlingson_m" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Instagram</a>
            <a href="https://t.me/darlingson_m" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Telegram</a>
            <a href="https://github.com/darlingson" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
