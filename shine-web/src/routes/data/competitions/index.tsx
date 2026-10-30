import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Field } from "@/components/data-ui";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { CompetitionSort } from "@/lib/competitions";
import {
  useCompetitionFilterOptions,
  useCompetitionPage,
} from "@/lib/queries";
import type { SortOrder } from "@/lib/sorting";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/competitions/")({
  component: CompetitionsListPage,
});

const PAGE_SIZE = 25;
const ALL = "all";

const SORT_OPTIONS: {
  value: string;
  label: string;
  sort: CompetitionSort;
  order: SortOrder;
}[] = [
  { value: "name:asc", label: "Name A–Z", sort: "name", order: "asc" },
  { value: "name:desc", label: "Name Z–A", sort: "name", order: "desc" },
  { value: "tier:asc", label: "Tier (top first)", sort: "tier", order: "asc" },
  {
    value: "createdAt:desc",
    label: "Recently added",
    sort: "createdAt",
    order: "desc",
  },
];

const DEFAULT_SORT = SORT_OPTIONS[0].value;

function CompetitionsListPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [kind, setKind] = useState("");
  const [scope, setScope] = useState("");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const { data, isLoading, error } = useCompetitionPage({
    q: debouncedQuery || undefined,
    kind: kind || undefined,
    scope: scope || undefined,
    sort: sort.sort,
    order: sort.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: filterOptions } = useCompetitionFilterOptions();

  const competitions = data?.items ?? [];
  const hasFilters = Boolean(debouncedQuery || kind || scope);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Competitions
        </h1>
        <p className="text-sm text-muted-foreground">
          Leagues and cups matches attach to — with the seasons each edition
          was played under.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="competition-search">
          <ListSearch
            id="competition-search"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search competitions"
            aria-label="Search competitions"
            className="w-64"
          />
        </Field>
        <Field label="Kind" htmlFor="competition-kind">
          <Select
            value={kind || ALL}
            onValueChange={(value) => {
              setKind(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="competition-kind" className="min-w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All kinds</SelectItem>
              {(filterOptions?.kinds ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Scope" htmlFor="competition-scope">
          <Select
            value={scope || ALL}
            onValueChange={(value) => {
              setScope(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="competition-scope" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All scopes</SelectItem>
              {(filterOptions?.scopes ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sort by" htmlFor="competition-sort">
          <Select
            value={sortValue}
            onValueChange={(value) => {
              setSortValue(value ?? DEFAULT_SORT);
              setPage(1);
            }}
          >
            <SelectTrigger id="competition-sort" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">{parseApiError(error)}</p>
      ) : competitions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "No competitions match those filters."
            : "No competitions registered yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {competitions.map((c) => (
              <li
                key={c.competitionId}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  to="/data/competitions/$competitionId"
                  params={{ competitionId: String(c.competitionId) }}
                  className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">
                    {c.name}
                    {c.shortName && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {c.shortName}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[
                      c.kind === "league" && c.tier != null
                        ? `tier ${c.tier}`
                        : c.kind,
                      [c.scope, c.region].filter(Boolean).join(" "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            page={data!.page}
            pageSize={data!.pageSize}
            total={data!.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
