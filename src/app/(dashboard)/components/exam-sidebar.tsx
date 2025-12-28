"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  History,
  Settings,
  BarChart,
  GraduationCap,
} from "lucide-react";

import { NavUser } from "@/components/dashboard/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AuthSession } from "@/app/(auth)/login/entities/AuthSession";

/**
 * ExamSidebar Component
 *
 * Sidebar for exam routes with exam-specific navigation
 * Similar structure to AppSidebar but tailored for exam functionality
 */
export function ExamSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Load user from localStorage
  const [user, setUser] = React.useState({
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/default.jpg",
  });

  React.useEffect(() => {
    const session = AuthSession.load();
    if (session?.user) {
      setUser({
        name: session.user.name || session.user.email.split("@")[0],
        email: session.user.email,
        avatar: "/avatars/default.jpg",
      });
    }
  }, []);

  const examNavItems = [
    {
      title: "Practice Exam",
      url: "/exam",
      icon: BookOpen,
      isActive: true,
    },
    {
      title: "Timed Test",
      url: "/exam/timed",
      icon: Clock,
    },
    {
      title: "Exam History",
      url: "/exam/history",
      icon: History,
    },
    {
      title: "Statistics",
      url: "/exam/stats",
      icon: BarChart,
    },
    {
      title: "Settings",
      url: "/exam/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/exam">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TOEIC Exam</span>
                  <span className="truncate text-xs">Practice Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {examNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
