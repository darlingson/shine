import { apiJson } from "@/lib/api";
import type { SortOrder } from "@/lib/sorting";

export interface NationalTeamMatch {
  matchId: number;
  matchDate: string;
  competition?: string | null;
  season?: string | null;
  homeNationalTeamId?: number | null;
  awayNationalTeamId?: number | null;
  homeNationalTeamName?: string | null;
  awayNationalTeamName?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string | null;
  sourceUrl?: string | null;
}

export const NATIONAL_TEAM_MATCH_SORTS = [
  "matchDate",
  "competition",
  "venue",
  "createdAt",
] as const;

export type NationalTeamMatchSort = (typeof NATIONAL_TEAM_MATCH_SORTS)[number];

export interface NationalTeamMatchQuery {
  q?: string;
  /** Matches where the team is either the home or the away side. */
  nationalTeamId?: number;
  competition?: string;
  season?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: NationalTeamMatchSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface NationalTeamMatchPage {
  items: NationalTeamMatch[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NationalTeamMatchFilterOptions {
  competitions: string[];
  seasons: string[];
}

/** Filtered, sorted, paged national-team match list for the data browser. */
export function queryNationalTeamMatches(
  query: NationalTeamMatchQuery,
): Promise<NationalTeamMatchPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.nationalTeamId != null)
    params.set("nationalTeamId", String(query.nationalTeamId));
  if (query.competition) params.set("competition", query.competition);
  if (query.season) params.set("season", query.season);
  if (query.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query.dateTo) params.set("dateTo", query.dateTo);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<NationalTeamMatchPage>(
    `/api/nationalteammatches/query?${params.toString()}`,
  );
}

export function getNationalTeamMatchFilterOptions(): Promise<NationalTeamMatchFilterOptions> {
  return apiJson<NationalTeamMatchFilterOptions>(
    "/api/nationalteammatches/filter-options",
  );
}

export interface NationalTeamMatchForm {
  matchDate: string;
  competition?: string;
  season?: string;
  homeNationalTeamId?: number | null;
  awayNationalTeamId?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string;
  sourceUrl?: string;
}

export function listNationalTeamMatches(): Promise<NationalTeamMatch[]> {
  return apiJson<NationalTeamMatch[]>("/api/nationalteammatches");
}

export function getNationalTeamMatch(id: number): Promise<NationalTeamMatch> {
  return apiJson<NationalTeamMatch>(`/api/nationalteammatches/${id}`);
}

export function createNationalTeamMatch(
  dto: NationalTeamMatchForm,
): Promise<NationalTeamMatch> {
  return apiJson<NationalTeamMatch>("/api/nationalteammatches", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateNationalTeamMatch(
  id: number,
  dto: NationalTeamMatchForm,
): Promise<NationalTeamMatch> {
  return apiJson<NationalTeamMatch>(`/api/nationalteammatches/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteNationalTeamMatch(id: number): Promise<void> {
  return apiJson<void>(`/api/nationalteammatches/${id}`, { method: "DELETE" });
}

/** "Home 2–1 Away" style label; "?" stands in for an unlinked team. */
export function nationalTeamMatchLabel(m: NationalTeamMatch): string {
  const hasScore =
    (m.homeScore !== null && m.homeScore !== undefined) ||
    (m.awayScore !== null && m.awayScore !== undefined);
  const score = hasScore ? `${m.homeScore ?? "?"}–${m.awayScore ?? "?"}` : "vs";
  return `${m.homeNationalTeamName || "?"} ${score} ${m.awayNationalTeamName || "?"}`;
}
