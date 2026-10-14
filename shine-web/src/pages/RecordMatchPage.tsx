import { useEffect, useState } from "react";
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
import { Field, FormError } from "@/components/data-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseOptionalInt } from "@/lib/forms";
import { createClub, listClubs, type Club } from "@/lib/clubs";
import {
  SQUAD_STATUSES,
  createMatchRecord,
  type MatchRecordResult,
  type MatchRecordSquadRow,
} from "@/lib/matchRecords";
import { parseApiError } from "@/lib/users";

interface Row extends MatchRecordSquadRow {
  key: number;
}

const STATUS_LABELS: Record<string, string> = {
  starter: "Starter",
  substitute: "Substitute",
  unused_sub: "Unused sub",
  reserve: "Reserve",
  suspended: "Suspended",
  injured: "Injured",
};

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
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {clubs.map((c) => (
          <SelectItem key={c.clubId} value={String(c.clubId)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

let nextKey = 1;
function emptyRow(homeClubId: number): Row {
  return {
    key: nextKey++,
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
  const [clubs, setClubs] = useState<Club[]>([]);
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

  useEffect(() => {
    listClubs()
      .then(setClubs)
      .catch(() => setClubs([]));
  }, []);

  async function onCreateClub(e: React.FormEvent) {
    e.preventDefault();
    const name = newClubName.trim();
    if (!name) return;
    setCreatingClub(true);
    try {
      const created = await createClub({
        name,
        city: newClubCity.trim() || undefined,
        country: "Malawi",
        sourceUrl: sourceUrl.trim() || undefined,
      });
      const all = await listClubs();
      setClubs(all);
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
                    to="/data/matches/$matchId"
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
                  <form
                    onSubmit={onCreateClub}
                    className="grid gap-2 rounded-xl border border-border p-3 sm:grid-cols-[1fr_10rem_auto]"
                  >
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
                      <Button type="submit" size="sm" disabled={creatingClub}>
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
                  </form>
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
                <Select
                  value={String(r.clubId)}
                  onValueChange={(v) => updateRow(r.key, { clubId: Number(v) })}
                >
                  <SelectTrigger aria-label="Side" className="w-full">
                    <SelectValue placeholder="Side" />
                  </SelectTrigger>
                  <SelectContent>
                    {homeClubId && (
                      <SelectItem value={homeClubId}>
                        {clubs.find((c) => c.clubId === Number(homeClubId))?.shortName ?? "Home"}
                      </SelectItem>
                    )}
                    {awayClubId && (
                      <SelectItem value={awayClubId}>
                        {clubs.find((c) => c.clubId === Number(awayClubId))?.shortName ?? "Away"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={r.lineupStatus}
                  onValueChange={(v) => updateRow(r.key, { lineupStatus: v })}
                >
                  <SelectTrigger aria-label="Lineup status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SQUAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${r.name || "row"}`}
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                >
                  <TrashIcon />
                </Button>
                <Input
                  aria-label="Position"
                  value={r.position ?? ""}
                  onChange={(e) => updateRow(r.key, { position: e.target.value })}
                  placeholder="Position (optional)"
                  className="sm:col-span-2"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={r.captain}
                    onChange={(e) => updateRow(r.key, { captain: e.target.checked })}
                  />
                  Captain
                </label>
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setRows((rs) => [...rs, emptyRow(Number(homeClubId) || 0)])
                }
              >
                <PlusIcon />
                Add player
              </Button>
              {!homeClubId && (
                <p className="text-xs text-muted-foreground">
                  Pick the clubs above first so each row gets the right side.
                </p>
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
