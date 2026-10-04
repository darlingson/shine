import { createFileRoute } from "@tanstack/react-router";
import { UserDetailPage } from "@/pages/UserFormPage";

export const Route = createFileRoute("/manage/users/$userId")({
  component: UserDetailRoute,
});

function UserDetailRoute() {
  const { userId } = Route.useParams();
  return <UserDetailPage key={userId} userId={userId} />;
}
