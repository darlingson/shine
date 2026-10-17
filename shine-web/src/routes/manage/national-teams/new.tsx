import { createFileRoute } from "@tanstack/react-router";
import { NationalTeamFormPage } from "@/pages/NationalTeamFormPage";

export const Route = createFileRoute("/manage/national-teams/new")({
  component: () => <NationalTeamFormPage />,
});
