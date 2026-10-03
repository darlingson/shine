import { createFileRoute } from "@tanstack/react-router";
import { PlayersPage } from "@/pages/PlayersPage";

export const Route = createFileRoute("/manage/players/")({
  component: PlayersPage,
});
