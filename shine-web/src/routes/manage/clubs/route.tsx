import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/manage/clubs")({
  component: () => <Outlet />,
});
