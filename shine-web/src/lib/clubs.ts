import { apiJson } from "@/lib/api";

export interface Club {
  clubId: number;
  name: string;
  shortName?: string | null;
  city?: string | null;
  country: string;
  foundedYear?: number | null;
  sourceUrl?: string | null;
}

export const CLUB_SORTS = [
  "name",
  "city",
  "country",
  "foundedYear",
  "createdAt",
] as const;

export type ClubSort = (typeof CLUB_SORTS)[number];

export type SortOrder = "asc" | "desc";

export interface ClubQuery {
  q?: string;
  city?: string;
  country?: string;
  foundedFrom?: number;
  foundedTo?: number;
  sort?: ClubSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface ClubPage {
  items: Club[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ClubFilterOptions {
  cities: string[];
  countries: string[];
}

/** Filtered, sorted, paged club list for the data browser. */
export function queryClubs(query: ClubQuery): Promise<ClubPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.city) params.set("city", query.city);
  if (query.country) params.set("country", query.country);
  if (query.foundedFrom != null)
    params.set("foundedFrom", String(query.foundedFrom));
  if (query.foundedTo != null) params.set("foundedTo", String(query.foundedTo));
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<ClubPage>(`/api/clubs/query?${params.toString()}`);
}

export function getClubFilterOptions(): Promise<ClubFilterOptions> {
  return apiJson<ClubFilterOptions>("/api/clubs/filter-options");
}

/** Minimal read client — only listing is needed for squad forms today. */
export function listClubs(): Promise<Club[]> {
  return apiJson<Club[]>("/api/clubs");
}

export function getClub(id: number): Promise<Club> {
  return apiJson<Club>(`/api/clubs/${id}`);
}

export interface ClubForm {
  name: string;
  shortName?: string;
  city?: string;
  country: string;
  foundedYear?: number | null;
  sourceUrl?: string;
}

export function createClub(dto: ClubForm): Promise<Club> {
  return apiJson<Club>("/api/clubs", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateClub(id: number, dto: ClubForm): Promise<Club> {
  return apiJson<Club>(`/api/clubs/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteClub(id: number): Promise<void> {
  return apiJson<void>(`/api/clubs/${id}`, { method: "DELETE" });
}
