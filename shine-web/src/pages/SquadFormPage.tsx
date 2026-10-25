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
import { PositionSelect } from "@/components/PositionSelect";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Combobox } from "@/components/ui/combobox";
import { Field, FormError } from "@/components/data-ui";
import { parseOptionalInt } from "@/lib/forms";
import { clubMatchLabel } from "@/lib/clubMatches";
import { nationalTeamMatchLabel } from "@/lib/nationalTeamMatches";
import { type Club } from "@/lib/clubs";
import { type Player } from "@/lib/players";
import {
  useClubMatches,
  useClubSquads,
  useClubs,
  useNationalSquads,
  useNationalTeamMatches,
  useNationalTeams,
  usePlayers,
} from "@/lib/queries";
import {
  nationalTeamLabel,
  type NationalTeam,
} from "@/lib/nationalTeams";
import {
  EMPTY_SQUAD_FIELDS,
  LINEUP_STATUSES,
  createClubSquad,
  createNationalSquad,
  updateClubSquad,
  updateNationalSquad,
  type ClubSquad,
  type NationalSquad,
  type SquadFields,
} from "@/lib/squads";
import { SQUAD_STATUS_LABELS } from "@/lib/matchRecords";
import { parseApiError } from "@/lib/users";

interface FieldsState {
  lineupStatus: string;
  shirtNumber: string;
  position: string;
  minutesPlayed: string;
  goals: string;
  assists: string;
  yellowCards: string;
  redCards: string;
  captain: boolean;
  sourceUrl: string;
  notes: string;
}

function fieldsFrom(s: SquadFields | null): FieldsState {
  const base = s ?? EMPTY_SQUAD_FIELDS;
  return {
    lineupStatus: base.lineupStatus,
    shirtNumber: base.shirtNumber?.toString() ?? "",
    position: base.position ?? "",
    minutesPlayed: base.minutesPlayed?.toString() ?? "",
    goals: base.goals.toString(),
    assists: base.assists.toString(),
    yellowCards: base.yellowCards.toString(),
    redCards: base.redCards.toString(),
    captain: base.captain,
    sourceUrl: base.sourceUrl ?? "",
    notes: base.notes ?? "",
  };
}

function toSquadFields(f: FieldsState): SquadFields {
  const num = (v: string) => parseOptionalInt(v) ?? 0;
  return {
    lineupStatus: f.lineupStatus,
    shirtNumber: parseOptionalInt(f.shirtNumber),
    position: f.position.trim() || undefined,
    minutesPlayed: parseOptionalInt(f.minutesPlayed),
    goals: num(f.goals),
    assists: num(f.assists),
    yellowCards: num(f.yellowCards),
    redCards: num(f.redCards),
    captain: f.captain,
    sourceUrl: f.sourceUrl.trim() || undefined,
    notes: f.notes.trim() || undefined,
  };
}

