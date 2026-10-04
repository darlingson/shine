import { apiJson } from "@/lib/api";

export interface Match {
  matchId: number;
  matchDate: string;
  competition?: string | null;
  season?: string | null;
  homeTeam?: string | null;
  awayTeam?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string | null;
  sourceUrl?: string | null;
}

export interface MatchForm {
  matchDate: string;
  competition?: string;
  season?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string;
  sourceUrl?: string;
}

export function listMatches(): Promise<Match[]> {
  return apiJson<Match[]>("/api/matches");
}

export function createMatch(dto: MatchForm): Promise<Match> {
  return apiJson<Match>("/api/matches", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateMatch(id: number, dto: MatchForm): Promise<Match> {
  return apiJson<Match>(`/api/matches/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteMatch(id: number): Promise<void> {
  return apiJson<void>(`/api/matches/${id}`, { method: "DELETE" });
}

export function fixtureLabel(m: Match): string {
  const score =
    m.homeScore !== null && m.homeScore !== undefined
      ? `${m.homeScore}–${m.awayScore ?? "?"}`
      : "vs";
  return `${m.homeTeam || "?"} ${score} ${m.awayTeam || "?"}`;
}
