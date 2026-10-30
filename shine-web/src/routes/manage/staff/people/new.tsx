import { createFileRoute } from "@tanstack/react-router";
import { StaffMemberFormPage } from "@/pages/StaffMemberFormPage";

export const Route = createFileRoute("/manage/staff/people/new")({
  component: () => <StaffMemberFormPage />,
});
