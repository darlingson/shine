import { createFileRoute } from "@tanstack/react-router";
import { PlayerFormPage } from "@/pages/PlayerFormPage";

export const Route = createFileRoute("/manage/players/$playerId")({
  component: EditPlayerRoute,
});

function EditPlayerRoute() {
  const { playerId } = Route.useParams();
  return <PlayerFormPage key={playerId} playerId={playerId} />;
}
