# API Contracts: Dashboard Screen

**Feature**: 004-feature-create-screen  
**Date**: 2025-10-12

## Overview

This feature does NOT use external APIs. All data is provided via mock data structures and localStorage for state persistence.

## Data Sources

### 1. Mock Data (Static Configuration)

**Location**: `src/app/dashboard/data/mockDashboardConfig.ts`

**Purpose**: Provide dashboard configuration including user profile, teams, navigation items, and projects.

**Data Structure**: See `DashboardConfigSchema` in `data-model.md`

**Example**:
```typescript
export const mockDashboardConfig: DashboardConfig = {
  user: {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://avatar.example.com/johndoe.jpg',
  },
  teams: [...],
  navMain: [...],
  projects: [...],
};
```

**Access Pattern**:
- Import directly in components or context providers
- No network requests required
- Can be replaced with API call in future via Repository pattern

---

### 2. localStorage (Sidebar State Persistence)

**Purpose**: Persist user's sidebar preferences (collapsed/expanded state) across browser sessions.

**Storage Key**: `dashboard:sidebarState`

**Data Structure**:
```typescript
interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeNavItemId: string | null;
}
```

**Operations**:

#### Get Sidebar State
```typescript
// Repository method
async getState(): Promise<SidebarState | null> {
  try {
    const data = localStorage.getItem('dashboard:sidebarState');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    return validateSidebarState(parsed); // Zod validation
  } catch (error) {
    console.error('Failed to read sidebar state from localStorage', error);
    return null;
  }
}
```

#### Save Sidebar State
```typescript
// Repository method
async setState(state: SidebarState): Promise<void> {
  try {
    const validated = SidebarStateSchema.parse(state);
    localStorage.setItem('dashboard:sidebarState', JSON.stringify(validated));
  } catch (error) {
    console.error('Failed to save sidebar state to localStorage', error);
    throw error;
  }
}
```

#### Clear Sidebar State
```typescript
// Repository method
async clearState(): Promise<void> {
  try {
    localStorage.removeItem('dashboard:sidebarState');
  } catch (error) {
    console.error('Failed to clear sidebar state from localStorage', error);
  }
}
```

---

## Repository Interface Contracts

### ISidebarStateRepository

**Purpose**: Abstract localStorage access for sidebar state persistence (Dependency Inversion Principle)

**Interface**:
```typescript
export interface ISidebarStateRepository {
  /**
   * Get current sidebar state from storage
   * @returns SidebarState or null if not found/invalid
   */
  getState(): Promise<SidebarState | null>;

  /**
   * Save sidebar state to storage
   * @param state - The sidebar state to save
   * @throws Error if state is invalid or storage is unavailable
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

1. **LocalStorageSidebarStateRepository** (Primary):
   - Uses browser localStorage API
   - Validates data with Zod before saving/returning
   - Handles quota exceeded errors
   - Checks localStorage availability (may be disabled in private mode)

2. **InMemorySidebarStateRepository** (Fallback/Testing):
   - Stores state in memory (Map or object)
   - Same interface as localStorage implementation
   - Used when localStorage is unavailable
   - Used in unit/integration tests

---

## Component Contracts

### SidebarProvider Props

**Purpose**: React Context provider for sidebar state and repository injection

```typescript
interface SidebarProviderProps {
  children: React.ReactNode;
  repository?: ISidebarStateRepository; // Optional for DI (default: LocalStorageSidebarStateRepository)
  defaultState?: Partial<SidebarState>; // Optional override for initial state
}
```

**Usage**:
```typescript
<SidebarProvider repository={new LocalStorageSidebarStateRepository()}>
  <AppSidebar />
  <SidebarInset>
    {/* Main content */}
  </SidebarInset>
</SidebarProvider>
```

---

### useSidebar Hook Contract

**Purpose**: Application layer hook for sidebar state management

```typescript
interface UseSidebarReturn {
  // State
  state: SidebarState;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeNavItemId: string | null;
  
  // Actions
  toggle: () => void; // Toggle collapsed state (desktop)
  expand: () => void; // Force expand
  collapse: () => void; // Force collapse
  openMobile: () => void; // Open sidebar on mobile
  closeMobile: () => void; // Close sidebar on mobile
  setActiveNavItem: (id: string | null) => void; // Set active navigation item
  
