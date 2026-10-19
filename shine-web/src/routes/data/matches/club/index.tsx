import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Field } from "@/components/data-ui";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { MatchTabs } from "@/components/section-tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import { clubMatchLabel, type ClubMatchSort } from "@/lib/clubMatches";
import {
  useClubMatchFilterOptions,
  useClubMatchPage,
  useClubs,
} from "@/lib/queries";
import type { SortOrder } from "@/lib/sorting";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/matches/club/")({
  component: ClubMatchesListPage,
});

const PAGE_SIZE = 25;
const ALL = "all";

const SORT_OPTIONS: {
  value: string;
  label: string;
  sort: ClubMatchSort;
  order: SortOrder;
}[] = [
  {
    value: "matchDate:desc",
    label: "Newest first",
    sort: "matchDate",
    order: "desc",
  },
  {
    value: "matchDate:asc",
    label: "Oldest first",
    sort: "matchDate",
    order: "asc",
  },
  {
    value: "competition:asc",
    label: "Competition A–Z",
    sort: "competition",
    order: "asc",
  },
  {
    value: "createdAt:desc",
    label: "Recently added",
    sort: "createdAt",
    order: "desc",
  },
];

const DEFAULT_SORT = SORT_OPTIONS[0].value;

function ClubMatchesListPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [clubId, setClubId] = useState("");
  const [competition, setCompetition] = useState("");
  const [season, setSeason] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const { data, isLoading, error } = useClubMatchPage({
    q: debouncedQuery || undefined,
    clubId: clubId === "" ? undefined : Number(clubId),
    competition: competition || undefined,
    season: season || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sort: sort.sort,
    order: sort.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: filterOptions } = useClubMatchFilterOptions();
  const { data: clubs } = useClubs();
  const clubOptions = useMemo(
    () => [...(clubs ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [clubs],
  );

  const matches = data?.items ?? [];
  const hasFilters = Boolean(
    debouncedQuery ||
      clubId ||
      competition ||
      season ||
      dateFrom ||
      dateTo,
  );

  return (
    <div className="flex flex-col gap-4">
      <MatchTabs />

      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Club matches
        </h1>
        <p className="text-sm text-muted-foreground">
          Matches between two clubs.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="club-match-search">
          <ListSearch
            id="club-match-search"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search club matches"
            aria-label="Search club matches"
            className="w-64"
          />
        </Field>
        <Field label="Club" htmlFor="club-match-club">
          <Select
            value={clubId || ALL}
            onValueChange={(value) => {
              setClubId(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="club-match-club" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All clubs</SelectItem>
              {clubOptions.map((club) => (
                <SelectItem key={club.clubId} value={String(club.clubId)}>
                  {club.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Competition" htmlFor="club-match-competition">
          <Select
            value={competition || ALL}
            onValueChange={(value) => {
              setCompetition(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="club-match-competition" className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All competitions</SelectItem>
              {(filterOptions?.competitions ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Season" htmlFor="club-match-season">
          <Select
            value={season || ALL}
            onValueChange={(value) => {
              setSeason(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="club-match-season" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All seasons</SelectItem>
              {(filterOptions?.seasons ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Played between" htmlFor="club-match-date-from">
          <div className="flex items-center gap-1.5">
            <Input
              id="club-match-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              aria-label="Played from"
              className="w-40"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              aria-label="Played to"
              className="w-40"
            />
          </div>
        </Field>
        <Field label="Sort by" htmlFor="club-match-sort">
          <Select
            value={sortValue}
            onValueChange={(value) => {
              setSortValue(value ?? DEFAULT_SORT);
              setPage(1);
            }}
          >
            <SelectTrigger id="club-match-sort" className="min-w-40">
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
      ) : matches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "No matches match those filters."
            : "No matches recorded yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {matches.map((m) => (
              <li
                key={m.matchId}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  to="/data/matches/club/$matchId"
                  params={{ matchId: String(m.matchId) }}
                  className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">
                    {clubMatchLabel(m)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[m.matchDate, m.competition].filter(Boolean).join(" · ")}
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
