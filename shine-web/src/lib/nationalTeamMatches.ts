import { apiJson } from "@/lib/api";

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
