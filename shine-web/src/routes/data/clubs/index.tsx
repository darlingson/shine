import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Field } from "@/components/data-ui";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { TeamTabs } from "@/components/section-tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import type { ClubSort, SortOrder } from "@/lib/clubs";
import { useClubFilterOptions, useClubPage } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/clubs/")({
  component: ClubsListPage,
});

const PAGE_SIZE = 25;
const ALL = "all";

const SORT_OPTIONS: {
  value: string;
  label: string;
  sort: ClubSort;
  order: SortOrder;
}[] = [
  { value: "name:asc", label: "Name A–Z", sort: "name", order: "asc" },
  { value: "name:desc", label: "Name Z–A", sort: "name", order: "desc" },
  { value: "city:asc", label: "City A–Z", sort: "city", order: "asc" },
  {
    value: "foundedYear:desc",
    label: "Newest founded",
    sort: "foundedYear",
    order: "desc",
  },
  {
    value: "foundedYear:asc",
    label: "Oldest founded",
    sort: "foundedYear",
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

function ClubsListPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [foundedFrom, setFoundedFrom] = useState("");
  const [foundedTo, setFoundedTo] = useState("");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const { data, isLoading, error } = useClubPage({
    q: debouncedQuery || undefined,
    city: city || undefined,
    country: country || undefined,
    foundedFrom: foundedFrom === "" ? undefined : Number(foundedFrom),
    foundedTo: foundedTo === "" ? undefined : Number(foundedTo),
    sort: sort.sort,
    order: sort.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: filterOptions } = useClubFilterOptions();

  const clubs = data?.items ?? [];
  const hasFilters = Boolean(
    debouncedQuery || city || country || foundedFrom || foundedTo,
  );

  return (
    <div className="flex flex-col gap-4">
      <TeamTabs />

      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Clubs
      </h1>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="club-search">
          <ListSearch
            id="club-search"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search clubs"
            aria-label="Search clubs"
            className="w-64"
          />
        </Field>
        <Field label="City" htmlFor="club-city">
          <Select
            value={city || ALL}
            onValueChange={(value) => {
              setCity(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="club-city" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All cities</SelectItem>
              {(filterOptions?.cities ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Country" htmlFor="club-country">
          <Select
            value={country || ALL}
            onValueChange={(value) => {
              setCountry(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="club-country" className="min-w-40">
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
        <Field label="Founded between" htmlFor="club-founded-from">
          <div className="flex items-center gap-1.5">
            <Input
              id="club-founded-from"
              type="number"
              min={1800}
              max={2100}
              value={foundedFrom}
              onChange={(e) => {
                setFoundedFrom(e.target.value);
                setPage(1);
              }}
              placeholder="From"
              aria-label="Founded from"
              className="w-28"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              min={1800}
              max={2100}
              value={foundedTo}
              onChange={(e) => {
                setFoundedTo(e.target.value);
                setPage(1);
              }}
              placeholder="To"
              aria-label="Founded to"
              className="w-24"
            />
          </div>
        </Field>
        <Field label="Sort by" htmlFor="club-sort">
          <Select
            value={sortValue}
            onValueChange={(value) => {
              setSortValue(value ?? DEFAULT_SORT);
              setPage(1);
            }}
          >
            <SelectTrigger id="club-sort" className="min-w-40">
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
      ) : clubs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "No clubs match those filters."
            : "No clubs recorded yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {clubs.map((c) => (
              <li
                key={c.clubId}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  to="/data/clubs/$clubId"
                  params={{ clubId: String(c.clubId) }}
                  className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {[
                      c.city,
                      c.country,
                      c.foundedYear ? `est. ${c.foundedYear}` : null,
                    ]
                      .filter(Boolean)
                      .join(", ")}
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
