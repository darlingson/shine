import { createFileRoute } from "@tanstack/react-router";
import { MatchFormPage } from "@/pages/MatchFormPage";

export const Route = createFileRoute("/manage/matches/club/$matchId")({
  component: EditClubMatchRoute,
});

function EditClubMatchRoute() {
  const { matchId } = Route.useParams();
  return <MatchFormPage key={matchId} kind="club" matchId={matchId} />;
}