  // Status
  isLoading: boolean; // Loading state from localStorage
  error: Error | null; // Error if localStorage fails
}
```

**Example Usage**:
```typescript
function AppSidebar() {
  const { 
    isCollapsed, 
    toggle, 
    isMobileOpen, 
    openMobile, 
    closeMobile 
  } = useSidebar();
  
  return (
    <Sidebar collapsible="icon" isCollapsed={isCollapsed}>
      {/* Sidebar content */}
    </Sidebar>
  );
}
```

---

## Component Props Contracts

### AppSidebar Props

```typescript
interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  config: DashboardConfig; // Dashboard configuration
  onNavItemClick?: (itemId: string) => void; // Optional callback
}
```

### NavMain Props

```typescript
interface NavMainProps {
  items: NavigationItem[];
  activeItemId: string | null;
  onItemClick?: (itemId: string) => void;
}
```

### NavProjects Props

```typescript
interface NavProjectsProps {
  projects: Project[];
  onProjectClick?: (projectId: string) => void;
}
```

### NavUser Props

```typescript
interface NavUserProps {
  user: User;
  onSignOut?: () => void;
  onProfileClick?: () => void;
}
```

### TeamSwitcher Props

```typescript
interface TeamSwitcherProps {
  teams: Team[];
  activeTeamId?: string;
  onTeamSelect?: (teamId: string) => void;
}
```

---

## Error Handling Contracts

### Error Types

```typescript
// localStorage errors
class StorageUnavailableError extends Error {
  name = 'StorageUnavailableError';
  message = 'localStorage is not available (may be disabled or in private mode)';
}

class StorageQuotaExceededError extends Error {
  name = 'StorageQuotaExceededError';
  message = 'localStorage quota exceeded';
}

class StorageDataInvalidError extends Error {
  name = 'StorageDataInvalidError';
  message = 'Stored data is invalid and cannot be parsed';
  cause?: z.ZodError; // Original Zod validation error
}
```

### Error Handling Strategy

1. **localStorage Unavailable**:
   - Fallback to InMemorySidebarStateRepository
   - Show non-intrusive notification: "Preferences won't be saved (localStorage disabled)"
   - Application continues to function

2. **localStorage Quota Exceeded**:
   - Clear old sidebar state data
   - Attempt to save again
   - If still fails, fallback to in-memory storage
   - Log error for debugging

3. **Invalid Data in localStorage**:
   - Clear corrupted data
   - Use default sidebar state
   - Log Zod validation error for debugging

---

## Future API Integration (Optional)

If dashboard configuration needs to be fetched from an external API in the future, the Repository pattern allows seamless migration:

### Proposed API Endpoints

```
GET /api/dashboard/config
  Response: DashboardConfig (user, teams, navMain, projects)
  
GET /api/dashboard/sidebar-state
  Response: SidebarState (user's saved preference)
  
PUT /api/dashboard/sidebar-state
  Request: SidebarState
  Response: 200 OK
```

### Migration Path

1. Create `ApiDashboardConfigRepository` implementing `IDashboardConfigRepository`
2. Create `ApiSidebarStateRepository` implementing `ISidebarStateRepository`
3. Use dependency injection to swap implementations
4. No changes to components or hooks required (Dependency Inversion Principle)

**Example**:
```typescript
// Before (mock data)
<SidebarProvider repository={new LocalStorageSidebarStateRepository()}>
  <DashboardLayout config={mockDashboardConfig} />
</SidebarProvider>

// After (API data)
<SidebarProvider repository={new ApiSidebarStateRepository()}>
  <DashboardLayout config={await getDashboardConfig()} />
</SidebarProvider>
```

---

## Validation Contracts

All data structures MUST be validated using Zod schemas defined in `data-model.md`:

- `UserSchema`
- `TeamSchema`
- `NavigationItemSchema`
- `ProjectSchema`
- `BreadcrumbPathSchema`
- `SidebarStateSchema`
- `DashboardConfigSchema`

**Validation Points**:
1. When loading mock data (development safeguard)
2. When reading from localStorage
3. When saving to localStorage
4. At component boundaries (props validation in development)

---

## Summary

- **No external APIs** for this feature
- **Mock data** for dashboard configuration
- **localStorage** for sidebar state persistence (via Repository pattern)
- **Repository interfaces** enable future API integration without code changes
- **Zod validation** at all data boundaries
- **Error handling** with graceful fallbacks

**Status**: Contracts defined ✅
