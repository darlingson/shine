import { createFileRoute } from "@tanstack/react-router";
import { ClubsPage } from "@/pages/ClubsPage";

export const Route = createFileRoute("/manage/clubs/")({
  component: ClubsPage,
});
