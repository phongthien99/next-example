"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";

/**
 * Exam Layout - Route Group Layout
 *
 * Provides consistent sidebar layout for all exam routes
 * Uses shared DashboardLayout with AppSidebar
 */
export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
