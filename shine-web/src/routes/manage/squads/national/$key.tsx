import { createFileRoute } from "@tanstack/react-router";
import { SquadFormPage } from "@/pages/SquadFormPage";

export const Route = createFileRoute("/manage/squads/national/$key")({
  component: EditNationalEntryRoute,
});

function EditNationalEntryRoute() {
  const { key } = Route.useParams();
  return <SquadFormPage key={key} kind="national" entryKey={key} />;
}
