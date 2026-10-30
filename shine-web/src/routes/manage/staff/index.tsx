import { createFileRoute } from "@tanstack/react-router";
import { StaffPage } from "@/pages/StaffPage";

export const Route = createFileRoute("/manage/staff/")({
  component: StaffPage,
});
