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
import { deleteMatch, fixtureLabel } from "@/lib/matches";
import { useMatches } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export function MatchesPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("matches:write");
  const {
    data: allMatches = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useMatches();
  const error = queryError ? parseApiError(queryError) : null;
  const [query, setQuery] = useState("");

  const matches = useMemo(
    () => [...allMatches].sort((a, b) => b.matchDate.localeCompare(a.matchDate)),
    [allMatches],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter((m) =>
      fixtureLabel(m).toLowerCase().includes(q) ||
      (m.competition ?? "").toLowerCase().includes(q) ||
      (m.venue ?? "").toLowerCase().includes(q),
    );
  }, [matches, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Matches
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Add matches that club and national squads attach to."
              : "Read-only access — editing needs the matches:write permission."}
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/manage/matches/new" />}
            >
              <PlusIcon />
              <span>Add match</span>
            </Button>
            <Button nativeButton={false} render={<Link to="/manage/matches/record" />}>
              <PlusIcon />
              <span>Record full match</span>
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All matches ({matches.length})</CardTitle>
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
                  {canWrite && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((m) => (
                  <TableRow key={m.matchId}>
                    <TableCell className="whitespace-nowrap font-medium">
                      {m.matchDate}
                    </TableCell>
                    <TableCell>{fixtureLabel(m)}</TableCell>
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
                                to="/manage/matches/$matchId"
                                params={{ matchId: String(m.matchId) }}
                              />
                            }
                          >
                            <PencilSimpleIcon />
                          </Button>
                          <DeleteButton
                            name={`match on ${m.matchDate}`}
                            onConfirm={async () => {
                              await deleteMatch(m.matchId);
                              await refetch();
                            }}
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
