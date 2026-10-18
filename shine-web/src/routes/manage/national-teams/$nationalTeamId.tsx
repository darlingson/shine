import { createFileRoute } from "@tanstack/react-router";
import { NationalTeamFormPage } from "@/pages/NationalTeamFormPage";

export const Route = createFileRoute("/manage/national-teams/$nationalTeamId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { nationalTeamId } = Route.useParams();
  return <NationalTeamFormPage nationalTeamId={nationalTeamId} />;
}
