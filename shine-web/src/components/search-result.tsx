import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/lib/search";

interface SearchResultLinkProps {
  result: SearchResult;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

/**
 * Wraps a result in a link to its public page. Typed per kind rather than built from a
 * path string, so TanStack Router can check the route and params.
 */
export function SearchResultLink({
  result,
  className,
  onClick,
  children,
}: SearchResultLinkProps) {
  switch (result.kind) {
    case "player":
      return (
        <Link
          to="/data/players/$playerId"
          params={{ playerId: String(result.id) }}
          className={className}
          onClick={onClick}
        >
          {children}
        </Link>
      );
    case "club":
      return (
        <Link
          to="/data/clubs/$clubId"
          params={{ clubId: String(result.id) }}
          className={className}
          onClick={onClick}
        >
          {children}
        </Link>
      );
    case "clubMatch":
      return (
        <Link
          to="/data/matches/club/$matchId"
          params={{ matchId: String(result.id) }}
          className={className}
          onClick={onClick}
        >
          {children}
        </Link>
      );
    case "nationalTeamMatch":
      return (
        <Link
          to="/data/matches/national/$matchId"
          params={{ matchId: String(result.id) }}
          className={className}
          onClick={onClick}
        >
          {children}
        </Link>
      );
    default:
      return <span className={className}>{children}</span>;
  }
}

export function SearchResultRow({
  result,
  onClick,
  className,
}: {
  result: SearchResult;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <SearchResultLink
      result={result}
      onClick={onClick}
      className={[
        "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none",
        "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
        className ?? "",
      ].join(" ")}
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-medium">{result.title}</span>
        {result.subtitle ? (
          <span className="truncate text-xs text-muted-foreground">
            {result.subtitle}
          </span>
        ) : null}
      </span>
      {result.badge ? (
        <Badge variant="secondary" className="shrink-0">
          {result.badge}
        </Badge>
      ) : null}
    </SearchResultLink>
  );
}