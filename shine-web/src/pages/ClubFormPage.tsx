import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
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
import { Field, FormError } from "@/components/data-ui";
import { parseOptionalInt } from "@/lib/forms";
import {
  createClub,
  updateClub,
  type Club,
  type ClubForm,
} from "@/lib/clubs";
import { useClub } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

/** Shared add/edit form. Pass clubId to edit, omit to create. */
export function ClubFormPage({ clubId }: { clubId?: string }) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("clubs:write");
  const editing = clubId !== undefined;
  const clubQuery = useClub(clubId ?? "", editing);

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit club" : "Add club"}</CardTitle>
          <CardDescription>
            You need the clubs:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/clubs" />}
          >
            <ArrowLeftIcon />
            Back to clubs
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing && clubQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (editing && (clubQuery.isError || !clubQuery.data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Club not found</CardTitle>
          <CardDescription>
            No club with id “{clubId}” exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/clubs" />}
          >
            <ArrowLeftIcon />
            Back to clubs
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <ClubForm
      key={clubId ?? "new"}
      clubId={clubId}
      initial={editing ? (clubQuery.data as Club) : undefined}
    />
  );
}

function ClubForm({ clubId, initial }: { clubId?: string; initial?: Club }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [country, setCountry] = useState(initial?.country ?? "Malawi");
  const [foundedYear, setFoundedYear] = useState(
    initial?.foundedYear?.toString() ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const dto: ClubForm = {
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      city: city.trim() || undefined,
      country: country.trim() || "Malawi",
      foundedYear: parseOptionalInt(foundedYear),
      sourceUrl: sourceUrl.trim() || undefined,
    };
    try {
      if (clubId !== undefined) await updateClub(Number(clubId), dto);
      else await createClub(dto);
      await navigate({ to: "/manage/clubs" });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const editing = clubId !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to="/manage/clubs" />}
        >
          <ArrowLeftIcon />
          Back to clubs
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit club" : "Add club"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "Update the record. Changes apply immediately."
            : "Register a club that players and matches attach to."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="club-name">
              <Input
                id="club-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mighty Wanderers"
              />
            </Field>
            <Field label="Short name" htmlFor="club-short">
              <Input
                id="club-short"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. Wanderers"
              />
            </Field>
            <Field label="City" htmlFor="club-city">
              <Input
                id="club-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Blantyre"
              />
            </Field>
            <Field label="Country" htmlFor="club-country">
              <Input
                id="club-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </Field>
            <Field label="Founded year" htmlFor="club-founded">
              <Input
                id="club-founded"
                type="number"
                min={1800}
                max={2100}
                value={foundedYear}
                onChange={(e) => setFoundedYear(e.target.value)}
              />
            </Field>
            <Field label="Source URL" htmlFor="club-source">
              <Input
                id="club-source"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <div className="sm:col-span-2">
              <FormError message={error} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                nativeButton={false}
                render={<Link to="/manage/clubs" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add club"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
