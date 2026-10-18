import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/national-teams")({
  component: () => <Outlet />,
});
