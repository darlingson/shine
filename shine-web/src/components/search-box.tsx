import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { SearchResultRow } from "@/components/search-result";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  PUBLIC_SEARCH_KINDS,
  SEARCH_MIN_LENGTH,
  type SearchKind,
} from "@/lib/search";
import { useSearch } from "@/lib/queries";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  "aria-label": string;
  placeholder?: string;
  className?: string;
  limit?: number;
  kinds?: readonly SearchKind[];
  /** Must be unique if more than one SearchBox is mounted. */
  id?: string;
}

/**
 * Cross-entity search with a live results dropdown. Enter (or the footer link) opens the
 * full results page so a search is shareable.
 */
export function SearchBox({
  "aria-label": ariaLabel,
  placeholder = "Search players, clubs and matches",
  className,
  limit = 8,
  kinds = PUBLIC_SEARCH_KINDS,
  id = "search-box-results",
}: SearchBoxProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const term = query.trim();
  const { data } = useSearch(useDebouncedValue(term, 250), { kinds, limit });
  const results = term.length >= SEARCH_MIN_LENGTH ? (data?.results ?? []) : [];
  const open = results.length > 0;

  function openAllResults() {
    if (term.length < SEARCH_MIN_LENGTH) return;
    setQuery("");
    navigate({ to: "/data/search", search: { q: term } });
  }

  return (
    <div className={cn("relative", className)}>
      <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setQuery("");
          if (e.key === "Enter") {
            e.preventDefault();
            openAllResults();
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-expanded={open}
        role="combobox"
        aria-controls={id}
        className="pl-9"
      />
      {open && (
        <ul
          id={id}
          role="listbox"
          className="absolute z-10 mt-2 w-full rounded-xl border border-border bg-card p-1 shadow-md"
        >
          {results.map((r) => (
            <li key={`${r.kind}-${r.id}`}>
              <SearchResultRow result={r} onClick={() => setQuery("")} />
            </li>
          ))}
          <li>
            <Link
              to="/data/search"
              search={{ q: term }}
              onClick={() => setQuery("")}
              className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-primary outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all results for “{term}”
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}