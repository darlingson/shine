import { createFileRoute } from "@tanstack/react-router";
import { MatchFormPage } from "@/pages/MatchFormPage";

export const Route = createFileRoute("/manage/matches/new")({
  component: () => <MatchFormPage />,
});
