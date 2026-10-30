import { createFileRoute } from "@tanstack/react-router";
import { CompetitionFormPage } from "@/pages/CompetitionFormPage";

export const Route = createFileRoute(
  "/manage/competitions/$competitionId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { competitionId } = Route.useParams();
  return <CompetitionFormPage competitionId={competitionId} />;
}
