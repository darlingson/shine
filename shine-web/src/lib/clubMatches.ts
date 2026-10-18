import { apiJson } from "@/lib/api";

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
