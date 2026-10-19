import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Field } from "@/components/data-ui";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { TeamTabs } from "@/components/section-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { NationalTeamSort } from "@/lib/nationalTeams";
import {
  useNationalTeamFilterOptions,
  useNationalTeamPage,
} from "@/lib/queries";
import type { SortOrder } from "@/lib/sorting";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/national-teams/")({
  component: NationalTeamsListPage,
});

const PAGE_SIZE = 25;
const ALL = "all";

const SORT_OPTIONS: {
  value: string;
  label: string;
  sort: NationalTeamSort;
  order: SortOrder;
}[] = [
  { value: "name:asc", label: "Name A–Z", sort: "name", order: "asc" },
  { value: "name:desc", label: "Name Z–A", sort: "name", order: "desc" },
  {
    value: "country:asc",
    label: "Country A–Z",
    sort: "country",
    order: "asc",
  },
  { value: "level:asc", label: "Level", sort: "level", order: "asc" },
  {
    value: "createdAt:desc",
    label: "Recently added",
    sort: "createdAt",
    order: "desc",
  },
];

const DEFAULT_SORT = SORT_OPTIONS[0].value;

function NationalTeamsListPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState("");
  const [level, setLevel] = useState("");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const { data, isLoading, error } = useNationalTeamPage({
    q: debouncedQuery || undefined,
    country: country || undefined,
    gender: gender || undefined,
    level: level || undefined,
    sort: sort.sort,
    order: sort.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: filterOptions } = useNationalTeamFilterOptions();

  const teams = data?.items ?? [];
  const hasFilters = Boolean(debouncedQuery || country || gender || level);

  return (
    <div className="flex flex-col gap-4">
      <TeamTabs />

      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        National teams
      </h1>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="national-team-search">
          <ListSearch
            id="national-team-search"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search teams"
            aria-label="Search national teams"
            className="w-64"
          />
        </Field>
        <Field label="Country" htmlFor="national-team-country">
          <Select
            value={country || ALL}
            onValueChange={(value) => {
              setCountry(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="national-team-country" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All countries</SelectItem>
              {(filterOptions?.countries ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Gender" htmlFor="national-team-gender">
          <Select
            value={gender || ALL}
            onValueChange={(value) => {
              setGender(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="national-team-gender" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All genders</SelectItem>
              {(filterOptions?.genders ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Level" htmlFor="national-team-level">
          <Select
            value={level || ALL}
            onValueChange={(value) => {
              setLevel(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="national-team-level" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All levels</SelectItem>
              {(filterOptions?.levels ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sort by" htmlFor="national-team-sort">
          <Select
            value={sortValue}
            onValueChange={(value) => {
              setSortValue(value ?? DEFAULT_SORT);
              setPage(1);
            }}
          >
            <SelectTrigger id="national-team-sort" className="min-w-40">
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
      ) : teams.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "No national teams match those filters."
            : "No national teams recorded yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {teams.map((t) => (
              <li
                key={t.nationalTeamId}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  to="/data/national-teams/$nationalTeamId"
                  params={{ nationalTeamId: String(t.nationalTeamId) }}
                  className="flex items-center justify-between gap-3 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{t.name}</span>
                    {t.nickname && (
                      <span className="truncate text-xs text-muted-foreground">
                        {t.nickname}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right text-xs text-muted-foreground">
                    {[
                      t.country,
                      t.gender,
                      t.level && t.level !== "senior" ? t.level : null,
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
