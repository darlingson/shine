import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/squads/club")({
  component: () => <Outlet />,
});
