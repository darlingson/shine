import { createFileRoute } from "@tanstack/react-router";
import { SquadFormPage } from "@/pages/SquadFormPage";

export const Route = createFileRoute("/manage/squads/club/$key")({
  component: EditClubEntryRoute,
});

function EditClubEntryRoute() {
  const { key } = Route.useParams();
  return <SquadFormPage key={key} kind="club" entryKey={key} />;
}
