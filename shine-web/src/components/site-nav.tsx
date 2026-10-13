import { Link } from "@tanstack/react-router";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export interface SectionLink {
  label: string;
  /** In-page anchor (e.g. "#top-scorers"). */
  href?: string;
  /** App route (e.g. "/data/players"). Prefer over href for routes. */
  to?: string;
}

export function SiteNav({ sections }: { sections: SectionLink[] }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Shine home"
          >
            <LogoMark />
            <span className="font-heading text-xl font-semibold tracking-tight">
              Shine
            </span>
          </Link>
          <nav
            aria-label="Sections"
            className="hidden items-center gap-1 lg:flex"
          >
            {sections.map((s) => (
              <Button
                key={(s.to ?? s.href ?? "") + s.label}
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={
                  s.to ? <Link to={s.to} /> : <a href={s.href ?? "#"} />
                }
              >
                {s.label}
              </Button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link to="/about" />}
          >
            About
          </Button>
          <Button nativeButton={false} render={<Link to="/manage" />}>
            Contribute
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </header>
  );
}
