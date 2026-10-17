import { useMemo, useState } from "react";
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
import { deleteNationalTeam } from "@/lib/nationalTeams";
import { useNationalTeams } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export function NationalTeamsPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("nationalteams:write");
  const {
    data: teams = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useNationalTeams();
  const error = queryError ? parseApiError(queryError) : null;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.shortName ?? "").toLowerCase().includes(q) ||
        (t.level ?? "").toLowerCase().includes(q) ||
        (t.gender ?? "").toLowerCase().includes(q),
    );
  }, [teams, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            National teams
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Manage the national sides players attach to."
              : "Read-only access — editing needs the nationalteams:write permission."}
          </p>
        </div>
        {canWrite && (
          <Button
            nativeButton={false}
            render={<Link to="/manage/national-teams/new" />}
          >
            <PlusIcon />
            <span>Add national team</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All national teams ({teams.length})</CardTitle>
          <CardDescription>
            One canonical record per side — squad entries attach to these
            instead of free text.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            aria-label="Search national teams by name"
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
              <Button size="sm" variant="outline" onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Country</TableHead>
                    {canWrite && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.nationalTeamId}>
                      <TableCell className="font-medium">
                        {t.name}
                        {t.shortName && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {t.shortName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.gender ? (
                          <Badge variant="secondary">{t.gender}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{t.level ?? "—"}</TableCell>
                      <TableCell>{t.country}</TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title={`Edit ${t.name}`}
                              aria-label={`Edit ${t.name}`}
                              nativeButton={false}
                              render={
                                <Link
                                  to="/manage/national-teams/$nationalTeamId"
                                  params={{ nationalTeamId: String(t.nationalTeamId) }}
                                />
                              }
                            >
                              <PencilSimpleIcon />
                            </Button>
                            <DeleteButton
                              name={t.name}
                              onConfirm={async () => {
                                await deleteNationalTeam(t.nationalTeamId);
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
                        No national teams found.
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
