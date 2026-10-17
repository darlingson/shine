import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { clubMatchLabel, deleteClubMatch } from "@/lib/clubMatches";
import {
  deleteNationalTeamMatch,
  nationalTeamMatchLabel,
} from "@/lib/nationalTeamMatches";
import { useClubMatches, useNationalTeamMatches } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

type Kind = "club" | "national";

interface MatchRow {
  matchId: number;
  matchDate: string;
  competition?: string | null;
  venue?: string | null;
  label: string;
}

export function MatchesPage({ kind }: { kind: Kind }) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("matches:write");
  const clubQuery = useClubMatches();
  const nationalQuery = useNationalTeamMatches();
  const {
    isLoading: loading,
    error: queryError,
    refetch,
  } = kind === "club" ? clubQuery : nationalQuery;
  const error = queryError ? parseApiError(queryError) : null;
  const [query, setQuery] = useState("");

  const isClub = kind === "club";

  const matches = useMemo<MatchRow[]>(() => {
    const rows: MatchRow[] = isClub
      ? (clubQuery.data ?? []).map((m) => ({
          matchId: m.matchId,
          matchDate: m.matchDate,
          competition: m.competition,
          venue: m.venue,
          label: clubMatchLabel(m),
        }))
      : (nationalQuery.data ?? []).map((m) => ({
          matchId: m.matchId,
          matchDate: m.matchDate,
          competition: m.competition,
          venue: m.venue,
          label: nationalTeamMatchLabel(m),
        }));
    return rows.sort((a, b) => b.matchDate.localeCompare(a.matchDate));
  }, [isClub, clubQuery.data, nationalQuery.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter(
      (m) =>
        m.label.toLowerCase().includes(q) ||
        (m.competition ?? "").toLowerCase().includes(q) ||
        (m.venue ?? "").toLowerCase().includes(q),
    );
  }, [matches, query]);

  async function remove(id: number) {
    if (isClub) await deleteClubMatch(id);
    else await deleteNationalTeamMatch(id);
    await refetch();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            {isClub ? "Club matches" : "National team matches"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? isClub
                ? "Matches between two clubs that club squads attach to."
                : "Matches involving national teams that national squads attach to."
              : "Read-only access — editing needs the matches:write permission."}
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  to={
                    isClub
                      ? "/manage/matches/club/new"
                      : "/manage/matches/national/new"
                  }
                />
              }
            >
              <PlusIcon />
              <span>Add match</span>
            </Button>
            {isClub && (
              <Button
                nativeButton={false}
                render={<Link to="/manage/matches/club/record" />}
              >
                <PlusIcon />
                <span>Record full match</span>
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isClub ? "Club matches" : "National team matches"} ({matches.length})
          </CardTitle>
          <CardDescription>
            Newest first. Squads reference these records.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            aria-label="Search matches by team, competition, or venue"
            placeholder="Search by team, competition, venue…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2">
              <p className="text-sm text-destructive">{error}</p>
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Fixture</TableHead>
                    <TableHead>Competition</TableHead>
                    <TableHead>Venue</TableHead>
                    {canWrite && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.matchId}>
                      <TableCell className="whitespace-nowrap font-medium">
                        {m.matchDate}
                      </TableCell>
                      <TableCell>{m.label}</TableCell>
                      <TableCell>
                        {m.competition || (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {m.venue || (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title={`Edit match ${m.matchId}`}
                              aria-label={`Edit match ${m.matchId}`}
                              nativeButton={false}
                              render={
                                <Link
                                  to={
                                    isClub
                                      ? "/manage/matches/club/$matchId"
                                      : "/manage/matches/national/$matchId"
                                  }
                                  params={{ matchId: String(m.matchId) }}
                                />
                              }
                            >
                              <PencilSimpleIcon />
                            </Button>
                            <DeleteButton
                              name={`match on ${m.matchDate}`}
                              onConfirm={() => remove(m.matchId)}
                            />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={canWrite ? 5 : 4}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No matches found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
