import { createFileRoute } from "@tanstack/react-router";
import { SquadFormPage } from "@/pages/SquadFormPage";

export const Route = createFileRoute("/manage/squads/national/new")({
  component: () => <SquadFormPage kind="national" />,
});
