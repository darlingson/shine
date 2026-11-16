import { apiJson } from "@/lib/api";

/** The landing spotlight — mirrors ShineApi's SpotlightDtos. One rotating
 * player and one rotating team, a pure function of the date: no one picks
 * them, every entry in the record gets a turn. */
export interface SpotlightResponse {
  /** The rotation date the spotlight was computed for — YYYY-MM-DD. */
  asOf: string;
  player?: SpotlightPlayer | null;
  team?: SpotlightTeam | null;
}

export interface SpotlightPlayer {
  playerId: number;
  name: string;
  fullName?: string | null;
  positionPrimary?: string | null;
  primaryRole?: string | null;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  foot?: string | null;
  status?: string | null;
  nationality?: string | null;
  currentClub?: string | null;
  /** The most recent national side from squad history, e.g. "Malawi U20". */
  nationalTeam?: string | null;
  record: SpotlightRecord;
  recentMatches: SpotlightMatch[];
}

export interface SpotlightRecord {
  clubAppearances: number;
  clubGoals: number;
  clubAssists: number;
  nationalAppearances: number;
  nationalGoals: number;
  nationalAssists: number;
}

export interface SpotlightMatch {
  kind: "clubMatch" | "nationalTeamMatch";
  matchId: number;
  date: string;
  competition?: string | null;
  /** Sides and score, e.g. "Malawi 3–1 Botswana". */
  label: string;
  lineupStatus?: string | null;
  minutesPlayed?: number | null;
  goals: number;
  assists: number;
  captain: boolean;
}

export interface SpotlightTeam {
  kind: "club" | "nationalTeam";
  id: number;
  name: string;
  shortName?: string | null;
  subtitle?: string | null;
  coach?: string | null;
  /** Clubs: players currently affiliated. National teams: distinct players recorded. */
  squadSize: number;
  recentMatches: SpotlightTeamMatch[];
}

export interface SpotlightTeamMatch {
  kind: "clubMatch" | "nationalTeamMatch";
  matchId: number;
  date: string;
  competition?: string | null;
  label: string;
  /** W / D / L from the spotlighted team's perspective, when both scores exist. */
  result?: string | null;
}

export function getSpotlight(date?: string): Promise<SpotlightResponse> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const query = params.toString();
  return apiJson<SpotlightResponse>(`/api/Spotlight${query ? `?${query}` : ""}`);
}
