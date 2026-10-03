import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { LoginForm } from "@/auth/LoginForm";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/manage")({ component: ManageLayout });

function ManageLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6">
        <p className="text-sm text-muted-foreground">Loading session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
        <LoginForm />
        <Button variant="link" render={<Link to="/" />}>
          <ArrowLeftIcon />
          Back to home
        </Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium">Manage</span>
        </header>
        <main className="flex-1 p-6">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
