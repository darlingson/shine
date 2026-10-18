import { createFileRoute } from "@tanstack/react-router";
import { RecordMatchPage } from "@/pages/RecordMatchPage";

export const Route = createFileRoute("/manage/matches/club/record")({
  component: () => <RecordMatchPage />,
});
