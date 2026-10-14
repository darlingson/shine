import { createFileRoute } from "@tanstack/react-router";
import { ClubFormPage } from "@/pages/ClubFormPage";

export const Route = createFileRoute("/manage/clubs/new")({
  component: () => <ClubFormPage />,
});
