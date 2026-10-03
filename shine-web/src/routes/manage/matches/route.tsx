import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/matches")({
  component: () => <Outlet />,
});
