import { apiJson } from "@/lib/api";

/** Searchable kinds, mirroring ShineApi's SearchKinds. */
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
  limit?: number;
}

export const SEARCH_MIN_LENGTH = 2;

export function search(
  q: string,
  { kinds, limit }: SearchOptions = {},
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  if (kinds?.length) params.set("kinds", kinds.join(","));
  if (limit) params.set("limit", String(limit));
  return apiJson<SearchResponse>(`/api/search?${params.toString()}`);
}

/**
 * Public route for a result, or null when the kind has no public page yet.
 * National teams are managed at /manage/national-teams, which is behind auth,
 * so they are not linked from public search.
 */
export function searchResultPath(result: SearchResult): string | null {
  switch (result.kind) {
    case "player":
      return `/data/players/${result.id}`;
    case "club":
      return `/data/clubs/${result.id}`;
    case "clubMatch":
      return `/data/matches/club/${result.id}`;
    case "nationalTeamMatch":
      return `/data/matches/national/${result.id}`;
    default:
      return null;
  }
}