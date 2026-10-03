import { apiJson } from "@/lib/api";

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
export const PLAYER_FEET = ["left", "right", "both"];

export function listPlayers(): Promise<Player[]> {
  return apiJson<Player[]>("/api/players");
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
