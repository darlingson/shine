import { apiJson } from "@/lib/api";

/** Searchable kinds with a public result page, mirroring ShineApi's SearchKinds. */
export const SEARCH_KINDS = [
  "player",
  "club",
  "nationalTeam",
  "clubMatch",
  "nationalTeamMatch",
] as const;

export type SearchKind = (typeof SEARCH_KINDS)[number];

export interface SearchResult {
  kind: SearchKind;
  id: number;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}

export interface SearchOptions {
  kinds?: readonly SearchKind[];
  /** Maximum results per kind, not across all kinds. */
  limit?: number;
}

export const SEARCH_MIN_LENGTH = 2;

/** Section headings for grouped results, in display order. */
export const SEARCH_KIND_LABELS: Record<SearchKind, string> = {
  player: "Players",
  club: "Clubs",
  nationalTeam: "National teams",
  clubMatch: "Club matches",
  nationalTeamMatch: "National matches",
};

export function search(
  q: string,
  { kinds, limit }: SearchOptions = {},
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  if (kinds?.length) params.set("kinds", kinds.join(","));
  if (limit) params.set("limit", String(limit));
  return apiJson<SearchResponse>(`/api/search?${params.toString()}`);
}

/** Kinds with a public page to land on, in the order the results page groups them. */
export const PUBLIC_SEARCH_KINDS = [
  "player",
  "club",
  "nationalTeam",
  "clubMatch",
  "nationalTeamMatch",
] as const;