import { apiJson } from "@/lib/api";
import type { SortOrder } from "@/lib/sorting";

export interface NationalTeam {
  nationalTeamId: number;
  name: string;
  shortName?: string | null;
  nickname?: string | null;
  gender?: string | null;
  level?: string | null;
  coach?: string | null;
  country: string;
  sourceUrl?: string | null;
}

export interface NationalTeamForm {
  name: string;
  shortName?: string;
  nickname?: string;
  gender?: string;
  level?: string;
  coach?: string;
  country: string;
  sourceUrl?: string;
}

export const NATIONAL_TEAM_GENDERS = ["men", "women", "mixed"];
export const NATIONAL_TEAM_LEVELS = ["senior", "U23", "U20", "U17"];

export function listNationalTeams(): Promise<NationalTeam[]> {
  return apiJson<NationalTeam[]>("/api/nationalteams");
}

export function getNationalTeam(id: number): Promise<NationalTeam> {
  return apiJson<NationalTeam>(`/api/nationalteams/${id}`);
}

export function createNationalTeam(dto: NationalTeamForm): Promise<NationalTeam> {
  return apiJson<NationalTeam>("/api/nationalteams", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateNationalTeam(
  id: number,
  dto: NationalTeamForm,
): Promise<NationalTeam> {
  return apiJson<NationalTeam>(`/api/nationalteams/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteNationalTeam(id: number): Promise<void> {
  return apiJson<void>(`/api/nationalteams/${id}`, { method: "DELETE" });
}

export const NATIONAL_TEAM_SORTS = [
  "name",
  "country",
  "level",
  "gender",
  "createdAt",
] as const;

export type NationalTeamSort = (typeof NATIONAL_TEAM_SORTS)[number];

export interface NationalTeamQuery {
  q?: string;
  country?: string;
  gender?: string;
  level?: string;
  sort?: NationalTeamSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface NationalTeamPage {
  items: NationalTeam[];
  total: number;
  page: number;
  pageSize: number;
}

export interface NationalTeamFilterOptions {
  countries: string[];
  genders: string[];
  levels: string[];
}

/** Filtered, sorted, paged national team list for the data browser. */
export function queryNationalTeams(
  query: NationalTeamQuery,
): Promise<NationalTeamPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.country) params.set("country", query.country);
  if (query.gender) params.set("gender", query.gender);
  if (query.level) params.set("level", query.level);
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<NationalTeamPage>(
    `/api/nationalteams/query?${params.toString()}`,
  );
}

export function getNationalTeamFilterOptions(): Promise<NationalTeamFilterOptions> {
  return apiJson<NationalTeamFilterOptions>("/api/nationalteams/filter-options");
}

/** Human label: "Malawi Women (U20)" style, for pickers and tables. */
export function nationalTeamLabel(t: NationalTeam): string {
  const qualifier = t.level && t.level !== "senior" ? t.level : null;
  return qualifier ? `${t.name} (${qualifier})` : t.name;
}
