import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DownloadSimpleIcon,
  PencilSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react";
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
  competitionsExportHref,
  deleteCompetition,
} from "@/lib/competitions";
import { useCompetitions } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export function CompetitionsPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("competitions:write");
  const {
    data: competitions = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useCompetitions();
  const error = queryError ? parseApiError(queryError) : null;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return competitions;
    return competitions.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.shortName ?? "").toLowerCase().includes(q) ||
        (c.scope ?? "").toLowerCase().includes(q) ||
        (c.region ?? "").toLowerCase().includes(q) ||
        String(c.tier ?? "").includes(q),
    );
  }, [competitions, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Competitions
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Leagues and cups matches attach to — a name here never changes later."
              : "Read-only access — editing needs the competitions:write permission."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            render={<a href={competitionsExportHref("csv")} />}
          >
            <DownloadSimpleIcon />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            render={<a href={competitionsExportHref("json")} />}
          >
            <span>Export JSON</span>
          </Button>
          {canWrite && (
            <Button
              nativeButton={false}
              render={<Link to="/manage/competitions/new" />}
            >
              <PlusIcon />
              <span>Add competition</span>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All competitions ({competitions.length})</CardTitle>
          <CardDescription>
            One stable record per competition — its season names (sponsor
            eras) live under it, so nothing here is ever renamed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            aria-label="Search competitions by name"
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
                    <TableHead>Kind</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Region</TableHead>
                    {canWrite && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.competitionId}>
                      <TableCell className="font-medium">
                        {c.name}
                        {c.shortName && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {c.shortName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{c.kind}</Badge>
                      </TableCell>
                      <TableCell>
                        {c.tier !== null && c.tier !== undefined
                          ? `Tier ${c.tier}`
                          : "—"}
                      </TableCell>
                      <TableCell>{c.scope ?? "—"}</TableCell>
                      <TableCell>{c.region ?? "—"}</TableCell>
                      {canWrite && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              title={`Edit ${c.name}`}
                              aria-label={`Edit ${c.name}`}
                              nativeButton={false}
                              render={
                                <Link
                                  to="/manage/competitions/$competitionId"
                                  params={{ competitionId: String(c.competitionId) }}
                                />
                              }
                            >
                              <PencilSimpleIcon />
                            </Button>
                            <DeleteButton
                              name={c.name}
                              onConfirm={async () => {
                                await deleteCompetition(c.competitionId);
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
                        colSpan={canWrite ? 6 : 5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        {competitions.length === 0
                          ? "No competitions yet — add one to link matches to it."
                          : "No competitions found."}
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
