import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { DownloadSimpleIcon, PencilSimpleIcon, PlusIcon } from "@phosphor-icons/react";
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
import { clubsExportHref, deleteClub } from "@/lib/clubs";
import { useClubs } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

export function ClubsPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("clubs:write");
  const {
    data: clubs = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useClubs();
  const error = queryError ? parseApiError(queryError) : null;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.city ?? "").toLowerCase().includes(q) ||
        (c.shortName ?? "").toLowerCase().includes(q),
    );
  }, [clubs, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold tracking-tight">
            Clubs
          </h1>
          <p className="text-sm text-muted-foreground">
            {canWrite
              ? "Add clubs and keep their records up to date."
              : "Read-only access — editing needs the clubs:write permission."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<a href={clubsExportHref("csv")} />}>
            <DownloadSimpleIcon />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" render={<a href={clubsExportHref("json")} />}>
            <span>Export JSON</span>
          </Button>
          {canWrite && (
            <Button nativeButton={false} render={<Link to="/manage/clubs/new" />}>
              <PlusIcon />
              <span>Add club</span>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All clubs ({clubs.length})</CardTitle>
          <CardDescription>
            Team registry — players and matches attach to these records.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Input
            aria-label="Search clubs by name or city"
            placeholder="Search by name or city…"
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
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Founded</TableHead>
                    {canWrite && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.clubId}>
                      <TableCell className="font-medium">
                        {c.name}
                        {c.shortName && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {c.shortName}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{c.city ?? "—"}</TableCell>
                      <TableCell>{c.country}</TableCell>
                      <TableCell>{c.foundedYear ?? "—"}</TableCell>
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
                                  to="/manage/clubs/$clubId"
                                  params={{ clubId: String(c.clubId) }}
                                />
                              }
                            >
                              <PencilSimpleIcon />
                            </Button>
                            <DeleteButton
                              name={c.name}
                              onConfirm={async () => {
                              await deleteClub(c.clubId);
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
                        No clubs found.
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
