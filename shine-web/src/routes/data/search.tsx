import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { SearchResultRow } from "@/components/search-result";
import {
  PUBLIC_SEARCH_KINDS,
  SEARCH_KIND_LABELS,
  SEARCH_MIN_LENGTH,
} from "@/lib/search";
import { useSearch } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/search")({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchResultsPage,
});

function SearchResultsPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  // `null` means the box follows the URL; a string is the user's pending edit.
  const [draft, setDraft] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef(0);
  const input = draft ?? q;
  const term = q.trim();
  const enabled = term.length >= SEARCH_MIN_LENGTH;

  const { data, isLoading, error } = useSearch(term, {
    kinds: PUBLIC_SEARCH_KINDS,
    limit: 50,
  });

  useEffect(() => {
    // A Back/Forward move wins over an edit still waiting to be committed.
    const onPopState = () => {
      pending.current += 1;
      window.clearTimeout(timer.current);
      setDraft(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // Debounce edits into the URL so a search stays shareable. Once committed the
  // box follows `q` again, which keeps Back/Forward in step with the input.
  function change(value: string) {
    const token = ++pending.current;
    setDraft(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void navigate({
        to: "/data/search",
        search: { q: value.trim() },
        replace: true,
      }).finally(() => {
        if (pending.current === token) setDraft(null);
      });
    }, 300);
  }

  const results = data?.results ?? [];
  const groups = PUBLIC_SEARCH_KINDS.map((kind) => ({
    kind,
    items: results.filter((r) => r.kind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Search
        </h1>
        <div className="relative max-w-xl">
          <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={input}
            onChange={(e) => change(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") change("");
            }}
            placeholder="Search players, clubs, teams and matches"
            aria-label="Search the record"
            className="pl-9"
            autoFocus
          />
        </div>
      </div>

      {!enabled ? (
        <p className="text-sm text-muted-foreground">
          Type at least {SEARCH_MIN_LENGTH} characters to search.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Searching…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No matches for “{term}”.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.kind} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                {SEARCH_KIND_LABELS[group.kind]}
              </h2>
              <ul className="flex flex-col rounded-2xl border border-border bg-card p-1">
                {group.items.map((r) => (
                  <li key={`${r.kind}-${r.id}`}>
                    <SearchResultRow result={r} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}