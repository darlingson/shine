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
import {
  deletePlayer,
  listPlayers,
  type Player,
} from "@/lib/players";
import { parseApiError } from "@/lib/users";

export function PlayersPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("players:write");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPlayers(await listPlayers());
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        (p.knownAs ?? "").toLowerCase().includes(q),
    );
  }, [players, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Players
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Add players and keep their records up to date."
              : "Read-only access — editing needs the players:write permission."}
          </p>
        </div>
        {canWrite && (
          <Button render={<Link to="/manage/players/new" />}>
            <PlusIcon />
            <span>Add player</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All players ({players.length})</CardTitle>
          <CardDescription>
            Identity, positions, and status — each with a source.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            aria-label="Search players by name"
            placeholder="Search by name…"
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
              <Button size="sm" variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Positions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Born</TableHead>
                  {canWrite && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.playerId}>
                    <TableCell className="font-medium">
                      {p.fullName}
                      {p.knownAs && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          “{p.knownAs}”
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {[p.positionPrimary, p.positionSecondary]
                        .filter(Boolean)
                        .join(" · ") || (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "active" ? "default" : "secondary"}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.dateOfBirth ?? "—"}</TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title={`Edit ${p.fullName}`}
                            aria-label={`Edit ${p.fullName}`}
                            render={
                              <Link
                                to="/manage/players/$playerId"
                                params={{ playerId: String(p.playerId) }}
                              />
                            }
                          >
                            <PencilSimpleIcon />
                          </Button>
                          <DeleteButton
                            name={p.fullName}
                            onConfirm={async () => {
                              await deletePlayer(p.playerId);
                              await refresh();
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
                      No players found.
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
