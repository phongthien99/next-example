/**
 * Dashboard Data Transfer Objects (DTOs)
 *
 * This file defines all Zod schemas and TypeScript types for the dashboard feature.
 * All domain entities are validated using Zod for runtime type safety.
 *
 * @module DashboardTypes
 */

import { z } from "zod";

// ============================================================================
// User Entity
// ============================================================================

export const UserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url("Avatar must be a valid URL"),
});

export type User = z.infer<typeof UserSchema>;

// ============================================================================
// Team Entity
// ============================================================================

export const PlanTypeSchema = z.enum(["Free", "Startup", "Enterprise"]);

export const TeamSchema = z.object({
  id: z.string().min(1, "Team ID is required"),
  name: z.string().min(1, "Team name is required"),
  logo: z.any(), // Lucide React icon component (cannot be validated at runtime)
  plan: PlanTypeSchema,
});

export type PlanType = z.infer<typeof PlanTypeSchema>;
export type Team = z.infer<typeof TeamSchema>;

// ============================================================================
// Navigation Item Entity
// ============================================================================

export const NavigationSubItemSchema = z.object({
  id: z.string().min(1, "Sub-item ID is required"),
  title: z.string().min(1, "Sub-item title is required"),
  url: z.string().min(1, "Sub-item URL is required"),
});

export const NavigationItemSchema = z.object({
  id: z.string().min(1, "Navigation item ID is required"),
  title: z.string().min(1, "Navigation item title is required"),
  url: z.string().min(1, "Navigation item URL is required"),
  icon: z.any(), // Lucide React icon component (cannot be validated at runtime)
  isActive: z.boolean().optional(),
  items: z.array(NavigationSubItemSchema).optional(),
});

export type NavigationSubItem = z.infer<typeof NavigationSubItemSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;

// ============================================================================
// Project Entity
// ============================================================================

export const ProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Project name is required"),
  url: z.string().min(1, "Project URL is required"),
  icon: z.any(), // Lucide React icon component (cannot be validated at runtime)
});

export type Project = z.infer<typeof ProjectSchema>;

// ============================================================================
// Breadcrumb Path Entity
// ============================================================================

export const BreadcrumbItemSchema = z.object({
  id: z.string().min(1, "Breadcrumb item ID is required"),
  label: z.string().min(1, "Breadcrumb label is required"),
  href: z.string().optional(),
  isCurrentPage: z.boolean(),
});

export const BreadcrumbPathSchema = z.object({
  items: z
    .array(BreadcrumbItemSchema)
    .min(1, "At least one breadcrumb item is required"),
});

export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>;
export type BreadcrumbPath = z.infer<typeof BreadcrumbPathSchema>;

// ============================================================================
// Sidebar State Entity
// ============================================================================

export const SidebarStateSchema = z.object({
  isCollapsed: z.boolean(),
  isMobileOpen: z.boolean(),
  activeNavItemId: z.string().nullable(),
});

export type SidebarState = z.infer<typeof SidebarStateSchema>;

// ============================================================================
// Dashboard Configuration Entity
// ============================================================================

export const DashboardConfigSchema = z.object({
  user: UserSchema,
  teams: z.array(TeamSchema).min(1, "At least one team is required"),
  navMain: z
    .array(NavigationItemSchema)
    .min(1, "At least one navigation item is required"),
  projects: z.array(ProjectSchema),
});

export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
