import { createFileRoute } from "@tanstack/react-router";
import { ClubFormPage } from "@/pages/ClubFormPage";

export const Route = createFileRoute("/manage/clubs/$clubId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { clubId } = Route.useParams();
  return <ClubFormPage clubId={clubId} />;
}
