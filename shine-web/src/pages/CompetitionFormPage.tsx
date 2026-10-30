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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionalSelect } from "@/components/OptionalSelect";
import { DeleteButton, Field, FormError } from "@/components/data-ui";
import {
  COMPETITION_KINDS,
  COMPETITION_SCOPES,
  createCompetition,
  createCompetitionSeason,
  deleteCompetitionSeason,
  seasonLabel,
  updateCompetition,
  updateCompetitionSeason,
  type Competition,
  type CompetitionForm,
  type CompetitionSeason,
  type CompetitionSeasonForm,
} from "@/lib/competitions";
import { useCompetition, useCompetitionSeasons } from "@/lib/queries";
import { parseApiError } from "@/lib/users";

/** Shared add/edit page. Pass competitionId to edit, omit to create. */
export function CompetitionFormPage({
  competitionId,
}: {
  competitionId?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("competitions:write");
  const editing = competitionId !== undefined;
  const competitionQuery = useCompetition(competitionId ?? "", editing);

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit competition" : "Add competition"}</CardTitle>
          <CardDescription>
            You need the competitions:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/competitions" />}
          >
            <ArrowLeftIcon />
            Back to competitions
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing && competitionQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (editing && (competitionQuery.isError || !competitionQuery.data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competition not found</CardTitle>
          <CardDescription>
            No competition with id “{competitionId}” exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/manage/competitions" />}
          >
            <ArrowLeftIcon />
            Back to competitions
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <CompetitionForm
      key={competitionId ?? "new"}
      competitionId={competitionId}
      initial={editing ? (competitionQuery.data as Competition) : undefined}
    />
  );
}

function CompetitionForm({
  competitionId,
  initial,
}: {
  competitionId?: string;
  initial?: Competition;
}) {
  const navigate = useNavigate();
  const editing = competitionId !== undefined;
  const [name, setName] = useState(initial?.name ?? "");
  const [shortName, setShortName] = useState(initial?.shortName ?? "");
  const [kind, setKind] = useState(initial?.kind ?? "");
  const [tier, setTier] = useState(
    initial?.tier !== null && initial?.tier !== undefined
      ? String(initial.tier)
      : "",
  );
  const [scope, setScope] = useState(initial?.scope ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSaved(false);
    const tierNumber = kind === "league" && tier.trim() !== "" ? Number(tier) : undefined;
    const dto: CompetitionForm = {
      name: name.trim(),
      shortName: shortName.trim() || undefined,
      kind,
      tier:
        kind === "league" &&
        tierNumber !== undefined &&
        Number.isInteger(tierNumber) &&
        tierNumber > 0
          ? tierNumber
          : undefined,
      scope: scope.trim() || undefined,
      region: scope === "regional" && region.trim() ? region.trim() : undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    };
    try {
      if (editing && competitionId !== undefined) {
        await updateCompetition(Number(competitionId), dto);
        setSaved(true);
      } else {
        const created = await createCompetition(dto);
        // Season names are the whole point — land on the editor straight away.
        await navigate({
          to: "/manage/competitions/$competitionId",
          params: { competitionId: String(created.competitionId) },
          replace: true,
        });
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to="/manage/competitions" />}
        >
          <ArrowLeftIcon />
          Back to competitions
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit competition" : "Add competition"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "The identity is stable — season names accrue under it, never rename it."
            : "Register a league or cup that matches attach to."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="comp-name">
              <Input
                id="comp-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='e.g. "Super League", "Southern Region League"'
              />
            </Field>
            <Field label="Short name" htmlFor="comp-short">
              <Input
                id="comp-short"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="e.g. CAF CL"
              />
            </Field>
            <Field label="Kind" htmlFor="comp-kind">
              <OptionalSelect
                id="comp-kind"
                value={kind}
                onChange={setKind}
                options={COMPETITION_KINDS}
                placeholder="Not set"
              />
            </Field>
            {kind === "league" && (
              <Field label="Tier" htmlFor="comp-tier">
                <Input
                  id="comp-tier"
                  type="number"
                  min={1}
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  placeholder="1 = top flight, 2 = second tier…"
                />
              </Field>
            )}
            <Field label="Scope" htmlFor="comp-scope">
              <OptionalSelect
                id="comp-scope"
                value={scope}
                onChange={setScope}
                options={COMPETITION_SCOPES}
              />
            </Field>
            {scope === "regional" && (
              <Field label="Region" htmlFor="comp-region">
                <Input
                  id="comp-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="south / centre / north / cosafa…"
                />
              </Field>
            )}
            <Field label="Source URL" htmlFor="comp-source">
              <Input
                id="comp-source"
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <div className="sm:col-span-2">
              <FormError message={error} />
            </div>
            <div className="flex items-center justify-end gap-3 sm:col-span-2">
              {saved && (
                <span className="text-xs text-muted-foreground">Saved ✓</span>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                nativeButton={false}
                render={<Link to="/manage/competitions" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy || kind.trim() === ""}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add competition"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {editing && competitionId !== undefined && (
        <SeasonsEditor competitionId={Number(competitionId)} />
      )}
    </div>
  );
}

interface SeasonFieldValues {
  label: string;
  name: string;
  startDate: string;
  endDate: string;
  sourceUrl: string;
}

function emptySeasonValues(): SeasonFieldValues {
  return { label: "", name: "", startDate: "", endDate: "", sourceUrl: "" };
}

function seasonValuesFrom(s: CompetitionSeason): SeasonFieldValues {
  return {
    label: s.label ?? "",
    name: s.name ?? "",
    startDate: s.startDate ?? "",
    endDate: s.endDate ?? "",
    sourceUrl: s.sourceUrl ?? "",
  };
}

function toSeasonDto(v: SeasonFieldValues): CompetitionSeasonForm {
  return {
    label: v.label.trim() || undefined,
    name: v.name.trim() || undefined,
    startDate: v.startDate || undefined,
    endDate: v.endDate || undefined,
    sourceUrl: v.sourceUrl.trim() || undefined,
  };
}

/** Named editions of one competition — where sponsor eras accrue. */
function SeasonsEditor({ competitionId }: { competitionId: number }) {
  const {
    data: seasons = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useCompetitionSeasons(competitionId);
  const error = queryError ? parseApiError(queryError) : null;
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function runAndRefetch(op: () => Promise<unknown>) {
    setFormError(null);
    try {
      await op();
      await refetch();
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasons ({seasons.length})</CardTitle>
        <CardDescription>
          The names people actually used — “TNM Super League 2025”, “FDH
          Premiership 2026”, or a yearless edition nobody has dated yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AddSeasonForm
          competitionId={competitionId}
          busyId={busyId}
          setBusyId={setBusyId}
        />
        {formError && <FormError message={formError} />}
        {loading && !formError ? (
          <div className="flex flex-col gap-2">
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
                  <TableHead>Edition</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seasons.map((s) => (
                  <SeasonRow
                    key={s.seasonId}
                    season={s}
                    competitionId={competitionId}
                    busy={busyId === s.seasonId}
                    onBusy={(n) => setBusyId(n)}
                  />
                ))}
                {seasons.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-sm text-muted-foreground"
                    >
                      No seasons yet — add the first edition above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function AddSeasonForm({
    competitionId,
    busyId,
    setBusyId,
  }: {
    competitionId: number;
    busyId: number | null;
    setBusyId: (n: number | null) => void;
  }) {
    const [values, setValues] = useState<SeasonFieldValues>(emptySeasonValues);

    function set(field: keyof SeasonFieldValues, value: string) {
      setValues((prev) => ({ ...prev, [field]: value }));
    }

    async function onAdd(e: React.FormEvent) {
      e.preventDefault();
      if (values.label.trim() === "" && values.name.trim() === "") {
        setFormError("A season needs at least a label or a name.");
        return;
      }
      setBusyId(-1);
      const dto = toSeasonDto(values);
      await runAndRefetch(async () => {
        await createCompetitionSeason(competitionId, dto);
        setValues(emptySeasonValues());
      });
    }

    return (
      <form onSubmit={onAdd} className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2">
        <Field label="Label" htmlFor="season-add-label">
          <Input
            id="season-add-label"
            value={values.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="2026 or 2025/26 (leave empty if unknown)"
          />
        </Field>
        <Field label="Display name" htmlFor="season-add-name">
          <Input
            id="season-add-name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. FDH Premiership 2026"
          />
        </Field>
        <Field label="Start date" htmlFor="season-add-start">
          <Input
            id="season-add-start"
            type="date"
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </Field>
        <Field label="End date" htmlFor="season-add-end">
          <Input
            id="season-add-end"
            type="date"
            value={values.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </Field>
        <Field label="Source URL" htmlFor="season-add-source">
          <Input
            id="season-add-source"
            type="url"
            value={values.sourceUrl}
            onChange={(e) => set("sourceUrl", e.target.value)}
            placeholder="https://…"
          />
        </Field>
        <div className="flex items-end justify-end">
          <Button type="submit" disabled={busyId !== null}>
            {busyId === -1 ? "Saving…" : "Add season"}
          </Button>
        </div>
      </form>
    );
  }

  function SeasonRow({
    season,
    competitionId,
    busy,
    onBusy,
  }: {
    season: CompetitionSeason;
    competitionId: number;
    busy: boolean;
    onBusy: (n: number | null) => void;
  }) {
    const [editing, setEditing] = useState(false);
    const [values, setValues] = useState<SeasonFieldValues>(
      seasonValuesFrom(season),
    );

    function set(field: keyof SeasonFieldValues, value: string) {
      setValues((prev) => ({ ...prev, [field]: value }));
    }

    async function onSave(e: React.FormEvent) {
      e.preventDefault();
      onBusy(season.seasonId);
      const dto = toSeasonDto(values);
      await runAndRefetch(async () => {
        await updateCompetitionSeason(
          competitionId,
          season.seasonId,
          dto,
        );
        setEditing(false);
      });
    }

    if (editing) {
      return (
        <TableRow>
          <TableCell colSpan={4}>
            <form
              onSubmit={onSave}
              className="grid gap-3 sm:grid-cols-2"
            >
              <Field label="Label" htmlFor={`season-${season.seasonId}-label`}>
                <Input
                  id={`season-${season.seasonId}-label`}
                  value={values.label}
                  onChange={(e) => set("label", e.target.value)}
                  placeholder="2026 (empty if unknown)"
                />
              </Field>
              <Field label="Display name" htmlFor={`season-${season.seasonId}-name`}>
                <Input
                  id={`season-${season.seasonId}-name`}
                  value={values.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. TNM Super League 2025"
                />
              </Field>
              <Field
                label="Start date"
                htmlFor={`season-${season.seasonId}-start`}
              >
                <Input
                  id={`season-${season.seasonId}-start`}
                  type="date"
                  value={values.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </Field>
              <Field label="End date" htmlFor={`season-${season.seasonId}-end`}>
                <Input
                  id={`season-${season.seasonId}-end`}
                  type="date"
                  value={values.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </Field>
              <Field
                label="Source URL"
                htmlFor={`season-${season.seasonId}-source`}
              >
                <Input
                  id={`season-${season.seasonId}-source`}
                  type="url"
                  value={values.sourceUrl}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                  placeholder="https://…"
                />
              </Field>
              <div className="flex items-end justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setValues(seasonValuesFrom(season));
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save season"}
                </Button>
              </div>
            </form>
          </TableCell>
        </TableRow>
      );
    }

    return (
      <TableRow>
        <TableCell className="font-medium">{seasonLabel(season)}</TableCell>
        <TableCell>{season.label ?? "—"}</TableCell>
        <TableCell>
          {(season.startDate ?? season.endDate)
            ? `${season.startDate ?? "?"} → ${season.endDate ?? "open"}`
            : "—"}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => {
                setValues(seasonValuesFrom(season));
                setEditing(true);
              }}
            >
              Edit
            </Button>
            <DeleteButton
              name={seasonLabel(season)}
              onConfirm={async () => {
                onBusy(season.seasonId);
                await runAndRefetch(async () => {
                  await deleteCompetitionSeason(
                    competitionId,
                    season.seasonId,
                  );
                });
              }}
            />
          </div>
        </TableCell>
      </TableRow>
    );
  }
}
