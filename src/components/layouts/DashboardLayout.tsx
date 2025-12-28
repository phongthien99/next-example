"use client";

import * as React from "react";
import {
  SidebarInset,
  SidebarProvider as UISidebarProvider,
} from "@/components/ui/sidebar";
import { SidebarProvider } from "@/providers/SidebarProvider";
import { AppSidebar } from "@/components/dashboard/components/app-sidebar";

/**
 * DashboardLayout - Shared Layout Component
 *
 * Fixed layout wrapper with AppSidebar
 * Used by both dashboard and exam routes
 *
 * @param children - Main content
 */
interface DashboardLayoutProps {
  readonly children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <UISidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex-1">
          {children}
        </SidebarInset>
      </UISidebarProvider>
    </SidebarProvider>
  );
}
