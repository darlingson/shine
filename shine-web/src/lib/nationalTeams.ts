import { apiJson } from "@/lib/api";

export interface NationalTeam {
  nationalTeamId: number;
  name: string;
  shortName?: string | null;
  gender?: string | null;
  level?: string | null;
  country: string;
  sourceUrl?: string | null;
}

export interface NationalTeamForm {
  name: string;
  shortName?: string;
  gender?: string;
  level?: string;
  country: string;
  sourceUrl?: string;
}

export const NATIONAL_TEAM_GENDERS = ["men", "women", "mixed"];
export const NATIONAL_TEAM_LEVELS = ["senior", "U23", "U20", "U17"];

export function listNationalTeams(): Promise<NationalTeam[]> {
  return apiJson<NationalTeam[]>("/api/nationalteams");
}

export function getNationalTeam(id: number): Promise<NationalTeam> {
  return apiJson<NationalTeam>(`/api/nationalteams/${id}`);
}

export function createNationalTeam(dto: NationalTeamForm): Promise<NationalTeam> {
  return apiJson<NationalTeam>("/api/nationalteams", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateNationalTeam(
  id: number,
  dto: NationalTeamForm,
): Promise<NationalTeam> {
  return apiJson<NationalTeam>(`/api/nationalteams/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export function deleteNationalTeam(id: number): Promise<void> {
  return apiJson<void>(`/api/nationalteams/${id}`, { method: "DELETE" });
}

/** Human label: "Malawi Women (U20)" style, for pickers and tables. */
export function nationalTeamLabel(t: NationalTeam): string {
  const qualifier = t.level && t.level !== "senior" ? t.level : null;
  return qualifier ? `${t.name} (${qualifier})` : t.name;
}
