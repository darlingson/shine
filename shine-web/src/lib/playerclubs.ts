import { apiJson, getApiUrl } from "@/lib/api";

export interface PlayerClub {
  playerClubId: number;
  playerId: number;
  clubId: number;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  contractType?: string | null;
  shirtNumber?: number | null;
  positionAtClub?: string | null;
  sourceUrl?: string | null;
}

/** Minimal read client — listings for the public data pages. */
export function listPlayerClubs(): Promise<PlayerClub[]> {
  return apiJson<PlayerClub[]>("/api/playerclubs");
}

/** Download URL for the full career history (format: csv or json). */
export function playerClubsExportHref(format: "csv" | "json"): string {
  return `${getApiUrl()}/api/playerclubs/export?format=${format}`;
}
