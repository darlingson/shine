import { createFileRoute } from "@tanstack/react-router";
import { MatchFormPage } from "@/pages/MatchFormPage";

export const Route = createFileRoute("/manage/matches/club/new")({
  component: () => <MatchFormPage kind="club" />,
});
