import { createFileRoute } from "@tanstack/react-router";
import { CompetitionsPage } from "@/pages/CompetitionsPage";

export const Route = createFileRoute("/manage/competitions/")({
  component: CompetitionsPage,
});
