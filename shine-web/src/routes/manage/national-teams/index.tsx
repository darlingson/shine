import { createFileRoute } from "@tanstack/react-router";
import { NationalTeamsPage } from "@/pages/NationalTeamsPage";

export const Route = createFileRoute("/manage/national-teams/")({
  component: NationalTeamsPage,
});
