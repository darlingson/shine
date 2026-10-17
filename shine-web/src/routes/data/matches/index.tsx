import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/data/matches/")({
  beforeLoad: () => {
    throw redirect({ to: "/data/matches/club" });
  },
});
