import { apiJson } from "@/lib/api";

export const LINEUP_STATUSES = [
  "starter",
  "substitute",
  "unused_sub",
  "reserve",
  "suspended",
  "injured",
];

export interface SquadFields {
  lineupStatus: string;
  shirtNumber?: number | null;
  position?: string;
  minutesPlayed?: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  captain: boolean;
  sourceUrl?: string;
  notes?: string;
}

export interface ClubSquad extends SquadFields {
  matchId: number;
  clubId: number;
  playerId: number;
}

export interface NationalSquad extends SquadFields {
  matchId: number;
  nationalTeam: string;
  playerId: number;
}

export const EMPTY_SQUAD_FIELDS: SquadFields = {
  lineupStatus: "starter",
  shirtNumber: null,
  position: "",
  minutesPlayed: null,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  captain: false,
  sourceUrl: "",
  notes: "",
};

export function listClubSquads(): Promise<ClubSquad[]> {
  return apiJson<ClubSquad[]>("/api/clubmatchsquads");
}

export function createClubSquad(dto: ClubSquad): Promise<ClubSquad> {
  return apiJson<ClubSquad>("/api/clubmatchsquads", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateClubSquad(
  matchId: number,
  clubId: number,
  playerId: number,
  dto: SquadFields,
): Promise<ClubSquad> {
  return apiJson<ClubSquad>(
    `/api/clubmatchsquads/${matchId}/${clubId}/${playerId}`,
    { method: "PUT", body: JSON.stringify(dto) },
  );
}

export function deleteClubSquad(
  matchId: number,
  clubId: number,
  playerId: number,
): Promise<void> {
  return apiJson<void>(
    `/api/clubmatchsquads/${matchId}/${clubId}/${playerId}`,
    { method: "DELETE" },
  );
}

export function listNationalSquads(): Promise<NationalSquad[]> {
  return apiJson<NationalSquad[]>("/api/nationalteammatchsquads");
}

export function createNationalSquad(dto: NationalSquad): Promise<NationalSquad> {
  return apiJson<NationalSquad>("/api/nationalteammatchsquads", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

function nationalTeamQuery(nationalTeam: string): string {
  return `?nationalTeam=${encodeURIComponent(nationalTeam)}`;
}

export function updateNationalSquad(
  matchId: number,
  nationalTeam: string,
  playerId: number,
  dto: SquadFields,
): Promise<NationalSquad> {
  return apiJson<NationalSquad>(
    `/api/nationalteammatchsquads/${matchId}/${playerId}${nationalTeamQuery(nationalTeam)}`,
    { method: "PUT", body: JSON.stringify(dto) },
  );
}

/** Compact "12′ · 1G · Y1" summary for table display. */
export function statLine(s: SquadFields): string {
  const parts: string[] = [];
  if (s.minutesPlayed !== null && s.minutesPlayed !== undefined)
    parts.push(`${s.minutesPlayed}′`);
  if (s.goals > 0) parts.push(`${s.goals}G`);
  if (s.assists > 0) parts.push(`${s.assists}A`);
  const cards: string[] = [];
  if (s.yellowCards > 0) cards.push(`Y${s.yellowCards}`);
  if (s.redCards > 0) cards.push(`R${s.redCards}`);
  if (cards.length > 0) parts.push(cards.join(" "));
  return parts.join(" · ") || "—";
}

/** URL key encoding a club entry's composite id. */
export function clubEntryKey(s: ClubSquad): string {
  return `${s.matchId}-${s.clubId}-${s.playerId}`;
}

/** URL key encoding a national entry's composite id (team travels in ?team=). */
export function nationalEntryKey(s: NationalSquad): string {
  return `${s.matchId}-${s.playerId}`;
}

export function deleteNationalSquad(
  matchId: number,
  nationalTeam: string,
  playerId: number,
): Promise<void> {
  return apiJson<void>(
    `/api/nationalteammatchsquads/${matchId}/${playerId}${nationalTeamQuery(nationalTeam)}`,
    { method: "DELETE" },
  );
}
