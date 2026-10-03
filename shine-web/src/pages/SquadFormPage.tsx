import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormError } from "@/components/data-ui";
import { parseOptionalInt } from "@/lib/forms";
import { listClubs, type Club } from "@/lib/clubs";
import { fixtureLabel, listMatches, type Match } from "@/lib/matches";
import { listPlayers, type Player } from "@/lib/players";
import {
  EMPTY_SQUAD_FIELDS,
  LINEUP_STATUSES,
  createClubSquad,
  createNationalSquad,
  listClubSquads,
  listNationalSquads,
  updateClubSquad,
  updateNationalSquad,
  type ClubSquad,
  type NationalSquad,
  type SquadFields,
} from "@/lib/squads";
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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LINEUP_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
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
        <Input
          id={`${idPrefix}-pos`}
          value={value.position}
          onChange={(e) => onChange({ position: e.target.value })}
          placeholder="e.g. Forward"
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
      <Select value={value} onValueChange={(v) => onChange(v ?? "")} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function parseClubKey(key: string): [number, number, number] | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return null;
  return parts as [number, number, number];
}

function parseNationalKey(key: string): [number, number] | null {
  const parts = key.split("-").map(Number);
  if (parts.length !== 2 || parts.some((n) => !Number.isInteger(n))) return null;
  return parts as [number, number];
}

export function SquadFormPage({
  kind,
  entryKey,
  team,
}: {
  kind: "club" | "national";
  entryKey?: string;
  team?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("squads:write");
  const navigate = useNavigate();
  const editing = entryKey !== undefined;

  const [matches, setMatches] = useState<Match[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matchId, setMatchId] = useState("");
  const [clubId, setClubId] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [nationalTeam, setNationalTeam] = useState(team ?? "");
  const [fields, setFields] = useState<FieldsState>(() => fieldsFrom(null));
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (kind === "club") {
          const [m, c, p, cs] = await Promise.all([
            listMatches(),
            listClubs(),
            listPlayers(),
            entryKey ? listClubSquads() : Promise.resolve(null),
          ]);
          if (cancelled) return;
          setMatches([...m].sort((a, b) => b.matchDate.localeCompare(a.matchDate)));
          setClubs(c);
          setPlayers(p);
          if (entryKey) {
            const parsed = parseClubKey(entryKey);
            const found: ClubSquad | undefined =
              parsed
                ? (cs ?? []).find(
                    (s) =>
                      s.matchId === parsed[0] &&
                      s.clubId === parsed[1] &&
                      s.playerId === parsed[2],
                  )
                : undefined;
            if (!found) {
              setNotFound(true);
            } else {
              setMatchId(String(found.matchId));
              setClubId(String(found.clubId));
              setPlayerId(String(found.playerId));
              setFields(fieldsFrom(found));
            }
          }
        } else {
          const [m, p, ns] = await Promise.all([
            listMatches(),
            listPlayers(),
            entryKey ? listNationalSquads() : Promise.resolve(null),
          ]);
          if (cancelled) return;
          setMatches([...m].sort((a, b) => b.matchDate.localeCompare(a.matchDate)));
          setPlayers(p);
          if (entryKey) {
            const parsed = parseNationalKey(entryKey);
            const found: NationalSquad | undefined =
              parsed && team
                ? (ns ?? []).find(
                    (s) =>
                      s.matchId === parsed[0] &&
                      s.playerId === parsed[1] &&
                      s.nationalTeam === team,
                  )
                : undefined;
            if (!found) {
              setNotFound(true);
            } else {
              setMatchId(String(found.matchId));
              setNationalTeam(found.nationalTeam);
              setPlayerId(String(found.playerId));
              setFields(fieldsFrom(found));
            }
          }
        }
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per entry
  }, []);

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
        const teamName = nationalTeam.trim();
        if (editing && entryKey) {
          const parsed = parseNationalKey(entryKey);
          if (!parsed || !team) throw new Error("Invalid squad entry reference.");
          await updateNationalSquad(parsed[0], team, parsed[1], dto);
        } else {
          await createNationalSquad({
            ...dto,
            matchId: Number(matchId),
            nationalTeam: teamName,
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
          <Button variant="outline" render={<Link to="/manage/squads" />}>
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

  if (notFound) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Squad entry not found</CardTitle>
          <CardDescription>
            The entry you are looking for does not exist.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" render={<Link to="/manage/squads" />}>
            <ArrowLeftIcon />
            Back to squads
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
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
              options={matches.map((m) => ({
                value: m.matchId.toString(),
                label: `${m.matchDate} — ${fixtureLabel(m)}`,
              }))}
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
              <Field label="National team" htmlFor="sq-team">
                <Input
                  id="sq-team"
                  required
                  disabled={editing}
                  value={nationalTeam}
                  onChange={(e) => setNationalTeam(e.target.value)}
                  placeholder="e.g. Malawi, Malawi U20, Malawi Women"
                />
              </Field>
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
                      (kind === "club" ? !clubId : !nationalTeam.trim())))
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
