import { apiJson, getApiUrl } from "@/lib/api";
import type { SortOrder } from "@/lib/sorting";

export interface Competition {
  competitionId: number;
  name: string;
  shortName?: string | null;

  /** league / cup */
  kind: string;

  /** Pyramid position for leagues — 1 = top flight. Cups stay null. */
  tier?: number | null;

  /** national / regional / continental / international */
  scope?: string | null;
  region?: string | null;
  sourceUrl?: string | null;
}

export interface CompetitionForm {
  name: string;
  shortName?: string;
  kind: string;
  tier?: number;
  scope?: string;
  region?: string;
  sourceUrl?: string;
}

export interface CompetitionSeason {
  seasonId: number;
  competitionId: number;

  /** e.g. "2026", "2025/26" — null while the year is unknown. */
  label?: string | null;

  /** Display name of the edition, sponsor included; falls back to label. */
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  sourceUrl?: string | null;
}

export interface CompetitionSeasonForm {
  label?: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  sourceUrl?: string;
}

export const COMPETITION_KINDS = ["league", "cup"];
export const COMPETITION_SCOPES = [
  "national",
  "regional",
  "continental",
  "international",
];

export function listCompetitions(): Promise<Competition[]> {
  return apiJson<Competition[]>("/api/competitions");
}

export function getCompetition(id: number): Promise<Competition> {
  return apiJson<Competition>(`/api/competitions/${id}`);
}

export function createCompetition(dto: CompetitionForm): Promise<Competition> {
  return apiJson<Competition>("/api/competitions", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateCompetition(
  id: number,
  dto: CompetitionForm,
): Promise<Competition> {
  return apiJson<Competition>(`/api/competitions/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteCompetition(id: number): Promise<void> {
  return apiJson<void>(`/api/competitions/${id}`, { method: "DELETE" });
}

/** Download URL for the full competition list (format: csv or json). */
export function competitionsExportHref(format: "csv" | "json"): string {
  return `${getApiUrl()}/api/competitions/export?format=${format}`;
}

/** Download URL for every edition of every competition (format: csv or json). */
export function competitionSeasonsExportHref(format: "csv" | "json"): string {
  return `${getApiUrl()}/api/competitions/seasons/export?format=${format}`;
}

export function listCompetitionSeasons(
  competitionId: number,
): Promise<CompetitionSeason[]> {
  return apiJson<CompetitionSeason[]>(
    `/api/competitions/${competitionId}/seasons`,
  );
}

export function createCompetitionSeason(
  competitionId: number,
  dto: CompetitionSeasonForm,
): Promise<CompetitionSeason> {
  return apiJson<CompetitionSeason>(
    `/api/competitions/${competitionId}/seasons`,
    {
      method: "POST",
      body: JSON.stringify(dto),
    },
  );
}

export function updateCompetitionSeason(
  competitionId: number,
  seasonId: number,
  dto: CompetitionSeasonForm,
): Promise<CompetitionSeason> {
  return apiJson<CompetitionSeason>(
    `/api/competitions/${competitionId}/seasons/${seasonId}`,
    {
      method: "PUT",
      body: JSON.stringify(dto),
    },
  );
}

export function deleteCompetitionSeason(
  competitionId: number,
  seasonId: number,
): Promise<void> {
  return apiJson<void>(
    `/api/competitions/${competitionId}/seasons/${seasonId}`,
    { method: "DELETE" },
  );
}

export const COMPETITION_SORTS = [
  "name",
  "kind",
  "tier",
  "scope",
  "createdAt",
] as const;

export type CompetitionSort = (typeof COMPETITION_SORTS)[number];

export interface CompetitionQuery {
  q?: string;
  kind?: string;
  tier?: number;
  scope?: string;
  region?: string;
  sort?: CompetitionSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface CompetitionPage {
  items: Competition[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CompetitionFilterOptions {
  kinds: string[];
  tiers: number[];
  scopes: string[];
  regions: string[];
}

/** Filtered, sorted, paged competition list for a data browser. */
export function queryCompetitions(
  query: CompetitionQuery,
): Promise<CompetitionPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.kind) params.set("kind", query.kind);
  if (query.tier !== undefined) params.set("tier", String(query.tier));
  if (query.scope) params.set("scope", query.scope);
  if (query.region) params.set("region", query.region);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<CompetitionPage>(
    `/api/competitions/query?${params.toString()}`,
  );
}

export function getCompetitionFilterOptions(): Promise<CompetitionFilterOptions> {
  return apiJson<CompetitionFilterOptions>("/api/competitions/filter-options");
}

/** Human label for pickers and tables: "Super League" style. */
export function competitionLabel(c: Competition): string {
  return c.shortName ? `${c.name} (${c.shortName})` : c.name;
}

/** What an edition is called on screen: its name, else its label, else a
 * placeholder for yearless editions nobody has named yet. */
export function seasonLabel(s: CompetitionSeason): string {
  return s.name ?? s.label ?? "(year unknown)";
}
