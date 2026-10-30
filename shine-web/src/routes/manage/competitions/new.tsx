import { createFileRoute } from "@tanstack/react-router";
import { CompetitionFormPage } from "@/pages/CompetitionFormPage";

export const Route = createFileRoute("/manage/competitions/new")({
  component: () => <CompetitionFormPage />,
});
