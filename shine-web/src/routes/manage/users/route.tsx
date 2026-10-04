import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/users")({
  component: () => <Outlet />,
});
