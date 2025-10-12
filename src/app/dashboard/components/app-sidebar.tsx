"use client";

import * as React from "react";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { mockDashboardConfig } from "../data/mockDashboardConfig";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Transform domain data to match component prop interfaces
  const teams = mockDashboardConfig.teams.map(({ name, logo, plan }) => ({
    name,
    logo: logo as React.ElementType,
    plan,
  }));

  const navMain = mockDashboardConfig.navMain.map(
    ({ title, url, icon, isActive, items }) => ({
      title,
      url,
      icon: icon as any,
      isActive,
      items: items?.map(({ title, url }) => ({ title, url })),
    }),
  );

  const projects = mockDashboardConfig.projects.map(({ name, url, icon }) => ({
    name,
    url,
    icon: icon as any,
  }));

  const user = {
    name: mockDashboardConfig.user.name,
    email: mockDashboardConfig.user.email,
    avatar: mockDashboardConfig.user.avatar,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
