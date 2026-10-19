import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  getClub,
  getClubFilterOptions,
  listClubs,
  queryClubs,
  type Club,
  type ClubFilterOptions,
  type ClubPage,
  type ClubQuery,
} from "@/lib/clubs";
import {
  getClubMatch,
  getClubMatchFilterOptions,
  listClubMatches,
  queryClubMatches,
  type ClubMatch,
  type ClubMatchFilterOptions,
  type ClubMatchPage,
  type ClubMatchQuery,
} from "@/lib/clubMatches";
import {
  getNationalTeamMatch,
  getNationalTeamMatchFilterOptions,
  listNationalTeamMatches,
  queryNationalTeamMatches,
  type NationalTeamMatch,
  type NationalTeamMatchFilterOptions,
  type NationalTeamMatchPage,
  type NationalTeamMatchQuery,
} from "@/lib/nationalTeamMatches";
import {
  getNationalTeam,
  listNationalTeams,
  type NationalTeam,
} from "@/lib/nationalTeams";
import {
  getPlayer,
  getPlayerFilterOptions,
  listPlayers,
  queryPlayers,
  type Player,
  type PlayerFilterOptions,
  type PlayerPage,
  type PlayerQuery,
} from "@/lib/players";
import { listPlayerClubs, type PlayerClub } from "@/lib/playerclubs";
import {
  listClubSquads,
  listNationalSquads,
  type ClubSquad,
  type NationalSquad,
} from "@/lib/squads";
import { listUsers, type ManagedUser } from "@/lib/users";
import {
  search,
  SEARCH_MIN_LENGTH,
  type SearchKind,
  type SearchResponse,
} from "@/lib/search";

export const queryKeys = {
  players: ["players"] as const,
  player: (id: number | string) => ["players", String(id)] as const,
  playerPage: (query: PlayerQuery) => ["players", "page", query] as const,
  playerFilterOptions: ["players", "filterOptions"] as const,
  clubs: ["clubs"] as const,
  club: (id: number | string) => ["clubs", String(id)] as const,
  clubPage: (query: ClubQuery) => ["clubs", "page", query] as const,
  clubFilterOptions: ["clubs", "filterOptions"] as const,
  nationalTeams: ["nationalTeams"] as const,
  nationalTeam: (id: number | string) => ["nationalTeams", String(id)] as const,
  clubMatches: ["clubMatches"] as const,
  clubMatch: (id: number | string) => ["clubMatches", String(id)] as const,
  clubMatchPage: (query: ClubMatchQuery) =>
    ["clubMatches", "page", query] as const,
  clubMatchFilterOptions: ["clubMatches", "filterOptions"] as const,
  nationalTeamMatches: ["nationalTeamMatches"] as const,
  nationalTeamMatch: (id: number | string) =>
    ["nationalTeamMatches", String(id)] as const,
  nationalTeamMatchPage: (query: NationalTeamMatchQuery) =>
    ["nationalTeamMatches", "page", query] as const,
  nationalTeamMatchFilterOptions: ["nationalTeamMatches", "filterOptions"] as const,
  playerClubs: ["playerClubs"] as const,
  clubSquads: ["clubSquads"] as const,
  nationalSquads: ["nationalSquads"] as const,
  users: ["users"] as const,
  search: (q: string, kinds: string, limit: number) =>
    ["search", q, kinds, limit] as const,
};

export function usePlayers(): UseQueryResult<Player[], Error> {
  return useQuery({ queryKey: queryKeys.players, queryFn: listPlayers });
}

export function usePlayer(
  id: number | string,
  enabled = true,
): UseQueryResult<Player, Error> {
  return useQuery({
    queryKey: queryKeys.player(id),
    queryFn: () => getPlayer(Number(id)),
    enabled,
  });
}

export function usePlayerPage(
  query: PlayerQuery,
): UseQueryResult<PlayerPage, Error> {
  return useQuery({
    queryKey: queryKeys.playerPage(query),
    queryFn: () => queryPlayers(query),
    placeholderData: keepPreviousData,
  });
}

export function usePlayerFilterOptions(): UseQueryResult<
  PlayerFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.playerFilterOptions,
    queryFn: getPlayerFilterOptions,
  });
}

export function useClubs(): UseQueryResult<Club[], Error> {
  return useQuery({ queryKey: queryKeys.clubs, queryFn: listClubs });
}

