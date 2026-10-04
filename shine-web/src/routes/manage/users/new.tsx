import { createFileRoute } from "@tanstack/react-router";
import { NewUserPage } from "@/pages/UserFormPage";

export const Route = createFileRoute("/manage/users/new")({
  component: NewUserPage,
});
