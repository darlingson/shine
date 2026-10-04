import { createFileRoute } from "@tanstack/react-router";
import { SquadsPage } from "@/pages/SquadsPage";

export const Route = createFileRoute("/manage/squads/")({
  component: SquadsPage,
});
