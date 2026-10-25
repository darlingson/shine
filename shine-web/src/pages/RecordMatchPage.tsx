import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
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
import { Field, FormError } from "@/components/data-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseOptionalInt } from "@/lib/forms";
import { createClub, type Club } from "@/lib/clubs";
import { useClubs } from "@/lib/queries";
import {
  SQUAD_STATUSES,
  SQUAD_STATUS_LABELS,
  createMatchRecord,
  type MatchRecordResult,
  type MatchRecordSquadRow,
} from "@/lib/matchRecords";
import { parseApiError } from "@/lib/users";

interface Row extends MatchRecordSquadRow {
  key: number;
}

/** Label-resolved select: never shows raw ids, whatever the popup state. */
function LabeledSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger id={id} aria-label={label} className="w-full">
        <SelectValue>
          {(v: unknown) => {
            if (typeof v !== "string" || v === "") return placeholder;
            return options.find((o) => o.value === v)?.label ?? placeholder;
          }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Theme-aware club picker (native selects ignore dark mode). */
function ClubPicker({
  id,
  value,
  onChange,
  clubs,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  clubs: Club[];
  placeholder: string;
}) {
  return (
    <LabeledSelect
      id={id}
      label="Club"
      value={value}
      onChange={onChange}
      options={clubs.map((c) => ({ value: String(c.clubId), label: c.name }))}
      placeholder={placeholder}
    />
  );
}

function emptyRow(key: number, homeClubId: number): Row {
  return {
    key,
    clubId: homeClubId,
    name: "",
    position: "",
    shirtNumber: null,
    lineupStatus: "starter",
    minutesPlayed: null,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    captain: false,
  };
}

/** Single-shot match recording: match + both squads in one request. */
export function RecordMatchPage() {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("matches:write");
  const canCreateClub = hasPermission("clubs:write");
  const { data: clubs = [], refetch: refetchClubs } = useClubs();
  const [matchDate, setMatchDate] = useState("");
  const [competition, setCompetition] = useState("");
  const [season, setSeason] = useState("");
  const [homeClubId, setHomeClubId] = useState("");
  const [awayClubId, setAwayClubId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [venue, setVenue] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchRecordResult | null>(null);
  const [showNewClub, setShowNewClub] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubCity, setNewClubCity] = useState("");
  const [creatingClub, setCreatingClub] = useState(false);
  const keyRef = useRef(1);

  function addRow() {
    const key = keyRef.current++;
    setRows((rs) => [...rs, emptyRow(key, Number(homeClubId) || 0)]);
  }

  async function onCreateClub() {
    const name = newClubName.trim();
    if (!name || creatingClub) return;
    setCreatingClub(true);
    try {
      const created = await createClub({
        name,
        city: newClubCity.trim() || undefined,
        country: "Malawi",
        sourceUrl: sourceUrl.trim() || undefined,
      });
      await refetchClubs();
      if (!homeClubId) setHomeClubId(String(created.clubId));
      else if (!awayClubId) setAwayClubId(String(created.clubId));
      setNewClubName("");
      setNewClubCity("");
      setShowNewClub(false);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setCreatingClub(false);
    }
  }

  function updateRow(key: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    if (!homeClubId || !awayClubId) {
      setError("Pick both clubs first.");
      setBusy(false);
      return;
    }
    const named = rows.filter((r) => r.name.trim() !== "");
    const unsided = named.filter(
      (r) => String(r.clubId) !== homeClubId && String(r.clubId) !== awayClubId,
    );
    if (unsided.length > 0) {
      setError("Pick a side for every player row.");
      setBusy(false);
      return;
    }
    try {
      const res = await createMatchRecord({
        match: {
          matchDate,
          competition: competition.trim() || undefined,
          season: season.trim() || undefined,
          homeClubId: Number(homeClubId),
          awayClubId: Number(awayClubId),
          homeScore: parseOptionalInt(homeScore),
          awayScore: parseOptionalInt(awayScore),
          venue: venue.trim() || undefined,
          sourceUrl: sourceUrl.trim() || undefined,
        },
        squads: rows
          .filter((r) => r.name.trim() !== "")
          .map(({ key: _key, ...row }) => ({
            ...row,
            name: row.name.trim(),
            position: row.position?.trim() || undefined,
          })),
      });
      setResult(res);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Record match</CardTitle>
          <CardDescription>
            You need the matches:write permission to make changes.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (result) {
    const linked = result.entries.filter((e) => e.decision === "linked").length;
    const unverified = result.entries.filter(
      (e) => e.decision === "linked-unverified",
    ).length;
    return (
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Match recorded
        </h1>
        <Card>
          <CardContent className="pt-6">
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Match</dt>
                <dd>
                  <Link
                    to="/data/matches/club/$matchId"
                    params={{ matchId: String(result.matchId) }}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    #{result.matchId}
                  </Link>
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Players linked</dt>
                <dd>{linked}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Players created</dt>
                <dd>{result.createdPlayerIds.length}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Needs review</dt>
                <dd>{unverified}</dd>
              </div>
            </dl>
            {result.entries.some((e) => e.flag) && (
              <ul className="mt-4 flex flex-col gap-1.5">
                {result.entries
                  .filter((e) => e.flag)
                  .map((e) => (
                    <li
                      key={e.row}
                      className="rounded-lg border border-border bg-muted px-3 py-2 text-sm"
                    >
                      {e.flag}
                    </li>
                  ))}
              </ul>
            )}
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link to="/manage/matches" />}
              >
                <ArrowLeftIcon />
                Back to matches
              </Button>
              <Button onClick={() => setResult(null)}>Record another</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to="/manage/matches" />}
        >
          <ArrowLeftIcon />
          Back to matches
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Record match
        </h1>
        <p className="text-sm text-muted-foreground">
          Match, teams, and both squads in one go. Players link automatically
          when they already exist — new names get created. One source URL
          covers the whole record.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Match date" htmlFor="rm-date">
              <Input
                id="rm-date"
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </Field>
            <Field label="Venue" htmlFor="rm-venue">
              <Input
                id="rm-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Mpira Stadium"
              />
            </Field>
            <Field label="Competition" htmlFor="rm-comp">
              <Input
                id="rm-comp"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                placeholder="e.g. FDH Bank Premiership"
              />
            </Field>
            <Field label="Season" htmlFor="rm-season">
              <Input
                id="rm-season"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. 2026"
              />
            </Field>
            <Field label="Home club" htmlFor="rm-home">
              <ClubPicker
                id="rm-home"
                value={homeClubId}
                onChange={setHomeClubId}
                clubs={clubs}
                placeholder="Select club…"
              />
            </Field>
            <Field label="Away club" htmlFor="rm-away">
              <ClubPicker
                id="rm-away"
                value={awayClubId}
                onChange={setAwayClubId}
                clubs={clubs}
                placeholder="Select club…"
              />
            </Field>
            {canCreateClub && (
              <div className="sm:col-span-2">
                {!showNewClub ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewClub(true)}
                  >
                    <PlusIcon />
                    Club missing? Add it
                  </Button>
                ) : (
                  <div className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_10rem_auto]">
                    <Input
                      aria-label="New club name"
                      required
                      value={newClubName}
                      onChange={(e) => setNewClubName(e.target.value)}
                      placeholder="Club name, e.g. Mighty Wanderers"
                    />
                    <Input
                      aria-label="New club city"
                      value={newClubCity}
                      onChange={(e) => setNewClubCity(e.target.value)}
                      placeholder="City (optional)"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        disabled={creatingClub || newClubName.trim() === ""}
                        onClick={() => void onCreateClub()}
                      >
                        {creatingClub ? "Adding…" : "Add club"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowNewClub(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <Field label="Home score" htmlFor="rm-hs">
              <Input
                id="rm-hs"
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
              />
            </Field>
            <Field label="Away score" htmlFor="rm-as">
              <Input
                id="rm-as"
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Source URL" htmlFor="rm-source">
                <Input
                  id="rm-source"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Squads ({rows.length})
            </CardTitle>
            <CardDescription>
              Type names as on the team sheet — existing players link
              automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {rows.map((r) => (
              <div
                key={r.key}
                className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_7rem_8rem_auto]"
              >
                <Input
                  aria-label="Player name"
                  required
                  value={r.name}
                  onChange={(e) => updateRow(r.key, { name: e.target.value })}
                  placeholder="Player name"
                />
                <LabeledSelect
                  label="Side"
                  value={
                    r.clubId !== 0 &&
                    (String(r.clubId) === homeClubId ||
                      String(r.clubId) === awayClubId)
                      ? String(r.clubId)
                      : ""
                  }
                  onChange={(v) => updateRow(r.key, { clubId: Number(v) })}
                  options={[
                    ...(homeClubId
                      ? [
                          {
                            value: homeClubId,
                            label:
                              clubs.find((c) => c.clubId === Number(homeClubId))
                                ?.shortName ?? "Home",
                          },
                        ]
                      : []),
                    ...(awayClubId
                      ? [
                          {
                            value: awayClubId,
                            label:
                              clubs.find((c) => c.clubId === Number(awayClubId))
                                ?.shortName ?? "Away",
                          },
                        ]
                      : []),
                  ]}
                  placeholder="Side"
                />
                <LabeledSelect
                  label="Lineup status"
                  value={r.lineupStatus}
                  onChange={(v) => updateRow(r.key, { lineupStatus: v })}
                  options={SQUAD_STATUSES.map((s) => ({
                    value: s,
                    label: SQUAD_STATUS_LABELS[s],
                  }))}
                  placeholder="Status"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${r.name || "row"}`}
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                >
                  <TrashIcon />
                </Button>
                <PositionSelect
                  className="sm:col-span-2"
                  id={`pos-${r.key}`}
                  value={r.position ?? ""}
                  onChange={(code) => updateRow(r.key, { position: code })}
                  placeholder="Position (optional)"
                />
                <label
                  htmlFor={`cap-${r.key}`}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    id={`cap-${r.key}`}
                    type="checkbox"
                    checked={r.captain}
                    onChange={(e) => updateRow(r.key, { captain: e.target.checked })}
                  />
                  Captain
                </label>
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <Button type="button" variant="outline" onClick={addRow}>
                <PlusIcon />
                Add player
              </Button>
              {!homeClubId ? (
                <p className="text-xs text-muted-foreground">
                  Pick the clubs above first so each row gets the right side.
                </p>
              ) : (
                rows.some(
                  (r) =>
                    r.name.trim() !== "" &&
                    String(r.clubId) !== homeClubId &&
                    String(r.clubId) !== awayClubId,
                ) && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Some rows have no side yet — pick one per row before
                    submitting.
                  </p>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <FormError message={error} />
        <div className="flex justify-end">
          <Button type="submit" disabled={busy || rows.length === 0}>
            {busy ? "Recording…" : `Record match (${rows.length} rows)`}
          </Button>
        </div>
      </form>
    </div>
  );
}
