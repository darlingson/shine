import { createFileRoute } from "@tanstack/react-router";
import { MatchFormPage } from "@/pages/MatchFormPage";

export const Route = createFileRoute("/manage/matches/national/$matchId")({
  component: EditNationalTeamMatchRoute,
});

function EditNationalTeamMatchRoute() {
  const { matchId } = Route.useParams();
  return <MatchFormPage key={matchId} kind="national" matchId={matchId} />;
}
