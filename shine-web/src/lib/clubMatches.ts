import { apiJson } from "@/lib/api";
import type { SortOrder } from "@/lib/sorting";

export interface ClubMatch {
  matchId: number;
  matchDate: string;
  competition?: string | null;
  season?: string | null;
  homeClubId?: number | null;
  awayClubId?: number | null;
  homeClubName?: string | null;
  awayClubName?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string | null;
  sourceUrl?: string | null;
}

export const CLUB_MATCH_SORTS = [
  "matchDate",
  "competition",
  "venue",
  "createdAt",
] as const;

export type ClubMatchSort = (typeof CLUB_MATCH_SORTS)[number];

export interface ClubMatchQuery {
  q?: string;
  /** Matches where the club is either the home or the away side. */
  clubId?: number;
  competition?: string;
  season?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: ClubMatchSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface ClubMatchPage {
  items: ClubMatch[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClubMatchFilterOptions {
  competitions: string[];
  seasons: string[];
}

/** Filtered, sorted, paged club-match list for the data browser. */
export function queryClubMatches(query: ClubMatchQuery): Promise<ClubMatchPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.clubId != null) params.set("clubId", String(query.clubId));
  if (query.competition) params.set("competition", query.competition);
  if (query.season) params.set("season", query.season);
  if (query.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query.dateTo) params.set("dateTo", query.dateTo);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<ClubMatchPage>(`/api/clubmatches/query?${params.toString()}`);
}

export function getClubMatchFilterOptions(): Promise<ClubMatchFilterOptions> {
  return apiJson<ClubMatchFilterOptions>("/api/clubmatches/filter-options");
}

export interface ClubMatchForm {
  matchDate: string;
  competition?: string;
  season?: string;
  homeClubId?: number | null;
  awayClubId?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string;
  sourceUrl?: string;
}

export function listClubMatches(): Promise<ClubMatch[]> {
  return apiJson<ClubMatch[]>("/api/clubmatches");
}

export function getClubMatch(id: number): Promise<ClubMatch> {
  return apiJson<ClubMatch>(`/api/clubmatches/${id}`);
}

export function createClubMatch(dto: ClubMatchForm): Promise<ClubMatch> {
  return apiJson<ClubMatch>("/api/clubmatches", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateClubMatch(
  id: number,
  dto: ClubMatchForm,
): Promise<ClubMatch> {
  return apiJson<ClubMatch>(`/api/clubmatches/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteClubMatch(id: number): Promise<void> {
  return apiJson<void>(`/api/clubmatches/${id}`, { method: "DELETE" });
}

/** "Home 2–1 Away" style label; "?" stands in for an unlinked club. */
export function clubMatchLabel(m: ClubMatch): string {
  const hasScore =
    (m.homeScore !== null && m.homeScore !== undefined) ||
    (m.awayScore !== null && m.awayScore !== undefined);
  const score = hasScore ? `${m.homeScore ?? "?"}–${m.awayScore ?? "?"}` : "vs";
  return `${m.homeClubName || "?"} ${score} ${m.awayClubName || "?"}`;
}
