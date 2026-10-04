import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/data-ui";
import { listClubs, type Club } from "@/lib/clubs";
import { fixtureLabel, listMatches, type Match } from "@/lib/matches";
import { listPlayers, type Player } from "@/lib/players";
import {
  clubEntryKey,
  deleteClubSquad,
  deleteNationalSquad,
  listClubSquads,
  listNationalSquads,
  nationalEntryKey,
  statLine,
  type ClubSquad,
  type NationalSquad,
} from "@/lib/squads";
import { parseApiError } from "@/lib/users";

export function SquadsPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("squads:write");
  const [tab, setTab] = useState<"club" | "national">("club");
  const [players, setPlayers] = useState<Player[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [clubEntries, setClubEntries] = useState<ClubSquad[]>([]);
  const [nationalEntries, setNationalEntries] = useState<NationalSquad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState<string>("all");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, m, cs, ns] = await Promise.all([
        listPlayers(),
        listClubs(),
        listMatches(),
        listClubSquads(),
        listNationalSquads(),
      ]);
      setPlayers(p);
      setClubs(c);
      setMatches([...m].sort((a, b) => b.matchDate.localeCompare(a.matchDate)));
      setClubEntries(cs);
      setNationalEntries(ns);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void refresh();
  }, [refresh]);

  const playerNames = useMemo(() => new Map(players.map((p) => [p.playerId, p.fullName])), [players]);
  const clubNames = useMemo(() => new Map(clubs.map((c) => [c.clubId, c.name])), [clubs]);
  const matchLabels = useMemo(
    () => new Map(matches.map((m) => [m.matchId, `${m.matchDate} — ${fixtureLabel(m)}`])),
    [matches],
  );

  const filteredClub = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubEntries.filter((s) => {
      if (matchFilter !== "all" && s.matchId.toString() !== matchFilter) return false;
      if (!q) return true;
      return (playerNames.get(s.playerId) ?? "").toLowerCase().includes(q);
    });
  }, [clubEntries, query, matchFilter, playerNames]);

  const filteredNational = useMemo(() => {
    const q = query.trim().toLowerCase();
    return nationalEntries.filter((s) => {
      if (matchFilter !== "all" && s.matchId.toString() !== matchFilter) return false;
      if (!q) return true;
      return (playerNames.get(s.playerId) ?? "").toLowerCase().includes(q);
    });
  }, [nationalEntries, query, matchFilter, playerNames]);

  const body = (() => {
    if (loading) {
      return (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
          <Button size="sm" variant="outline" onClick={refresh}>
            Retry
          </Button>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Squads
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Record who featured in each match — club and national sides."
              : "Read-only access — editing needs the squads:write permission."}
          </p>
        </div>
        {canWrite && (
          <Button
            render={
              <Link to={tab === "club" ? "/manage/squads/club/new" : "/manage/squads/national/new"} />
            }
          >
            <PlusIcon />
            <span>{tab === "club" ? "Add club entry" : "Add national entry"}</span>
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant={tab === "club" ? "default" : "outline"}
          onClick={() => setTab("club")}
        >
          Club ({clubEntries.length})
        </Button>
        <Button
          variant={tab === "national" ? "default" : "outline"}
          onClick={() => setTab("national")}
        >
          National team ({nationalEntries.length})
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {tab === "club" ? "Club match squads" : "National team match squads"}
          </CardTitle>
          <CardDescription>
            Participation detail — lineup status, minutes, goals, cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <Input
              aria-label="Search squad entries by player"
              placeholder="Search by player…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-xs"
            />
            <Select value={matchFilter} onValueChange={(v) => setMatchFilter(v ?? "all")}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="All matches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All matches</SelectItem>
                {matches.map((m) => (
                  <SelectItem key={m.matchId} value={m.matchId.toString()}>
                    {m.matchDate} — {fixtureLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {body ?? (
            tab === "club" ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Club</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detail</TableHead>
                    {canWrite && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClub.map((s) => (
                    <TableRow key={clubEntryKey(s)}>
                      <TableCell className="whitespace-nowrap">
                        {matchLabels.get(s.matchId) ?? `#${s.matchId}`}
                      </TableCell>
                      <TableCell>{clubNames.get(s.clubId) ?? `#${s.clubId}`}</TableCell>
                      <TableCell className="font-medium">
                        {playerNames.get(s.playerId) ?? `#${s.playerId}`}
                        {s.captain && <Badge className="ml-2">C</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.lineupStatus}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {statLine(s)}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Edit entry"
                              aria-label="Edit squad entry"
                              render={
                                <Link
                                  to="/manage/squads/club/$key"
                                  params={{ key: clubEntryKey(s) }}
                                />
                              }
                            >
                              <PencilSimpleIcon />
                            </Button>
                            <DeleteButton
                              name="squad entry"
                              onConfirm={async () => {
                                await deleteClubSquad(s.matchId, s.clubId, s.playerId);
                                await refresh();
                              }}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filteredClub.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={canWrite ? 6 : 5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No club squad entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detail</TableHead>
                    {canWrite && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNational.map((s) => (
                    <TableRow key={`${s.matchId}-${s.nationalTeam}-${s.playerId}`}>
                      <TableCell className="whitespace-nowrap">
                        {matchLabels.get(s.matchId) ?? `#${s.matchId}`}
                      </TableCell>
                      <TableCell>{s.nationalTeam}</TableCell>
                      <TableCell className="font-medium">
                        {playerNames.get(s.playerId) ?? `#${s.playerId}`}
                        {s.captain && <Badge className="ml-2">C</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.lineupStatus}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {statLine(s)}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title="Edit entry"
                              aria-label="Edit squad entry"
                              render={
                                <Link
                                  to="/manage/squads/national/$key"
                                  params={{ key: nationalEntryKey(s) }}
                                  search={{ team: s.nationalTeam }}
                                />
                              }
                            >
                              <PencilSimpleIcon />
                            </Button>
                            <DeleteButton
                              name="squad entry"
                              onConfirm={async () => {
                                await deleteNationalSquad(s.matchId, s.nationalTeam, s.playerId);
                                await refresh();
                              }}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filteredNational.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={canWrite ? 6 : 5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No national squad entries found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
