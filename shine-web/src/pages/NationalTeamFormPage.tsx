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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormError } from "@/components/data-ui";
import {
  NATIONAL_TEAM_GENDERS,
  NATIONAL_TEAM_LEVELS,
  createNationalTeam,
  updateNationalTeam,
  type NationalTeam,
  type NationalTeamForm,
} from "@/lib/nationalTeams";
import { useNationalTeam } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

const NONE = "__none__";

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

function OptionalSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <Select
      value={value || NONE}
      onValueChange={(v) => onChange(!v || v === NONE ? "" : v)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue>
          {(v: unknown) =>
            typeof v === "string" && v !== NONE && v !== "" ? v : "Not set"
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Not set</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
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
        </CardContent>
      </Card>
    </div>
  );
}
