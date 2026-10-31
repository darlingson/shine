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
import type { StaffMemberSort } from "@/lib/staff";
import {
  useStaffMemberFilterOptions,
  useStaffMemberPage,
} from "@/lib/queries";
import type { SortOrder } from "@/lib/sorting";
import { parseApiError } from "@/lib/users";

export const Route = createFileRoute("/data/staff/")({
  component: StaffListPage,
});

const PAGE_SIZE = 25;
const ALL = "all";

const SORT_OPTIONS: {
  value: string;
  label: string;
  sort: StaffMemberSort;
  order: SortOrder;
}[] = [
  { value: "name:asc", label: "Name A–Z", sort: "name", order: "asc" },
  { value: "name:desc", label: "Name Z–A", sort: "name", order: "desc" },
  {
    value: "createdAt:desc",
    label: "Recently added",
    sort: "createdAt",
    order: "desc",
  },
];

const DEFAULT_SORT = SORT_OPTIONS[0].value;

function StaffListPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [nationality, setNationality] = useState("");
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue) ??
    SORT_OPTIONS[0];

  const { data, isLoading, error } = useStaffMemberPage({
    q: debouncedQuery || undefined,
    nationality: nationality || undefined,
    sort: sort.sort,
    order: sort.order,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: filterOptions } = useStaffMemberFilterOptions();

  const members = data?.items ?? [];
  const hasFilters = Boolean(debouncedQuery || nationality);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Staff
        </h1>
        <p className="text-sm text-muted-foreground">
          Coaches, managers and technical directors — open someone to see the
          teams and roles they have held.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Field label="Search" htmlFor="staff-search">
          <ListSearch
            id="staff-search"
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search staff"
            aria-label="Search staff"
            className="w-64"
          />
        </Field>
        <Field label="Nationality" htmlFor="staff-nationality">
          <Select
            value={nationality || ALL}
            onValueChange={(value) => {
              setNationality(value === ALL ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger id="staff-nationality" className="min-w-40">
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
        <Field label="Sort by" htmlFor="staff-sort">
          <Select
            value={sortValue}
            onValueChange={(value) => {
              setSortValue(value ?? DEFAULT_SORT);
              setPage(1);
            }}
          >
            <SelectTrigger id="staff-sort" className="min-w-40">
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
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "No staff members match those filters."
            : "No staff registered yet."}
        </p>
      ) : (
        <>
          <ul className="flex flex-col rounded-2xl border border-border bg-card">
            {members.map((m) => (
              <li
                key={m.staffMemberId}
                className="border-b border-border last:border-b-0"
              >
                <Link
                  to="/data/staff/$staffMemberId"
                  params={{ staffMemberId: String(m.staffMemberId) }}
                  className="flex items-center justify-between gap-2 px-4 py-3 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="text-sm font-medium">
                    {m.knownAs || m.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {m.nationality}
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
