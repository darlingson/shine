import { createFileRoute } from "@tanstack/react-router";
import { MatchFormPage } from "@/pages/MatchFormPage";

export const Route = createFileRoute("/manage/matches/$matchId")({
  component: EditMatchRoute,
});

function EditMatchRoute() {
  const { matchId } = Route.useParams();
  return <MatchFormPage key={matchId} matchId={matchId} />;
}
