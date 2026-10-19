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
import { Combobox } from "@/components/ui/combobox";
import { Field, FormError } from "@/components/data-ui";
import { Label } from "@/components/ui/label";
import { parseOptionalInt } from "@/lib/forms";
import {
  createClubMatch,
  updateClubMatch,
  type ClubMatchForm,
} from "@/lib/clubMatches";
import {
  createNationalTeamMatch,
  updateNationalTeamMatch,
  type NationalTeamMatchForm,
} from "@/lib/nationalTeamMatches";
import { nationalTeamLabel } from "@/lib/nationalTeams";
import {
  useClubMatch,
  useClubs,
  useNationalTeamMatch,
  useNationalTeams,
} from "@/lib/queries";
import { parseApiError } from "@/lib/users";

type Kind = "club" | "national";

interface MatchInitial {
  matchDate: string;
  kickoffTime?: string | null;
  competition?: string | null;
  season?: string | null;
  stage?: string | null;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  homeScore?: number | null;
  awayScore?: number | null;
  venue?: string | null;
  isNeutral?: boolean;
  wentToExtraTime?: boolean;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  sourceUrl?: string | null;
}

/** Shared add/edit form. Pass matchId to edit, omit to create. */
export function MatchFormPage({
  kind,
  matchId,
}: {
  kind: Kind;
  matchId?: string;
}) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("matches:write");
  const editing = matchId !== undefined;
  const isClub = kind === "club";

  const clubMatch = useClubMatch(matchId ?? "", editing && isClub);
  const nationalMatch = useNationalTeamMatch(
    matchId ?? "",
    editing && !isClub,
  );
  const matchQuery = isClub ? clubMatch : nationalMatch;

  const backTo: "/manage/matches/club" | "/manage/matches/national" = isClub
    ? "/manage/matches/club"
    : "/manage/matches/national";
  const backLabel = isClub ? "club matches" : "national team matches";

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit match" : "Add match"}</CardTitle>
          <CardDescription>
            You need the matches:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" nativeButton={false} render={<Link to={backTo} />}>
            <ArrowLeftIcon />
            Back to {backLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (editing && matchQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (editing && (matchQuery.isError || !matchQuery.data)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Match not found</CardTitle>
          <CardDescription>No match with id “{matchId}” exists.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" nativeButton={false} render={<Link to={backTo} />}>
            <ArrowLeftIcon />
            Back to {backLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const initial: MatchInitial | undefined = !matchQuery.data
    ? undefined
    : isClub
      ? {
          matchDate: clubMatch.data!.matchDate,
          competition: clubMatch.data!.competition,
          season: clubMatch.data!.season,
          homeTeamId: clubMatch.data!.homeClubId,
          awayTeamId: clubMatch.data!.awayClubId,
          homeScore: clubMatch.data!.homeScore,
          awayScore: clubMatch.data!.awayScore,
          venue: clubMatch.data!.venue,
          sourceUrl: clubMatch.data!.sourceUrl,
        }
      : {
          matchDate: nationalMatch.data!.matchDate,
          kickoffTime: nationalMatch.data!.kickoffTime,
          competition: nationalMatch.data!.competition,
          season: nationalMatch.data!.season,
          stage: nationalMatch.data!.stage,
          homeTeamId: nationalMatch.data!.homeNationalTeamId,
          awayTeamId: nationalMatch.data!.awayNationalTeamId,
          homeScore: nationalMatch.data!.homeScore,
          awayScore: nationalMatch.data!.awayScore,
          venue: nationalMatch.data!.venue,
          isNeutral: nationalMatch.data!.isNeutral,
          wentToExtraTime: nationalMatch.data!.wentToExtraTime,
          homePenaltyScore: nationalMatch.data!.homePenaltyScore,
          awayPenaltyScore: nationalMatch.data!.awayPenaltyScore,
          sourceUrl: nationalMatch.data!.sourceUrl,
        };

  return (
    <MatchForm
      key={matchId ?? "new"}
      kind={kind}
      matchId={matchId}
      initial={initial}
    />
  );
}

function MatchForm({
  kind,
  matchId,
  initial,
}: {
  kind: Kind;
  matchId?: string;
  initial?: MatchInitial;
}) {
  const navigate = useNavigate();
  const isClub = kind === "club";
  const clubsQuery = useClubs();
  const nationalTeamsQuery = useNationalTeams();
  const teamOptions = isClub
    ? (clubsQuery.data ?? []).map((c) => ({
        value: c.clubId.toString(),
        label: c.name,
      }))
    : (nationalTeamsQuery.data ?? []).map((t) => ({
        value: t.nationalTeamId.toString(),
        label: nationalTeamLabel(t),
      }));
  const teamField = isClub ? "club" : "national team";
  const backTo: "/manage/matches/club" | "/manage/matches/national" = isClub
    ? "/manage/matches/club"
    : "/manage/matches/national";

  const [matchDate, setMatchDate] = useState(initial?.matchDate ?? "");
  const [kickoffTime, setKickoffTime] = useState(
    initial?.kickoffTime?.slice(0, 5) ?? "",
  );
  const [competition, setCompetition] = useState(initial?.competition ?? "");
  const [season, setSeason] = useState(initial?.season ?? "");
  const [stage, setStage] = useState(initial?.stage ?? "");
  const [homeTeamId, setHomeTeamId] = useState(
    initial?.homeTeamId?.toString() ?? "",
  );
  const [awayTeamId, setAwayTeamId] = useState(
    initial?.awayTeamId?.toString() ?? "",
  );
  const [homeScore, setHomeScore] = useState(initial?.homeScore?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(initial?.awayScore?.toString() ?? "");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [isNeutral, setIsNeutral] = useState(initial?.isNeutral ?? false);
  const [wentToExtraTime, setWentToExtraTime] = useState(
    initial?.wentToExtraTime ?? false,
  );
  const [homePenaltyScore, setHomePenaltyScore] = useState(
    initial?.homePenaltyScore?.toString() ?? "",
  );
  const [awayPenaltyScore, setAwayPenaltyScore] = useState(
    initial?.awayPenaltyScore?.toString() ?? "",
  );
  const [sourceUrl, setSourceUrl] = useState(initial?.sourceUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const common = {
      matchDate,
      competition: competition.trim() || undefined,
      season: season.trim() || undefined,
      homeScore: parseOptionalInt(homeScore),
      awayScore: parseOptionalInt(awayScore),
      venue: venue.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    };
    try {
      if (isClub) {
        const dto: ClubMatchForm = {
          ...common,
          homeClubId: homeTeamId ? Number(homeTeamId) : undefined,
          awayClubId: awayTeamId ? Number(awayTeamId) : undefined,
        };
        if (matchId !== undefined) await updateClubMatch(Number(matchId), dto);
        else await createClubMatch(dto);
      } else {
        const dto: NationalTeamMatchForm = {
          ...common,
          kickoffTime: kickoffTime
            ? kickoffTime.length === 5
              ? `${kickoffTime}:00`
              : kickoffTime
            : undefined,
          stage: stage.trim() || undefined,
          homeNationalTeamId: homeTeamId ? Number(homeTeamId) : undefined,
          awayNationalTeamId: awayTeamId ? Number(awayTeamId) : undefined,
          isNeutral,
          wentToExtraTime,
          homePenaltyScore: parseOptionalInt(homePenaltyScore),
          awayPenaltyScore: parseOptionalInt(awayPenaltyScore),
        };
        if (matchId !== undefined)
          await updateNationalTeamMatch(Number(matchId), dto);
        else await createNationalTeamMatch(dto);
      }
      await navigate({ to: backTo });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const editing = matchId !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Button
          variant="link"
          className="px-0"
          nativeButton={false}
          render={<Link to={backTo} />}
        >
          <ArrowLeftIcon />
          Back to {isClub ? "club matches" : "national team matches"}
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit" : "Add"} {isClub ? "club match" : "national team match"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "Update the record. Changes apply immediately."
            : "Record a new match that squads can attach to."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <Field label="Match date" htmlFor="match-date">
              <Input
                id="match-date"
                type="date"
                required
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </Field>
            {!isClub && (
              <Field label="Kickoff time" htmlFor="match-kickoff">
                <Input
                  id="match-kickoff"
                  type="time"
                  value={kickoffTime}
                  onChange={(e) => setKickoffTime(e.target.value)}
                />
              </Field>
            )}
            <Field label="Venue" htmlFor="match-venue">
              <Input
                id="match-venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Bingu National Stadium"
              />
            </Field>
            <Field label="Competition" htmlFor="match-competition">
              <Input
                id="match-competition"
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                placeholder={
                  isClub ? "e.g. Super League" : "e.g. AFCON qualifier"
                }
              />
            </Field>
            <Field label="Season" htmlFor="match-season">
              <Input
                id="match-season"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. 2025/26"
              />
            </Field>
            {!isClub && (
              <Field label="Stage" htmlFor="match-stage">
                <Input
                  id="match-stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  placeholder="e.g. Group C, Quarter-final"
                />
              </Field>
            )}
            <Field label={`Home ${teamField}`} htmlFor="match-home">
              <Combobox
                id="match-home"
                aria-label={`Home ${teamField}`}
                value={homeTeamId}
                onValueChange={setHomeTeamId}
                options={teamOptions}
                placeholder={`Select a ${teamField}…`}
                emptyMessage={`No ${teamField}s found.`}
              />
            </Field>
            <Field label={`Away ${teamField}`} htmlFor="match-away">
              <Combobox
                id="match-away"
                aria-label={`Away ${teamField}`}
                value={awayTeamId}
                onValueChange={setAwayTeamId}
                options={teamOptions}
                placeholder={`Select a ${teamField}…`}
                emptyMessage={`No ${teamField}s found.`}
              />
            </Field>
            <Field label="Home score" htmlFor="match-hs">
              <Input
                id="match-hs"
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
              />
            </Field>
            <Field label="Away score" htmlFor="match-as">
              <Input
                id="match-as"
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
              />
            </Field>
            {!isClub && (
              <>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="match-neutral"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={isNeutral}
                    onChange={(e) => setIsNeutral(e.target.checked)}
                  />
                  <Label htmlFor="match-neutral">Neutral venue</Label>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="match-aet"
                    type="checkbox"
                    className="size-4 accent-primary"
                    checked={wentToExtraTime}
                    onChange={(e) => setWentToExtraTime(e.target.checked)}
                  />
                  <Label htmlFor="match-aet">Went to extra time</Label>
                </div>
                <Field label="Home penalties" htmlFor="match-hp">
                  <Input
                    id="match-hp"
                    type="number"
                    min={0}
                    value={homePenaltyScore}
                    onChange={(e) => setHomePenaltyScore(e.target.value)}
                  />
                </Field>
                <Field label="Away penalties" htmlFor="match-ap">
                  <Input
                    id="match-ap"
                    type="number"
                    min={0}
                    value={awayPenaltyScore}
                    onChange={(e) => setAwayPenaltyScore(e.target.value)}
                  />
                </Field>
              </>
            )}
            <div className="sm:col-span-2">
              <Field label="Source URL" htmlFor="match-source">
                <Input
                  id="match-source"
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <FormError message={error} />
            </div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                nativeButton={false}
                render={<Link to={backTo} />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add match"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