export function useClub(
  id: number | string,
  enabled = true,
): UseQueryResult<Club, Error> {
  return useQuery({
    queryKey: queryKeys.club(id),
    queryFn: () => getClub(Number(id)),
    enabled,
  });
}

export function useClubPage(
  query: ClubQuery,
): UseQueryResult<ClubPage, Error> {
  return useQuery({
    queryKey: queryKeys.clubPage(query),
    queryFn: () => queryClubs(query),
    placeholderData: keepPreviousData,
  });
}

export function useClubFilterOptions(): UseQueryResult<
  ClubFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.clubFilterOptions,
    queryFn: getClubFilterOptions,
  });
}

export function useNationalTeams(): UseQueryResult<NationalTeam[], Error> {
  return useQuery({
    queryKey: queryKeys.nationalTeams,
    queryFn: listNationalTeams,
  });
}

export function useNationalTeam(
  id: number | string,
  enabled = true,
): UseQueryResult<NationalTeam, Error> {
  return useQuery({
    queryKey: queryKeys.nationalTeam(id),
    queryFn: () => getNationalTeam(Number(id)),
    enabled,
  });
}

export function useClubMatches(
  enabled = true,
): UseQueryResult<ClubMatch[], Error> {
  return useQuery({
    queryKey: queryKeys.clubMatches,
    queryFn: listClubMatches,
    enabled,
  });
}

export function useClubMatch(
  id: number | string,
  enabled = true,
): UseQueryResult<ClubMatch, Error> {
  return useQuery({
    queryKey: queryKeys.clubMatch(id),
    queryFn: () => getClubMatch(Number(id)),
    enabled,
  });
}

export function useClubMatchPage(
  query: ClubMatchQuery,
): UseQueryResult<ClubMatchPage, Error> {
  return useQuery({
    queryKey: queryKeys.clubMatchPage(query),
    queryFn: () => queryClubMatches(query),
    placeholderData: keepPreviousData,
  });
}

export function useClubMatchFilterOptions(): UseQueryResult<
  ClubMatchFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.clubMatchFilterOptions,
    queryFn: getClubMatchFilterOptions,
  });
}

export function useNationalTeamMatches(
  enabled = true,
): UseQueryResult<NationalTeamMatch[], Error> {
  return useQuery({
    queryKey: queryKeys.nationalTeamMatches,
    queryFn: listNationalTeamMatches,
    enabled,
  });
}

export function useNationalTeamMatch(
  id: number | string,
  enabled = true,
): UseQueryResult<NationalTeamMatch, Error> {
  return useQuery({
    queryKey: queryKeys.nationalTeamMatch(id),
    queryFn: () => getNationalTeamMatch(Number(id)),
    enabled,
  });
}

export function useNationalTeamMatchPage(
  query: NationalTeamMatchQuery,
): UseQueryResult<NationalTeamMatchPage, Error> {
  return useQuery({
    queryKey: queryKeys.nationalTeamMatchPage(query),
    queryFn: () => queryNationalTeamMatches(query),
    placeholderData: keepPreviousData,
  });
}

export function useNationalTeamMatchFilterOptions(): UseQueryResult<
  NationalTeamMatchFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.nationalTeamMatchFilterOptions,
    queryFn: getNationalTeamMatchFilterOptions,
  });
}

export function usePlayerClubs(): UseQueryResult<PlayerClub[], Error> {
  return useQuery({ queryKey: queryKeys.playerClubs, queryFn: listPlayerClubs });
}

export function useClubSquads(
  enabled = true,
): UseQueryResult<ClubSquad[], Error> {
  return useQuery({
    queryKey: queryKeys.clubSquads,
    queryFn: listClubSquads,
    enabled,
  });
}

export function useNationalSquads(
  enabled = true,
): UseQueryResult<NationalSquad[], Error> {
  return useQuery({
    queryKey: queryKeys.nationalSquads,
    queryFn: listNationalSquads,
    enabled,
  });
}

export function useUsers(enabled = true): UseQueryResult<ManagedUser[], Error> {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
    enabled,
  });
}

export function useSearch(
  q: string,
  { kinds, limit = 10 }: { kinds?: readonly SearchKind[]; limit?: number } = {},
): UseQueryResult<SearchResponse, Error> {
  const term = q.trim();
  const kindKey = kinds?.join(",") ?? "";
  return useQuery({
    queryKey: queryKeys.search(term, kindKey, limit),
    queryFn: () => search(term, { kinds, limit }),
    enabled: term.length >= SEARCH_MIN_LENGTH,
  });
}
