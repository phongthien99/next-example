# Data Model: Dashboard Screen with Sidebar Navigation

**Feature**: 004-feature-create-screen  
**Date**: 2025-10-12  
**Purpose**: Define domain entities, data structures, and validation schemas

## Overview

This document defines the data model for the dashboard feature, including domain entities, TypeScript interfaces, Zod validation schemas, and relationships between entities.

## Domain Entities

### 1. User

Represents the authenticated user accessing the dashboard.

**TypeScript Interface**:
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // URL to avatar image
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  avatar: z.string().url('Avatar must be a valid URL'),
});

export type User = z.infer<typeof UserSchema>;
```

**Validation Rules**:
- `id`: Non-empty string (required)
- `name`: Non-empty string (required)
- `email`: Valid email format (required)
- `avatar`: Valid URL format (required)

**State Transitions**: None (read-only entity)

---

### 2. Team (Workspace)

Represents an organization or workspace context that the user can switch between.

**TypeScript Interface**:
```typescript
import { LucideIcon } from 'lucide-react';

type PlanType = 'Free' | 'Startup' | 'Enterprise';

interface Team {
  id: string;
  name: string;
  logo: LucideIcon; // Lucide React icon component
  plan: PlanType;
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const PlanTypeSchema = z.enum(['Free', 'Startup', 'Enterprise']);

export const TeamSchema = z.object({
  id: z.string().min(1, 'Team ID is required'),
  name: z.string().min(1, 'Team name is required'),
  logo: z.function(), // Lucide React component (cannot validate further at runtime)
  plan: PlanTypeSchema,
});

export type PlanType = z.infer<typeof PlanTypeSchema>;
export type Team = z.infer<typeof TeamSchema>;
```

**Validation Rules**:
- `id`: Non-empty string (required)
- `name`: Non-empty string (required)
- `logo`: Function (Lucide React icon component)
- `plan`: One of 'Free', 'Startup', 'Enterprise' (required)

**State Transitions**: None (read-only entity)

**Relationships**:
- User can belong to multiple Teams (one-to-many)
- User has one active Team at a time

---

### 3. Navigation Item

Represents a menu entry in the sidebar navigation with optional nested sub-items.

**TypeScript Interface**:
```typescript
import { LucideIcon } from 'lucide-react';

interface NavigationSubItem {
  id: string;
  title: string;
  url: string;
}

interface NavigationItem {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavigationSubItem[];
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const NavigationSubItemSchema = z.object({
  id: z.string().min(1, 'Sub-item ID is required'),
  title: z.string().min(1, 'Sub-item title is required'),
  url: z.string().min(1, 'Sub-item URL is required'),
});

export const NavigationItemSchema = z.object({
  id: z.string().min(1, 'Navigation item ID is required'),
  title: z.string().min(1, 'Navigation item title is required'),
  url: z.string().min(1, 'Navigation item URL is required'),
  icon: z.function(), // Lucide React icon component
  isActive: z.boolean().optional(),
  items: z.array(NavigationSubItemSchema).optional(),
});

export type NavigationSubItem = z.infer<typeof NavigationSubItemSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
```

**Validation Rules**:
- `id`: Non-empty string (required)
- `title`: Non-empty string (required)
- `url`: Non-empty string (required)
- `icon`: Function (Lucide React icon component)
- `isActive`: Boolean (optional, default: false)
- `items`: Array of sub-items (optional, can be empty)

**State Transitions**:
- `isActive`: `false` → `true` when user navigates to this item
- `isActive`: `true` → `false` when user navigates away

**Relationships**:
- Navigation Item can have multiple sub-items (one-to-many)
- Sub-items are hierarchically nested (one level deep only)

---

### 4. Project

Represents a user-accessible project for quick access from the sidebar.

**TypeScript Interface**:
```typescript
import { LucideIcon } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  url: string;
  icon: LucideIcon;
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  name: z.string().min(1, 'Project name is required'),
  url: z.string().min(1, 'Project URL is required'),
  icon: z.function(), // Lucide React icon component
});

export type Project = z.infer<typeof ProjectSchema>;
```

**Validation Rules**:
- `id`: Non-empty string (required)
- `name`: Non-empty string (required)
- `url`: Non-empty string (required)
- `icon`: Function (Lucide React icon component)

**State Transitions**: None (read-only entity)

**Relationships**:
- User can have multiple Projects (one-to-many)
- Projects are displayed in sidebar for quick access

---

### 5. Breadcrumb Path

Represents the hierarchical location within the application for breadcrumb navigation.

**TypeScript Interface**:
```typescript
interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string; // Optional for current page (last item)
  isCurrentPage: boolean;
}

