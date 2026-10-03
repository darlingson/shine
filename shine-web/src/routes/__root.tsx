import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/auth/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

function RootComponent() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <p className="font-heading text-2xl font-semibold tracking-tight">
        Page not found
      </p>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Button render={<Link to="/" />}>Back to home</Button>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
});
