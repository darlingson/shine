import { apiJson, getApiUrl } from "@/lib/api";
import type { SortOrder } from "@/lib/sorting";

export interface Player {
  playerId: number;
  fullName: string;
  knownAs?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  nationality: string;
  positionPrimary?: string | null;
  positionSecondary?: string | null;
  heightCm?: number | null;
  foot?: string | null;
  status: string;
  sourceUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerForm {
  fullName: string;
  knownAs?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality: string;
  positionPrimary?: string;
  positionSecondary?: string;
  heightCm?: number | null;
  foot?: string;
  status: string;
  sourceUrl?: string;
}

export const PLAYER_STATUSES = ["active", "retired", "unknown"];

/** Canonical gender vocabulary — mirrors ShineApi/Services/Genders.cs. Same
 * values the NationalTeam entity uses ("mixed" is a team concept only);
 * leaving it unset means unknown. */
export const PLAYER_GENDERS = ["men", "women"];
export const PLAYER_FEET = ["left", "right", "both"];

export const PLAYER_SORTS = [
  "name",
  "knownAs",
  "dateOfBirth",
  "heightCm",
  "status",
  "createdAt",
] as const;

export type PlayerSort = (typeof PLAYER_SORTS)[number];

export interface PlayerQuery {
  q?: string;
  status?: string;
  foot?: string;
  nationality?: string;
  position?: string;
  bornFrom?: number;
  bornTo?: number;
  sort?: PlayerSort;
  order?: SortOrder;
  page?: number;
  pageSize?: number;
}

export interface PlayerPage {
  items: Player[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PlayerFilterOptions {
  nationalities: string[];
  /** Distinct primary and secondary positions, combined. */
  positions: string[];
}

/** Filtered, sorted, paged player list for the data browser. */
export function queryPlayers(query: PlayerQuery): Promise<PlayerPage> {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.foot) params.set("foot", query.foot);
  if (query.nationality) params.set("nationality", query.nationality);
  if (query.position) params.set("position", query.position);
  if (query.bornFrom != null) params.set("bornFrom", String(query.bornFrom));
  if (query.bornTo != null) params.set("bornTo", String(query.bornTo));
  if (query.sort) params.set("sort", query.sort);
  if (query.order) params.set("order", query.order);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 25));
  return apiJson<PlayerPage>(`/api/players/query?${params.toString()}`);
}

export function getPlayerFilterOptions(): Promise<PlayerFilterOptions> {
  return apiJson<PlayerFilterOptions>("/api/players/filter-options");
}

export function listPlayers(): Promise<Player[]> {
  return apiJson<Player[]>("/api/players");
}

export function getPlayer(id: number): Promise<Player> {
  return apiJson<Player>(`/api/players/${id}`);
}

export function createPlayer(dto: PlayerForm): Promise<Player> {
  return apiJson<Player>("/api/players", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updatePlayer(id: number, dto: PlayerForm): Promise<Player> {
  return apiJson<Player>(`/api/players/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deletePlayer(id: number): Promise<void> {
  return apiJson<void>(`/api/players/${id}`, { method: "DELETE" });
}

/** Download URL for the full player list (format: csv or json). */
export function playersExportHref(format: "csv" | "json"): string {
  return `${getApiUrl()}/api/players/export?format=${format}`;
}
