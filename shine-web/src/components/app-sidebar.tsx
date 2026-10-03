import { Link } from "@tanstack/react-router";
import {
  ArrowSquareOutIcon,
  HouseIcon,
  ShieldCheckIcon,
  SignOutIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user, logout, hasPermission } = useAuth();
  const canManageUsers = hasPermission("users:manage");

  const initials = (user?.email ?? "?")
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={
                <Link to="/manage" activeOptions={{ exact: true }} />
              }
            >
              <span className="font-heading text-lg font-semibold tracking-tight">
                Shine
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Overview"
                  render={
                    <Link
                      to="/manage"
                      activeOptions={{ exact: true }}
                      activeProps={{ "data-active": true }}
                    />
                  }
                >
                  <HouseIcon />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="View public site"
                  render={<Link to="/" />}
                >
                  <ArrowSquareOutIcon />
                  <span>View site</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={
                    canManageUsers ? "Users" : "Users (needs users:manage)"
                  }
                  render={
                    <Link
                      to="/manage/users"
                      activeProps={{ "data-active": true }}
                    />
                  }
                >
                  <UsersIcon />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Roles"
                  render={
                    <Link
                      to="/manage/roles"
                      activeProps={{ "data-active": true }}
                    />
                  }
                >
                  <ShieldCheckIcon />
                  <span>Roles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.email}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {(user?.roles ?? []).join(", ") || "no role"}
                    </span>
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem onClick={logout}>
                  <SignOutIcon />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
