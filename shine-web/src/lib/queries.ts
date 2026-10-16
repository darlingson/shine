import {
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { getClub, listClubs, type Club } from "@/lib/clubs";
import { getMatch, listMatches, type Match } from "@/lib/matches";
import { getPlayer, listPlayers, type Player } from "@/lib/players";
import { listPlayerClubs, type PlayerClub } from "@/lib/playerclubs";
import {
  listClubSquads,
  listNationalSquads,
  type ClubSquad,
  type NationalSquad,
} from "@/lib/squads";
import { listUsers, type ManagedUser } from "@/lib/users";

export const queryKeys = {
  players: ["players"] as const,
  player: (id: number | string) => ["players", String(id)] as const,
  clubs: ["clubs"] as const,
  club: (id: number | string) => ["clubs", String(id)] as const,
  matches: ["matches"] as const,
  match: (id: number | string) => ["matches", String(id)] as const,
  playerClubs: ["playerClubs"] as const,
  clubSquads: ["clubSquads"] as const,
  nationalSquads: ["nationalSquads"] as const,
  users: ["users"] as const,
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

export function useMatches(): UseQueryResult<Match[], Error> {
  return useQuery({ queryKey: queryKeys.matches, queryFn: listMatches });
}

export function useMatch(
  id: number | string,
  enabled = true,
): UseQueryResult<Match, Error> {
  return useQuery({
    queryKey: queryKeys.match(id),
    queryFn: () => getMatch(Number(id)),
    enabled,
  });
}

export function usePlayerClubs(): UseQueryResult<PlayerClub[], Error> {
  return useQuery({ queryKey: queryKeys.playerClubs, queryFn: listPlayerClubs });
}

export function useClubSquads(): UseQueryResult<ClubSquad[], Error> {
  return useQuery({ queryKey: queryKeys.clubSquads, queryFn: listClubSquads });
}

export function useNationalSquads(): UseQueryResult<NationalSquad[], Error> {
  return useQuery({
    queryKey: queryKeys.nationalSquads,
    queryFn: listNationalSquads,
  });
}

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
    enabled,
  });
}

/** Invalidate list queries after a write; detail queries refetch on mount. */
export function useInvalidateLists() {
  const client = useQueryClient();
  return (keys: ReadonlyArray<readonly string[]>) =>
    Promise.all(keys.map((key) => client.invalidateQueries({ queryKey: key })));
}
