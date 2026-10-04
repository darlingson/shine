import { createFileRoute } from "@tanstack/react-router";
import { SquadFormPage } from "@/pages/SquadFormPage";

export const Route = createFileRoute("/manage/squads/national/$key")({
  component: EditNationalEntryRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    team: typeof search.team === "string" ? search.team : "",
  }),
});

function EditNationalEntryRoute() {
  const { key } = Route.useParams();
  const { team } = Route.useSearch();
  return <SquadFormPage key={`${key}-${team}`} kind="national" entryKey={key} team={team} />;
}