interface BreadcrumbPath {
  items: BreadcrumbItem[];
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const BreadcrumbItemSchema = z.object({
  id: z.string().min(1, 'Breadcrumb item ID is required'),
  label: z.string().min(1, 'Breadcrumb label is required'),
  href: z.string().optional(),
  isCurrentPage: z.boolean(),
});

export const BreadcrumbPathSchema = z.object({
  items: z.array(BreadcrumbItemSchema).min(1, 'At least one breadcrumb item is required'),
});

export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>;
export type BreadcrumbPath = z.infer<typeof BreadcrumbPathSchema>;
```

**Validation Rules**:
- `items`: Array of breadcrumb items (required, minimum 1 item)
- `BreadcrumbItem.id`: Non-empty string (required)
- `BreadcrumbItem.label`: Non-empty string (required)
- `BreadcrumbItem.href`: String (optional, omitted for current page)
- `BreadcrumbItem.isCurrentPage`: Boolean (required, exactly one item must be true)

**State Transitions**: None (derived from current route)

---

### 6. Sidebar State

Represents the current state of the sidebar (collapsed/expanded, mobile open/closed).

**TypeScript Interface**:
```typescript
interface SidebarState {
  isCollapsed: boolean; // Desktop: sidebar collapsed to icon-only
  isMobileOpen: boolean; // Mobile: sidebar sheet open/closed
  activeNavItemId: string | null; // Currently selected navigation item
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const SidebarStateSchema = z.object({
  isCollapsed: z.boolean(),
  isMobileOpen: z.boolean(),
  activeNavItemId: z.string().nullable(),
});

export type SidebarState = z.infer<typeof SidebarStateSchema>;
```

**Validation Rules**:
- `isCollapsed`: Boolean (required, default: false)
- `isMobileOpen`: Boolean (required, default: false)
- `activeNavItemId`: String or null (optional)

**State Transitions**:
```
isCollapsed:
  - false (expanded) → true (collapsed) via toggle()
  - true (collapsed) → false (expanded) via toggle()

isMobileOpen:
  - false (closed) → true (open) via openMobile()
  - true (open) → false (closed) via closeMobile()

activeNavItemId:
  - null → string (item ID) when user clicks navigation item
  - string → null when navigation is cleared
  - string → string (different ID) when user clicks different item
```

**Persistence**:
- `isCollapsed`: Persisted to localStorage (user preference)
- `isMobileOpen`: Not persisted (transient UI state)
- `activeNavItemId`: Derived from current route (not persisted separately)

---

### 7. Dashboard Configuration

Represents the complete dashboard configuration including all entities.

**TypeScript Interface**:
```typescript
interface DashboardConfig {
  user: User;
  teams: Team[];
  navMain: NavigationItem[];
  projects: Project[];
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const DashboardConfigSchema = z.object({
  user: UserSchema,
  teams: z.array(TeamSchema).min(1, 'At least one team is required'),
  navMain: z.array(NavigationItemSchema).min(1, 'At least one navigation item is required'),
  projects: z.array(ProjectSchema),
});

export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
```

**Validation Rules**:
- `user`: User object (required)
- `teams`: Array of teams (required, minimum 1)
- `navMain`: Array of navigation items (required, minimum 1)
- `projects`: Array of projects (optional, can be empty)

**State Transitions**: None (read-only configuration)

---

## Entity Relationships

```
User
 ├─ has many → Team (1:N)
 ├─ has many → Project (1:N)
 └─ has one → SidebarState (1:1)

DashboardConfig
 ├─ contains one → User
 ├─ contains many → Team
 ├─ contains many → NavigationItem
 └─ contains many → Project

NavigationItem
 └─ has many → NavigationSubItem (1:N, optional)

BreadcrumbPath
 └─ contains many → BreadcrumbItem (1:N)

SidebarState
 └─ references one → NavigationItem (via activeNavItemId)
```

## Data Flow

### 1. Dashboard Initialization

```
1. Load DashboardConfig (mock data or from API)
   └─ Validate with DashboardConfigSchema
2. Load SidebarState from localStorage
   └─ Validate with SidebarStateSchema
   └─ Fallback to default if invalid
3. Determine activeNavItemId from current route
4. Render dashboard with combined state
```

### 2. Sidebar State Persistence

```
User Action (toggle sidebar)
  ↓
Component dispatches event
  ↓
Hook (useSidebar) calls repository method
  ↓
Repository (ISidebarStateRepository) interface
  ↓
Implementation (LocalStorageSidebarStateRepository)
  ↓
localStorage.setItem('sidebarState', JSON.stringify(state))
  ↓
State updated in React Context
  ↓
Components re-render with new state
```

### 3. Navigation Item Activation

```
User clicks navigation item
  ↓
Next.js router navigates to URL
  ↓
Route change detected in layout
  ↓
activeNavItemId derived from current pathname
  ↓
NavigationItem.isActive computed from activeNavItemId
  ↓
Active item highlighted in UI
```

## Mock Data Example

```typescript
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
} from 'lucide-react';

export const mockDashboardConfig: DashboardConfig = {
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://avatar.example.com/johndoe.jpg',
  },
  teams: [
    {
      id: 'team-1',
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      id: 'team-2',
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      id: 'team-3',
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
    },
  ],
  navMain: [
    {
      id: 'nav-playground',
      title: 'Playground',
      url: '/dashboard/playground',
      icon: SquareTerminal,
      isActive: false,
      items: [
        { id: 'nav-playground-history', title: 'History', url: '/dashboard/playground/history' },
        { id: 'nav-playground-starred', title: 'Starred', url: '/dashboard/playground/starred' },
        { id: 'nav-playground-settings', title: 'Settings', url: '/dashboard/playground/settings' },
      ],
    },
    {
      id: 'nav-models',
      title: 'Models',
      url: '/dashboard/models',
      icon: Bot,
      items: [
        { id: 'nav-models-genesis', title: 'Genesis', url: '/dashboard/models/genesis' },
        { id: 'nav-models-explorer', title: 'Explorer', url: '/dashboard/models/explorer' },
        { id: 'nav-models-quantum', title: 'Quantum', url: '/dashboard/models/quantum' },
      ],
    },
    {
      id: 'nav-docs',
      title: 'Documentation',
      url: '/dashboard/documentation',
      icon: BookOpen,
      items: [
        { id: 'nav-docs-intro', title: 'Introduction', url: '/dashboard/documentation/intro' },
        { id: 'nav-docs-start', title: 'Get Started', url: '/dashboard/documentation/start' },
        { id: 'nav-docs-tutorials', title: 'Tutorials', url: '/dashboard/documentation/tutorials' },
        { id: 'nav-docs-changelog', title: 'Changelog', url: '/dashboard/documentation/changelog' },
      ],
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      url: '/dashboard/settings',
      icon: Settings2,
      items: [
        { id: 'nav-settings-general', title: 'General', url: '/dashboard/settings/general' },
        { id: 'nav-settings-team', title: 'Team', url: '/dashboard/settings/team' },
        { id: 'nav-settings-billing', title: 'Billing', url: '/dashboard/settings/billing' },
        { id: 'nav-settings-limits', title: 'Limits', url: '/dashboard/settings/limits' },
      ],
    },
  ],
  projects: [
    {
      id: 'project-1',
      name: 'Design Engineering',
      url: '/dashboard/projects/design',
      icon: Frame,
    },
    {
      id: 'project-2',
      name: 'Sales & Marketing',
      url: '/dashboard/projects/sales',
      icon: PieChart,
    },
    {
      id: 'project-3',
      name: 'Travel',
      url: '/dashboard/projects/travel',
      icon: Map,
    },
  ],
};
```

## Repository Interface

### ISidebarStateRepository

Interface for sidebar state persistence (Clean Architecture infrastructure layer).

```typescript
export interface ISidebarStateRepository {
  /**
   * Get current sidebar state from storage
   * @returns SidebarState or null if not found
   */
  getState(): Promise<SidebarState | null>;

