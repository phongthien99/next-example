/**
 * Mock Dashboard Configuration Data
 *
 * This file contains mock data for the dashboard feature.
 * In production, this data would be fetched from an API.
 *
 * @module mockDashboardConfig
 */

import {
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  GalleryVerticalEnd,
  AudioWaveform,
  Command,
  Frame,
  PieChart,
  Map,
} from "lucide-react";

import { DashboardConfig, DashboardConfigSchema } from "../dto/DashboardTypes";

/**
 * Mock dashboard configuration data
 *
 * This data structure matches the DashboardConfig type and is validated
 * using the DashboardConfigSchema Zod schema.
 */
const mockData = {
  user: {
    id: "user-1",
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  teams: [
    {
      id: "team-1",
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      id: "team-2",
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      id: "team-3",
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      id: "nav-playground",
      title: "Playground",
      url: "/dashboard/playground",
      icon: SquareTerminal,
      isActive: false,
      items: [
        {
          id: "nav-playground-history",
          title: "History",
          url: "/dashboard/playground/history",
        },
        {
          id: "nav-playground-starred",
          title: "Starred",
          url: "/dashboard/playground/starred",
        },
        {
          id: "nav-playground-settings",
          title: "Settings",
          url: "/dashboard/playground/settings",
        },
      ],
    },
    {
      id: "nav-models",
      title: "Models",
      url: "/dashboard/models",
      icon: Bot,
      isActive: false,
      items: [
        {
          id: "nav-models-genesis",
          title: "Genesis",
          url: "/dashboard/models/genesis",
        },
        {
          id: "nav-models-explorer",
          title: "Explorer",
          url: "/dashboard/models/explorer",
        },
        {
          id: "nav-models-quantum",
          title: "Quantum",
          url: "/dashboard/models/quantum",
        },
      ],
    },
    {
      id: "nav-docs",
      title: "Documentation",
      url: "/dashboard/documentation",
      icon: BookOpen,
      isActive: false,
      items: [
        {
          id: "nav-docs-intro",
          title: "Introduction",
          url: "/dashboard/documentation/intro",
        },
        {
          id: "nav-docs-start",
          title: "Get Started",
          url: "/dashboard/documentation/start",
        },
        {
          id: "nav-docs-tutorials",
          title: "Tutorials",
          url: "/dashboard/documentation/tutorials",
        },
        {
          id: "nav-docs-changelog",
          title: "Changelog",
          url: "/dashboard/documentation/changelog",
        },
      ],
    },
    {
      id: "nav-settings",
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
      isActive: false,
      items: [
        {
          id: "nav-settings-general",
          title: "General",
          url: "/dashboard/settings/general",
        },
        {
          id: "nav-settings-team",
          title: "Team",
          url: "/dashboard/settings/team",
        },
        {
          id: "nav-settings-billing",
          title: "Billing",
          url: "/dashboard/settings/billing",
        },
        {
          id: "nav-settings-limits",
          title: "Limits",
          url: "/dashboard/settings/limits",
        },
      ],
    },
  ],
  projects: [
    {
      id: "project-1",
      name: "Design Engineering",
      url: "/dashboard/projects/design",
      icon: Frame,
    },
    {
      id: "project-2",
      name: "Sales & Marketing",
      url: "/dashboard/projects/sales",
      icon: PieChart,
    },
    {
      id: "project-3",
      name: "Travel",
      url: "/dashboard/projects/travel",
      icon: Map,
    },
  ],
};

/**
 * Validated mock dashboard configuration
 *
 * This export validates the mock data against the DashboardConfigSchema
 * to ensure type safety and correct structure.
 *
 * @throws {ZodError} If mock data does not match schema
 */
export const mockDashboardConfig: DashboardConfig =
  DashboardConfigSchema.parse(mockData);
