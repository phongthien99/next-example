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
  FileText,
  History,
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
      id: "nav-exam",
      title: "Exam",
      url: "/exam",
      icon: FileText,
      isActive: false,
      items: [
        {
          id: "nav-exam-practice",
          title: "Practice",
          url: "/exam/practice",
        },
       
      ],
    },
   
  ],
  projects: [
    
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
