import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Field } from "@/components/data-ui";
import { ListSearch } from "@/components/list-search";
import { Pagination } from "@/components/pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/use-debounce";
import {
  PLAYER_FEET,
  PLAYER_STATUSES,
  type PlayerSort,
} from "@/lib/players";
import { usePlayerFilterOptions, usePlayerPage } from "@/lib/queries";
import type { SortOrder } from "@/lib/sorting";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/players/")({
  component: PlayersListPage,
});

const PAGE_SIZE = 25;
const ALL = "all";

const SORT_OPTIONS: {
  value: string;
  label: string;
  sort: PlayerSort;
  order: SortOrder;
}[] = [
  { value: "name:asc", label: "Name A–Z", sort: "name", order: "asc" },
  { value: "name:desc", label: "Name Z–A", sort: "name", order: "desc" },
  {
    value: "dateOfBirth:desc",
    label: "Youngest first",
    sort: "dateOfBirth",
    order: "desc",
  },
  {
    value: "dateOfBirth:asc",
    label: "Oldest first",
    sort: "dateOfBirth",
    order: "asc",
  },
  {
    value: "heightCm:desc",
    label: "Tallest first",
    sort: "heightCm",
    order: "desc",
  },
  {
    value: "createdAt:desc",
    label: "Recently added",
    sort: "createdAt",
    order: "desc",
  },
];

const DEFAULT_SORT = SORT_OPTIONS[0].value;

function PlayersListPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [status, setStatus] = useState("");
  const [foot, setFoot] = useState("");
  const [nationality, setNationality] = useState("");
  const [position, setPosition] = useState("");
  const [bornFrom, setBornFrom] = useState("");
  const [bornTo, setBornTo] = useState("");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

  const { data, isLoading, error } = usePlayerPage({
    q: debouncedQuery || undefined,
    status: status || undefined,
    foot: foot || undefined,
    nationality: nationality || undefined,
    position: position || undefined,
    bornFrom: bornFrom === "" ? undefined : Number(bornFrom),
    bornTo: bornTo === "" ? undefined : Number(bornTo),
    sort: sort.sort,
    order: sort.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: filterOptions } = usePlayerFilterOptions();

  const players = data?.items ?? [];
  const hasFilters = Boolean(
    debouncedQuery ||
      status ||
      foot ||
      nationality ||
      position ||
      bornFrom ||
      bornTo,
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Players
      </h1>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="player-search">
          <ListSearch
            id="player-search"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search players"
            aria-label="Search players"
            className="w-64"
          />
        </Field>
        <Field label="Status" htmlFor="player-status">
          <Select
            value={status || ALL}
            onValueChange={(value) => {
              setStatus(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="player-status" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {PLAYER_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Preferred foot" htmlFor="player-foot">
          <Select
            value={foot || ALL}
            onValueChange={(value) => {
              setFoot(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="player-foot" className="min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All feet</SelectItem>
              {PLAYER_FEET.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Nationality" htmlFor="player-nationality">
          <Select
            value={nationality || ALL}
            onValueChange={(value) => {
              setNationality(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="player-nationality" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All nationalities</SelectItem>
              {(filterOptions?.nationalities ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Position" htmlFor="player-position">
          <Select
            value={position || ALL}
            onValueChange={(value) => {
              setPosition(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="player-position" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All positions</SelectItem>
              {(filterOptions?.positions ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Born between" htmlFor="player-born-from">
          <div className="flex items-center gap-1.5">
            <Input
              id="player-born-from"
              type="number"
              min={1900}
              max={2100}
              value={bornFrom}
              onChange={(e) => {
                setBornFrom(e.target.value);
                setPage(1);
              }}
              placeholder="From"
              aria-label="Born from"
              className="w-28"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <Input
              type="number"
              min={1900}
              max={2100}
              value={bornTo}
              onChange={(e) => {
                setBornTo(e.target.value);
                setPage(1);
              }}
              placeholder="To"
              aria-label="Born to"
              className="w-24"
            />
          </div>
        </Field>
        <Field label="Sort by" htmlFor="player-sort">
          <Select
            value={sortValue}
            onValueChange={(value) => {
              setSortValue(value ?? DEFAULT_SORT);
              setPage(1);
            }}
          >
            <SelectTrigger id="player-sort" className="min-w-40">
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
      ) : players.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "No players match those filters."
            : "No players recorded yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {players.map((p) => (
              <li
                key={p.playerId}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  to="/data/players/$playerId"
                  params={{ playerId: String(p.playerId) }}
                  className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">
                    {p.knownAs || p.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[p.positionPrimary, p.status].filter(Boolean).join(" · ")}
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
