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
import {
  PLAYER_FEET,
  PLAYER_STATUSES,
  createPlayer,
  listPlayers,
  updatePlayer,
  type Player,
  type PlayerForm,
} from "@/lib/players";
import { parseApiError } from "@/lib/users";

interface FormState extends Omit<PlayerForm, "heightCm"> {
  height: string;
}

function stateFrom(player: Player | null): FormState {
  return {
    fullName: player?.fullName ?? "",
    knownAs: player?.knownAs ?? "",
    dateOfBirth: player?.dateOfBirth ?? "",
    gender: player?.gender ?? "",
    nationality: player?.nationality ?? "Malawi",
    positionPrimary: player?.positionPrimary ?? "",
    positionSecondary: player?.positionSecondary ?? "",
    height: player?.heightCm?.toString() ?? "",
    foot: player?.foot ?? "",
    status: player?.status ?? "active",
    sourceUrl: player?.sourceUrl ?? "",
  };
}

/** Shared add/edit form. Pass playerId to edit, omit to create. */
export function PlayerFormPage({ playerId }: { playerId?: string }) {
  const { hasPermission } = useAuth();
  const canWrite = hasPermission("players:write");
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(() => stateFrom(null));
  const [loading, setLoading] = useState(playerId !== undefined);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerId === undefined) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await listPlayers();
        const found = all.find((p) => p.playerId === Number(playerId));
        if (cancelled) return;
        if (!found) {
          setNotFound(true);
        } else {
          setForm(stateFrom(found));
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
  }, [playerId]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const dto: PlayerForm = {
      fullName: form.fullName.trim(),
      knownAs: form.knownAs?.trim() || undefined,
      dateOfBirth: form.dateOfBirth?.trim() || undefined,
      gender: form.gender?.trim() || undefined,
      nationality: form.nationality.trim() || "Malawi",
      positionPrimary: form.positionPrimary?.trim() || undefined,
      positionSecondary: form.positionSecondary?.trim() || undefined,
      heightCm: parseOptionalInt(form.height),
      foot: form.foot?.trim() || undefined,
      status: form.status,
      sourceUrl: form.sourceUrl?.trim() || undefined,
    };
    try {
      if (playerId !== undefined) await updatePlayer(Number(playerId), dto);
      else await createPlayer(dto);
      await navigate({ to: "/manage/players" });
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setBusy(false);
    }
  }

  const editing = playerId !== undefined;

  if (!canWrite) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit player" : "Add player"}</CardTitle>
          <CardDescription>
            You need the players:write permission to make changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" render={<Link to="/manage/players" />}>
            <ArrowLeftIcon />
            Back to players
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
          <CardTitle>Player not found</CardTitle>
          <CardDescription>
            No player with id “{playerId}” exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" render={<Link to="/manage/players" />}>
            <ArrowLeftIcon />
            Back to players
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
          render={<Link to="/manage/players" />}
        >
          <ArrowLeftIcon />
          Back to players
        </Button>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          {editing ? "Edit player" : "Add player"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {editing
            ? "Update the record. Changes apply immediately."
            : "Record a new player. Every fact should carry a source."}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Full name" htmlFor="player-name">
                <Input
                  id="player-name"
                  required
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="e.g. Tabitha Chawinga"
                />
              </Field>
            </div>
            <Field label="Known as" htmlFor="player-knownas">
              <Input
                id="player-knownas"
                value={form.knownAs ?? ""}
                onChange={(e) => set("knownAs", e.target.value)}
                placeholder="Nickname, if any"
              />
            </Field>
            <Field label="Date of birth" htmlFor="player-dob">
              <Input
                id="player-dob"
                type="date"
                value={form.dateOfBirth ?? ""}
                onChange={(e) => set("dateOfBirth", e.target.value)}
              />
            </Field>
            <Field label="Gender" htmlFor="player-gender">
              <Input
                id="player-gender"
                value={form.gender ?? ""}
                onChange={(e) => set("gender", e.target.value)}
                placeholder="e.g. M / F"
              />
            </Field>
            <Field label="Nationality" htmlFor="player-nationality">
              <Input
                id="player-nationality"
                value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)}
              />
            </Field>
            <Field label="Primary position" htmlFor="player-pos1">
              <Input
                id="player-pos1"
                value={form.positionPrimary ?? ""}
                onChange={(e) => set("positionPrimary", e.target.value)}
                placeholder="e.g. Forward"
              />
            </Field>
            <Field label="Secondary position" htmlFor="player-pos2">
              <Input
                id="player-pos2"
                value={form.positionSecondary ?? ""}
                onChange={(e) => set("positionSecondary", e.target.value)}
                placeholder="e.g. Winger"
              />
            </Field>
            <Field label="Height (cm)" htmlFor="player-height">
              <Input
                id="player-height"
                type="number"
                min={0}
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
              />
            </Field>
            <Field label="Preferred foot" htmlFor="player-foot">
              <Select
                value={form.foot ?? ""}
                onValueChange={(v) => set("foot", v ?? "")}
              >
                <SelectTrigger id="player-foot">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_FEET.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status" htmlFor="player-status">
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v ?? "active")}
              >
                <SelectTrigger id="player-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Source URL" htmlFor="player-source">
                <Input
                  id="player-source"
                  type="url"
                  value={form.sourceUrl ?? ""}
                  onChange={(e) => set("sourceUrl", e.target.value)}
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
                render={<Link to="/manage/players" />}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : editing ? "Save changes" : "Add player"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