  /**
   * Save sidebar state to storage
   * @param state - The sidebar state to save
   */
  setState(state: SidebarState): Promise<void>;

  /**
   * Clear sidebar state from storage
   */
  clearState(): Promise<void>;

  /**
   * Check if storage is available
   * @returns true if storage can be used, false otherwise
   */
  isAvailable(): boolean;
}
```

**Implementations**:
1. `LocalStorageSidebarStateRepository` - Persists to localStorage
2. `InMemorySidebarStateRepository` - In-memory storage for testing or fallback

---

## Validation Functions (Domain Layer)

```typescript
/**
 * Validate dashboard configuration
 * @param data - Raw dashboard configuration data
 * @returns Validated DashboardConfig or throws ZodError
 */
export function validateDashboardConfig(data: unknown): DashboardConfig {
  return DashboardConfigSchema.parse(data);
}

/**
 * Validate sidebar state
 * @param data - Raw sidebar state data
 * @returns Validated SidebarState or null if invalid
 */
export function validateSidebarState(data: unknown): SidebarState | null {
  const result = SidebarStateSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Get default sidebar state
 * @returns Default SidebarState
 */
export function getDefaultSidebarState(): SidebarState {
  return {
    isCollapsed: false,
    isMobileOpen: false,
    activeNavItemId: null,
  };
}

/**
 * Derive active navigation item ID from current pathname
 * @param pathname - Current route pathname
 * @param navItems - Array of navigation items
 * @returns Active navigation item ID or null
 */
export function deriveActiveNavItemId(
  pathname: string,
  navItems: NavigationItem[]
): string | null {
  for (const item of navItems) {
    // Check if main item matches
    if (pathname === item.url || pathname.startsWith(item.url + '/')) {
      return item.id;
    }
    // Check sub-items
    if (item.items) {
      for (const subItem of item.items) {
        if (pathname === subItem.url) {
          return item.id; // Return parent item ID
        }
      }
    }
  }
  return null;
}
```

## Conclusion

All domain entities are fully typed with TypeScript interfaces and validated with Zod schemas. The data model supports Clean Architecture with clear separation between domain entities, validation logic, and infrastructure concerns (repository interfaces).

**Ready for Contract Generation**: ✅