function SquadFieldsForm({
  value,
  onChange,
  idPrefix,
}: {
  value: FieldsState;
  onChange: (patch: Partial<FieldsState>) => void;
  idPrefix: string;
}) {
  return (
    <>
      <Field label="Lineup status" htmlFor={`${idPrefix}-status`}>
        <Select
          value={value.lineupStatus}
          onValueChange={(v) => onChange({ lineupStatus: v ?? "starter" })}
        >
          <SelectTrigger id={`${idPrefix}-status`}>
            <SelectValue>
              {(v: unknown) =>
                typeof v === "string" && v !== ""
                  ? (SQUAD_STATUS_LABELS[v] ?? v)
                  : "Select…"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {LINEUP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {SQUAD_STATUS_LABELS[s] ?? s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Shirt number" htmlFor={`${idPrefix}-shirt`}>
        <Input
          id={`${idPrefix}-shirt`}
          type="number"
          min={0}
          value={value.shirtNumber}
          onChange={(e) => onChange({ shirtNumber: e.target.value })}
        />
      </Field>
      <Field label="Position" htmlFor={`${idPrefix}-pos`}>
        <PositionSelect
          id={`${idPrefix}-pos`}
          value={value.position}
          onChange={(code) => onChange({ position: code })}
        />
      </Field>
      <Field label="Minutes played" htmlFor={`${idPrefix}-min`}>
        <Input
          id={`${idPrefix}-min`}
          type="number"
          min={0}
          value={value.minutesPlayed}
          onChange={(e) => onChange({ minutesPlayed: e.target.value })}
        />
      </Field>
      <Field label="Goals" htmlFor={`${idPrefix}-g`}>
        <Input
          id={`${idPrefix}-g`}
          type="number"
          min={0}
          value={value.goals}
          onChange={(e) => onChange({ goals: e.target.value })}
        />
      </Field>
      <Field label="Assists" htmlFor={`${idPrefix}-a`}>
        <Input
          id={`${idPrefix}-a`}
          type="number"
          min={0}
          value={value.assists}
          onChange={(e) => onChange({ assists: e.target.value })}
        />
      </Field>
      <Field label="Yellow cards" htmlFor={`${idPrefix}-y`}>
        <Input
          id={`${idPrefix}-y`}
          type="number"
          min={0}
          value={value.yellowCards}
          onChange={(e) => onChange({ yellowCards: e.target.value })}
        />
      </Field>
      <Field label="Red cards" htmlFor={`${idPrefix}-r`}>
        <Input
          id={`${idPrefix}-r`}
          type="number"
          min={0}
          value={value.redCards}
          onChange={(e) => onChange({ redCards: e.target.value })}
        />
      </Field>
      <div className="flex items-center gap-2 pt-6">
        <input
          id={`${idPrefix}-cpt`}
          type="checkbox"
          className="size-4 accent-primary"
          checked={value.captain}
          onChange={(e) => onChange({ captain: e.target.checked })}
        />
        <Label htmlFor={`${idPrefix}-cpt`}>Captain</Label>
      </div>
      <div />
      <div className="sm:col-span-2">
        <Field label="Source URL" htmlFor={`${idPrefix}-src`}>
          <Input
            id={`${idPrefix}-src`}
            type="url"
            value={value.sourceUrl}
            onChange={(e) => onChange({ sourceUrl: e.target.value })}
            placeholder="https://…"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Notes" htmlFor={`${idPrefix}-notes`}>
          <Input
            id={`${idPrefix}-notes`}
            value={value.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Anything worth recording"
          />
        </Field>
      </div>
    </>
  );
}

function EntitySelect({
  id,
  label,
  value,
  disabled,
  placeholder,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Combobox
        id={id}
        aria-label={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        options={options}
      />
    </Field>
  );
}

function parseClubKey(key: string): [number, number, number] | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return null;
  return parts as [number, number, number];
}

function parseNationalKey(key: string): [number, number, number] | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return null;
  return parts as [number, number, number];
}

export function SquadFormPage({
  kind,
  entryKey,
}: {
  kind: "club" | "national";
  entryKey?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("squads:write");
  const editing = entryKey !== undefined;

  const clubMatchesQuery = useClubMatches();
  const nationalMatchesQuery = useNationalTeamMatches();
  const clubsQuery = useClubs();
  const playersQuery = usePlayers();
  const nationalTeamsQuery = useNationalTeams();
  const clubSquadsQuery = useClubSquads(editing && kind === "club");
  const nationalSquadsQuery = useNationalSquads(
    editing && kind === "national",
  );

  const matchOptions =
    kind === "club"
      ? [...(clubMatchesQuery.data ?? [])]
          .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
          .map((m) => ({
            value: m.matchId.toString(),
            label: `${m.matchDate} — ${clubMatchLabel(m)}`,
          }))
      : [...(nationalMatchesQuery.data ?? [])]
          .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
          .map((m) => ({
            value: m.matchId.toString(),
            label: `${m.matchDate} — ${nationalTeamMatchLabel(m)}`,
          }));
  const clubs = clubsQuery.data ?? [];
  const players = playersQuery.data ?? [];
  const nationalTeams = nationalTeamsQuery.data ?? [];
  const loading =
    playersQuery.isLoading ||
    (kind === "club"
      ? clubsQuery.isLoading ||
        clubMatchesQuery.isLoading ||
        clubSquadsQuery.isLoading
      : nationalTeamsQuery.isLoading ||
        nationalMatchesQuery.isLoading ||
        nationalSquadsQuery.isLoading);
  const loadError =
    playersQuery.error ??
    (kind === "club"
      ? (clubsQuery.error ?? clubMatchesQuery.error ?? clubSquadsQuery.error)
      : (nationalTeamsQuery.error ??
        nationalMatchesQuery.error ??
        nationalSquadsQuery.error));

  const title = editing
    ? "Edit squad entry"
    : kind === "club"
      ? "Add club squad entry"
      : "Add national squad entry";

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            You need the squads:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" nativeButton={false} render={<Link to="/manage/squads" />}>
            <ArrowLeftIcon />
            Back to squads
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn't load data</CardTitle>
          <CardDescription>{parseApiError(loadError)}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (editing) {
    const initial = findInitial(kind, entryKey, clubSquadsQuery.data, nationalSquadsQuery.data);
    if (!initial) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Squad entry not found</CardTitle>
            <CardDescription>
              The entry you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" nativeButton={false} render={<Link to="/manage/squads" />}>
              <ArrowLeftIcon />
              Back to squads
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <SquadForm
        key={entryKey}
        kind={kind}
        entryKey={entryKey}
        matchOptions={matchOptions}
        clubs={clubs}
        players={players}
        nationalTeams={nationalTeams}
        initial={initial}
      />
    );
  }

  return (
    <SquadForm
      key="new"
      kind={kind}
      matchOptions={matchOptions}
      clubs={clubs}
      players={players}
      nationalTeams={nationalTeams}
      initial={null}
    />
  );
}

interface SquadInitial {
  matchId: string;
  clubId: string;
  playerId: string;
  nationalTeamId: string;
  fields: FieldsState;
}

function findInitial(
  kind: "club" | "national",
  entryKey: string | undefined,
  clubSquads: ClubSquad[] | undefined,
  nationalSquads: NationalSquad[] | undefined,
): SquadInitial | null {
  if (!entryKey) return null;
  if (kind === "club") {
    const parsed = parseClubKey(entryKey);
    const found = parsed
      ? (clubSquads ?? []).find(
          (s) =>
            s.matchId === parsed[0] &&
            s.clubId === parsed[1] &&
            s.playerId === parsed[2],
        )
      : undefined;
    if (!found) return null;
    return {
      matchId: String(found.matchId),
      clubId: String(found.clubId),
      playerId: String(found.playerId),
      nationalTeamId: "",
      fields: fieldsFrom(found),
    };
  }
  const parsed = parseNationalKey(entryKey);
  const found = parsed
    ? (nationalSquads ?? []).find(
        (s) =>
          s.matchId === parsed[0] &&
          s.nationalTeamId === parsed[1] &&
          s.playerId === parsed[2],
      )
    : undefined;
  if (!found) return null;
  return {
    matchId: String(found.matchId),
    clubId: "",
    playerId: String(found.playerId),
    nationalTeamId: String(found.nationalTeamId),
    fields: fieldsFrom(found),
  };
}

function SquadForm({
  kind,
  entryKey,
  matchOptions,
  clubs,
  players,
  nationalTeams,
  initial,
}: {
  kind: "club" | "national";
  entryKey?: string;
  matchOptions: Array<{ value: string; label: string }>;
  clubs: Club[];
  players: Player[];
  nationalTeams: NationalTeam[];
  initial: SquadInitial | null;
}) {
  const navigate = useNavigate();
  const editing = initial !== null;
  const [matchId, setMatchId] = useState(initial?.matchId ?? "");
  const [clubId, setClubId] = useState(initial?.clubId ?? "");
  const [playerId, setPlayerId] = useState(initial?.playerId ?? "");
  const [nationalTeamId, setNationalTeamId] = useState(
    initial?.nationalTeamId ?? "",
  );
  const [fields, setFields] = useState<FieldsState>(
    () => initial?.fields ?? fieldsFrom(null),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function patch(p: Partial<FieldsState>) {
    setFields((f) => ({ ...f, ...p }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const dto = toSquadFields(fields);
      if (kind === "club") {
        if (editing && entryKey) {
          const parsed = parseClubKey(entryKey);
          if (!parsed) throw new Error("Invalid squad entry reference.");
          await updateClubSquad(parsed[0], parsed[1], parsed[2], dto);
        } else {
          await createClubSquad({
            ...dto,
            matchId: Number(matchId),
            clubId: Number(clubId),
            playerId: Number(playerId),
          });
        }
      } else {
        if (editing && entryKey) {
          const parsed = parseNationalKey(entryKey);
          if (!parsed) throw new Error("Invalid squad entry reference.");
          await updateNationalSquad(parsed[0], parsed[1], parsed[2], dto);
        } else {
          await createNationalSquad({
            ...dto,
            matchId: Number(matchId),
            nationalTeamId: Number(nationalTeamId),
            playerId: Number(playerId),
          });
        }
      }
      await navigate({ to: "/manage/squads" });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const title = editing
    ? "Edit squad entry"
    : kind === "club"
      ? "Add club squad entry"
      : "Add national squad entry";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to="/manage/squads" />}
        >
          <ArrowLeftIcon />
          Back to squads
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "Update the record. Changes apply immediately."
            : "Who featured in a match — and how."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <EntitySelect
              id="sq-match"
              label="Match"
              value={matchId}
              disabled={editing}
              placeholder="Select match…"
              options={matchOptions}
              onChange={setMatchId}
            />
            {kind === "club" ? (
              <EntitySelect
                id="sq-club"
                label="Club"
                value={clubId}
                disabled={editing}
                placeholder="Select club…"
                options={clubs.map((c) => ({
                  value: c.clubId.toString(),
                  label: c.name,
                }))}
                onChange={setClubId}
              />
            ) : (
              <EntitySelect
                id="sq-team"
                label="National team"
                value={nationalTeamId}
                disabled={editing}
                placeholder={
                  nationalTeams.length === 0
                    ? "No national teams yet"
                    : "Select national team…"
                }
                options={nationalTeams.map((t) => ({
                  value: t.nationalTeamId.toString(),
                  label: nationalTeamLabel(t),
                }))}
                onChange={setNationalTeamId}
              />
            )}
            <div className="sm:col-span-2">
              <EntitySelect
                id="sq-player"
                label="Player"
                value={playerId}
                disabled={editing}
                placeholder="Select player…"
                options={players.map((p) => ({
                  value: p.playerId.toString(),
                  label: p.fullName,
                }))}
                onChange={setPlayerId}
              />
            </div>
            <SquadFieldsForm value={fields} onChange={patch} idPrefix="sq" />
            <div className="sm:col-span-2">
              <FormError message={error} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                nativeButton={false}
                render={<Link to="/manage/squads" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  busy ||
                  (!editing &&
                    (!matchId ||
                      !playerId ||
                      (kind === "club" ? !clubId : !nationalTeamId)))
                }
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Add entry"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
