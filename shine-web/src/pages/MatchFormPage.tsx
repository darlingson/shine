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
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FormError } from "@/components/data-ui";
import { parseOptionalInt } from "@/lib/forms";
import {
  createMatch,
  listMatches,
  updateMatch,
  type Match,
  type MatchForm,
} from "@/lib/matches";
import { parseApiError } from "@/lib/users";

/** Shared add/edit form. Pass matchId to edit, omit to create. */
export function MatchFormPage({ matchId }: { matchId?: string }) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("matches:write");
  const navigate = useNavigate();
  const [matchDate, setMatchDate] = useState("");
  const [competition, setCompetition] = useState("");
  const [season, setSeason] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [venue, setVenue] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState(matchId !== undefined);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (matchId === undefined) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await listMatches();
        const found: Match | undefined = all.find(
          (m) => m.matchId === Number(matchId),
        );
        if (cancelled) return;
        if (!found) {
          setNotFound(true);
        } else {
          setMatchDate(found.matchDate);
          setCompetition(found.competition ?? "");
          setSeason(found.season ?? "");
          setHomeTeam(found.homeTeam ?? "");
          setAwayTeam(found.awayTeam ?? "");
          setHomeScore(found.homeScore?.toString() ?? "");
          setAwayScore(found.awayScore?.toString() ?? "");
          setVenue(found.venue ?? "");
          setSourceUrl(found.sourceUrl ?? "");
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
  }, [matchId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const dto: MatchForm = {
      matchDate,
      competition: competition.trim() || undefined,
      season: season.trim() || undefined,
      homeTeam: homeTeam.trim() || undefined,
      awayTeam: awayTeam.trim() || undefined,
      homeScore: parseOptionalInt(homeScore),
      awayScore: parseOptionalInt(awayScore),
      venue: venue.trim() || undefined,
      sourceUrl: sourceUrl.trim() || undefined,
    };
    try {
      if (matchId !== undefined) await updateMatch(Number(matchId), dto);
      else await createMatch(dto);
      await navigate({ to: "/manage/matches" });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const editing = matchId !== undefined;

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
          <Button variant="outline" render={<Link to="/manage/matches" />}>
            <ArrowLeftIcon />
            Back to matches
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
          <CardTitle>Match not found</CardTitle>
          <CardDescription>
            No match with id “{matchId}” exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" render={<Link to="/manage/matches" />}>
            <ArrowLeftIcon />
            Back to matches
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
          render={<Link to="/manage/matches" />}
        >
          <ArrowLeftIcon />
          Back to matches
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit match" : "Add match"}
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
                placeholder="e.g. Super League, AFCON qualifier"
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
            <Field label="Home team" htmlFor="match-home">
              <Input
                id="match-home"
                value={homeTeam}
                onChange={(e) => setHomeTeam(e.target.value)}
                placeholder="Home side"
              />
            </Field>
            <Field label="Away team" htmlFor="match-away">
              <Input
                id="match-away"
                value={awayTeam}
                onChange={(e) => setAwayTeam(e.target.value)}
                placeholder="Away side"
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
                render={<Link to="/manage/matches" />}
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
