import { createFileRoute } from "@tanstack/react-router";
import { PlayerFormPage } from "@/pages/PlayerFormPage";

export const Route = createFileRoute("/manage/players/new")({
  component: () => <PlayerFormPage />,
});
