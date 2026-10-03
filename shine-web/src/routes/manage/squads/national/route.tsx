import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/squads/national")({
  component: () => <Outlet />,
});
