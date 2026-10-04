import { createFileRoute } from "@tanstack/react-router";
import { MatchesPage } from "@/pages/MatchesPage";

export const Route = createFileRoute("/manage/matches/")({
  component: MatchesPage,
});
