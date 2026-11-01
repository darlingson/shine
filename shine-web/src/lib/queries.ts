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
  getNationalTeamFilterOptions,
  listNationalTeams,
  queryNationalTeams,
  type NationalTeam,
  type NationalTeamFilterOptions,
  type NationalTeamPage,
  type NationalTeamQuery,
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
  getStaffMember,
  getStaffMemberFilterOptions,
  listStaffAppointments,
  listStaffMembers,
  queryStaffAppointments,
  queryStaffMembers,
  type StaffAppointment,
  type StaffAppointmentPage,
  type StaffAppointmentQuery,
  type StaffMember,
  type StaffMemberFilterOptions,
  type StaffMemberPage,
  type StaffMemberQuery,
} from "@/lib/staff";
import {
  getCompetition,
  getCompetitionFilterOptions,
  listCompetitionSeasons,
  listCompetitions,
  queryCompetitions,
  type Competition,
  type CompetitionFilterOptions,
  type CompetitionPage,
  type CompetitionQuery,
  type CompetitionSeason,
} from "@/lib/competitions";
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
  nationalTeamPage: (query: NationalTeamQuery) =>
    ["nationalTeams", "page", query] as const,
  nationalTeamFilterOptions: ["nationalTeams", "filterOptions"] as const,
  competitions: ["competitions"] as const,
  competition: (id: number | string) => ["competitions", String(id)] as const,
  competitionPage: (query: CompetitionQuery) =>
    ["competitions", "page", query] as const,
  competitionFilterOptions: ["competitions", "filterOptions"] as const,
  competitionSeasons: (id: number | string) =>
    ["competitions", String(id), "seasons"] as const,
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
  staffMembers: ["staffMembers"] as const,
  staffMember: (id: number | string) => ["staffMembers", String(id)] as const,
  staffMemberPage: (query: StaffMemberQuery) =>
    ["staffMembers", "page", query] as const,
  staffMemberFilterOptions: ["staffMembers", "filterOptions"] as const,
  staffAppointments: ["staffAppointments"] as const,
  staffAppointmentPage: (query: StaffAppointmentQuery) =>
    ["staffAppointments", "page", query] as const,
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

export function useNationalTeamPage(
  query: NationalTeamQuery,
): UseQueryResult<NationalTeamPage, Error> {
  return useQuery({
    queryKey: queryKeys.nationalTeamPage(query),
    queryFn: () => queryNationalTeams(query),
    placeholderData: keepPreviousData,
  });
}

export function useNationalTeamFilterOptions(): UseQueryResult<
  NationalTeamFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.nationalTeamFilterOptions,
    queryFn: getNationalTeamFilterOptions,
  });
}

export function useStaffMembers(
  enabled = true,
): UseQueryResult<StaffMember[], Error> {
  return useQuery({
    queryKey: queryKeys.staffMembers,
    queryFn: listStaffMembers,
    enabled,
  });
}

export function useStaffMember(
  id: number | string,
  enabled = true,
): UseQueryResult<StaffMember, Error> {
  return useQuery({
    queryKey: queryKeys.staffMember(id),
    queryFn: () => getStaffMember(Number(id)),
    enabled,
  });
}

export function useStaffAppointments(
  enabled = true,
): UseQueryResult<StaffAppointment[], Error> {
  return useQuery({
    queryKey: queryKeys.staffAppointments,
    queryFn: listStaffAppointments,
    enabled,
  });
}

export function useStaffAppointmentPage(
  query: StaffAppointmentQuery,
  enabled = true,
): UseQueryResult<StaffAppointmentPage, Error> {
  return useQuery({
    queryKey: queryKeys.staffAppointmentPage(query),
    queryFn: () => queryStaffAppointments(query),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useStaffMemberPage(
  query: StaffMemberQuery,
  enabled = true,
): UseQueryResult<StaffMemberPage, Error> {
  return useQuery({
    queryKey: queryKeys.staffMemberPage(query),
    queryFn: () => queryStaffMembers(query),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useStaffMemberFilterOptions(): UseQueryResult<
  StaffMemberFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.staffMemberFilterOptions,
    queryFn: getStaffMemberFilterOptions,
  });
}

export function useCompetitions(
  enabled = true,
): UseQueryResult<Competition[], Error> {
  return useQuery({
    queryKey: queryKeys.competitions,
    queryFn: listCompetitions,
    enabled,
  });
}

export function useCompetition(
  id: number | string,
  enabled = true,
): UseQueryResult<Competition, Error> {
  return useQuery({
    queryKey: queryKeys.competition(id),
    queryFn: () => getCompetition(Number(id)),
    enabled,
  });
}

export function useCompetitionPage(
  query: CompetitionQuery,
): UseQueryResult<CompetitionPage, Error> {
  return useQuery({
    queryKey: queryKeys.competitionPage(query),
    queryFn: () => queryCompetitions(query),
    placeholderData: keepPreviousData,
  });
}

export function useCompetitionFilterOptions(): UseQueryResult<
  CompetitionFilterOptions,
  Error
> {
  return useQuery({
    queryKey: queryKeys.competitionFilterOptions,
    queryFn: getCompetitionFilterOptions,
  });
}

export function useCompetitionSeasons(
  competitionId: number | string,
  enabled = true,
): UseQueryResult<CompetitionSeason[], Error> {
  return useQuery({
    queryKey: queryKeys.competitionSeasons(competitionId),
    queryFn: () => listCompetitionSeasons(Number(competitionId)),
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
