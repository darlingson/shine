import { Link } from "@tanstack/react-router";
import {
  ClipboardTextIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldIcon,
  TrophyIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const QUICK_ADD = [
  { to: "/manage/matches/club/record", label: "Record full match" },
  { to: "/manage/players/new", label: "Add player" },
  { to: "/manage/matches/club/new", label: "Add club match" },
  { to: "/manage/matches/national/new", label: "Add national match" },
  { to: "/manage/squads/club/new", label: "Add club squad" },
  { to: "/manage/squads/national/new", label: "Add national squad" },
] as const;

const BROWSE = [
  {
    to: "/manage/players",
    label: "Players",
    icon: <UserIcon className="size-4 text-muted-foreground" />,
  },
  {
    to: "/manage/clubs",
    label: "Clubs",
    icon: <ShieldIcon className="size-4 text-muted-foreground" />,
  },
  {
    to: "/manage/matches/club",
    label: "Club matches",
    icon: <TrophyIcon className="size-4 text-muted-foreground" />,
  },
  {
    to: "/manage/matches/national",
    label: "National matches",
    icon: <TrophyIcon className="size-4 text-muted-foreground" />,
  },
  {
    to: "/manage/squads",
    label: "Squads",
    icon: <ClipboardTextIcon className="size-4 text-muted-foreground" />,
  },
] as const;

export function OverviewPage() {
  const { user, logout, hasPermission } = useAuth();
  const canWrite =
    hasPermission("players:write") ||
    hasPermission("clubs:write") ||
    hasPermission("matches:write") ||
    hasPermission("squads:write");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-semibold tracking-tight">
          Contributor hub
        </h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.email} · Roles:{" "}
          {(user?.roles ?? []).join(", ") || "none"}
        </p>
      </div>

      {canWrite && (
        <Card>
          <CardHeader>
            <CardTitle>Add to the record</CardTitle>
            <CardDescription>
              One sourced fact at a time. Every entry needs a source URL.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {QUICK_ADD.map((a) => (
              <Button
                key={a.to}
                nativeButton={false}
                render={<Link to={a.to} />}
              >
                <PlusIcon />
                {a.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Browse the data</CardTitle>
            <CardDescription>
              Review, correct, and extend existing records.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {BROWSE.map((b) => (
              <Button
                key={b.to}
                variant="outline"
                nativeButton={false}
                render={<Link to={b.to} />}
              >
                {b.icon}
                {b.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="size-4 text-muted-foreground" />
              House rules
            </CardTitle>
            <CardDescription>
              What keeps the record trustworthy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Cite a source URL for every factual change.</li>
              <li>Keep changes small — one entity per edit.</li>
              <li>Correct rather than duplicate existing records.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div>
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
