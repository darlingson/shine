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

export interface ClubForm {
  name: string;
  shortName?: string;
  city?: string;
  country: string;
  foundedYear?: number | null;
  sourceUrl?: string;
}

export function createClub(dto: ClubForm): Promise<Club> {
  return apiJson<Club>("/api/clubs", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateClub(id: number, dto: ClubForm): Promise<Club> {
  return apiJson<Club>(`/api/clubs/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteClub(id: number): Promise<void> {
  return apiJson<void>(`/api/clubs/${id}`, { method: "DELETE" });
}
