import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/matches/")({
  beforeLoad: () => {
    throw redirect({ to: "/manage/matches/club" });
  },
});
