import { createFileRoute } from "@tanstack/react-router";
import { StaffMemberFormPage } from "@/pages/StaffMemberFormPage";

export const Route = createFileRoute("/manage/staff/people/$staffMemberId")({
  component: () => {
    const { staffMemberId } = Route.useParams();
    return <StaffMemberFormPage staffMemberId={staffMemberId} />;
  },
});
