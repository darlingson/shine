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
import { OptionalSelect } from "@/components/OptionalSelect";
import { Field, FormError } from "@/components/data-ui";
import {
  NATIONAL_TEAM_GENDERS,
  NATIONAL_TEAM_LEVELS,
  createNationalTeam,
  updateNationalTeam,
  type NationalTeam,
  type NationalTeamForm,
} from "@/lib/nationalTeams";
import { derivedCoach } from "@/lib/staff";
import { useNationalTeam, useStaffAppointmentPage } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

/** Shared add/edit form. Pass nationalTeamId to edit, omit to create. */
export function NationalTeamFormPage({
  nationalTeamId,
}: {
  nationalTeamId?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("nationalteams:write");
  const editing = nationalTeamId !== undefined;
  const teamQuery = useNationalTeam(nationalTeamId ?? "", editing);

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit national team" : "Add national team"}</CardTitle>
          <CardDescription>
            You need the nationalteams:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/national-teams" />}
          >
            <ArrowLeftIcon />
            Back to national teams
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing && teamQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (editing && (teamQuery.isError || !teamQuery.data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>National team not found</CardTitle>
          <CardDescription>
            No national team with id “{nationalTeamId}” exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/national-teams" />}
          >
            <ArrowLeftIcon />
            Back to national teams
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <NationalTeamForm
      key={nationalTeamId ?? "new"}
      nationalTeamId={nationalTeamId}
      initial={editing ? (teamQuery.data as NationalTeam) : undefined}
    />
  );
}

function NationalTeamForm({
  nationalTeamId,
  initial,
}: {
  nationalTeamId?: string;
  initial?: NationalTeam;
}) {
  const navigate = useNavigate();
  /** The coach of record is a fact of ongoing appointments now — head_coach
   * beats manager beats caretaker. The legacy coach text is only the
   * fallback until the team's appointments exist. */
  const appointmentsQuery = useStaffAppointmentPage(
    {
      nationalTeamId:
        nationalTeamId !== undefined ? Number(nationalTeamId) : undefined,
      ongoing: true,
      pageSize: 100,
    },
    nationalTeamId !== undefined,
  );
  const coachOfRecord =
    derivedCoach(appointmentsQuery.data?.items) ??
    (nationalTeamId !== undefined ? (initial?.coach ?? undefined) : undefined);
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
  const [nickname, setNickname] = useState(initial?.nickname ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [level, setLevel] = useState(initial?.level ?? "");
  const [country, setCountry] = useState(initial?.country ?? "Malawi");
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const dto: NationalTeamForm = {
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      nickname: nickname.trim() || undefined,
      gender: gender.trim() || undefined,
      level: level.trim() || undefined,
      country: country.trim() || "Malawi",
      sourceUrl: sourceUrl.trim() || undefined,
    };
    try {
      if (nationalTeamId !== undefined)
        await updateNationalTeam(Number(nationalTeamId), dto);
      else await createNationalTeam(dto);
      await navigate({ to: "/manage/national-teams" });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const editing = nationalTeamId !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to="/manage/national-teams" />}
        >
          <ArrowLeftIcon />
          Back to national teams
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit national team" : "Add national team"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "Update the record. Changes apply immediately."
            : "Register a national side that squad entries attach to."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="nt-name">
              <Input
                id="nt-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Malawi Women"
              />
            </Field>
            <Field label="Short name" htmlFor="nt-short">
              <Input
                id="nt-short"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. MWI"
              />
            </Field>
            <Field label="Nickname" htmlFor="nt-nickname">
              <Input
                id="nt-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. The Scorchers"
              />
            </Field>
            <Field label="Gender" htmlFor="nt-gender">
              <OptionalSelect
                id="nt-gender"
                value={gender}
                onChange={setGender}
                options={NATIONAL_TEAM_GENDERS}
              />
            </Field>
            <Field label="Level" htmlFor="nt-level">
              <OptionalSelect
                id="nt-level"
                value={level}
                onChange={setLevel}
                options={NATIONAL_TEAM_LEVELS}
              />
            </Field>
            <Field label="Country" htmlFor="nt-country">
              <Input
                id="nt-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </Field>
            <Field label="Source URL" htmlFor="nt-source">
              <Input
                id="nt-source"
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
                render={<Link to="/manage/national-teams" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || name.trim() === ""}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add team"}
              </Button>
            </div>
          </form>
          {editing && (
            <p className="mt-3 text-sm text-muted-foreground">
              Coach of record:{" "}
              <span className="font-medium text-foreground">
                {coachOfRecord ?? "none yet"}
              </span>{" "}
              — derived from this side's ongoing staff appointments (head coach
              → manager → caretaker). Manage those under{" "}
              <Link
                to="/manage/staff"
                className="text-primary underline-offset-4 hover:underline"
              >
                Manage → Staff
              </Link>
              ; the old coach text field is retired.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
