import { apiJson } from "@/lib/api";

export interface Club {
  clubId: number;
  name: string;
  shortName?: string | null;
  city?: string | null;
  country: string;
  foundedYear?: number | null;
  sourceUrl?: string | null;
}

/** Minimal read client — only listing is needed for squad forms today. */
export function listClubs(): Promise<Club[]> {
  return apiJson<Club[]>("/api/clubs");
}
