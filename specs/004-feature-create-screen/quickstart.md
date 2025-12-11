# Quickstart: Dashboard Screen Implementation

**Feature**: 004-feature-create-screen  
**Date**: 2025-10-12  
**Purpose**: Step-by-step guide to implement the dashboard feature

## Prerequisites

- Next.js 15.5.4 project setup complete
- All dependencies installed (see `package.json`)
- TypeScript 5.9.3 configured with strict mode
- Tailwind CSS 4.x configured
- Radix UI components available in `src/components/ui/`

## Implementation Steps

### Phase 1: Core Infrastructure (Clean Architecture Setup)

#### Step 1.1: Create Domain Layer (Pure Business Logic)

**Location**: `src/app/dashboard/core/`

**Files to create**:

1. **SidebarLogic.ts** - Sidebar state transitions
```typescript
// src/app/dashboard/core/SidebarLogic.ts
export function toggleSidebar(isCollapsed: boolean): boolean {
  return !isCollapsed;
}

export function shouldAutoCollapse(screenWidth: number): boolean {
  return screenWidth < 768; // Mobile breakpoint
}

export function deriveActiveNavItemId(
  pathname: string,
  navItems: NavigationItem[]
): string | null {
  // Logic from data-model.md
}
```

2. **ValidationFunctions.ts** - Data validation
```typescript
// src/app/dashboard/core/ValidationFunctions.ts
export function validateDashboardConfig(data: unknown): DashboardConfig {
  return DashboardConfigSchema.parse(data);
}

export function validateSidebarState(data: unknown): SidebarState | null {
  const result = SidebarStateSchema.safeParse(data);
  return result.success ? result.data : null;
}

export function getDefaultSidebarState(): SidebarState {
  return {
    isCollapsed: false,
    isMobileOpen: false,
    activeNavItemId: null,
  };
}
```

#### Step 1.2: Create DTO Layer (Data Transfer Objects)

**Location**: `src/app/dashboard/dto/`

**Files to create**:

1. **DashboardTypes.ts** - Zod schemas and types
```typescript
// src/app/dashboard/dto/DashboardTypes.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  avatar: z.string().url(),
});

export const TeamSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  logo: z.function(),
  plan: z.enum(['Free', 'Startup', 'Enterprise']),
});

export const NavigationSubItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().min(1),
});

export const NavigationItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().min(1),
  icon: z.function(),
  isActive: z.boolean().optional(),
  items: z.array(NavigationSubItemSchema).optional(),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().min(1),
  icon: z.function(),
});

export const SidebarStateSchema = z.object({
  isCollapsed: z.boolean(),
  isMobileOpen: z.boolean(),
  activeNavItemId: z.string().nullable(),
});

export const DashboardConfigSchema = z.object({
  user: UserSchema,
  teams: z.array(TeamSchema).min(1),
  navMain: z.array(NavigationItemSchema).min(1),
  projects: z.array(ProjectSchema),
});

// Infer types
export type User = z.infer<typeof UserSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type NavigationSubItem = z.infer<typeof NavigationSubItemSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type SidebarState = z.infer<typeof SidebarStateSchema>;
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
```

#### Step 1.3: Create Infrastructure Layer (Repositories)

**Location**: `src/app/dashboard/repositories/`

**Files to create**:

1. **ISidebarStateRepository.ts** - Interface
```typescript
// src/app/dashboard/repositories/ISidebarStateRepository.ts
import { SidebarState } from '../dto/DashboardTypes';

export interface ISidebarStateRepository {
  getState(): Promise<SidebarState | null>;
  setState(state: SidebarState): Promise<void>;
  clearState(): Promise<void>;
  isAvailable(): boolean;
}
```

2. **LocalStorageSidebarStateRepository.ts** - Implementation
```typescript
// src/app/dashboard/repositories/LocalStorageSidebarStateRepository.ts
import { ISidebarStateRepository } from './ISidebarStateRepository';
import { SidebarState, SidebarStateSchema } from '../dto/DashboardTypes';
import { validateSidebarState } from '../core/ValidationFunctions';

const STORAGE_KEY = 'dashboard:sidebarState';

export class LocalStorageSidebarStateRepository implements ISidebarStateRepository {
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  async getState(): Promise<SidebarState | null> {
    if (!this.isAvailable()) return null;
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return validateSidebarState(parsed);
    } catch (error) {
      console.error('Failed to read sidebar state', error);
      return null;
    }
  }

  async setState(state: SidebarState): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('localStorage is not available');
    }
    
    try {
      const validated = SidebarStateSchema.parse(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('Failed to save sidebar state', error);
      throw error;
    }
  }

  async clearState(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear sidebar state', error);
    }
  }
}
```

3. **InMemorySidebarStateRepository.ts** - Fallback/Testing
```typescript
// src/app/dashboard/repositories/InMemorySidebarStateRepository.ts
import { ISidebarStateRepository } from './ISidebarStateRepository';
import { SidebarState } from '../dto/DashboardTypes';

export class InMemorySidebarStateRepository implements ISidebarStateRepository {
  private state: SidebarState | null = null;

  isAvailable(): boolean {
    return true;
  }

  async getState(): Promise<SidebarState | null> {
    return this.state;
  }

  async setState(state: SidebarState): Promise<void> {
    this.state = state;
  }

  async clearState(): Promise<void> {
    this.state = null;
  }
}
```

### Phase 2: Application Layer (Hooks & State Management)

#### Step 2.1: Create Dependency Injection Provider

**Location**: `src/app/dashboard/providers/`

**Files to create**:

1. **SidebarProvider.tsx**
```typescript
// src/app/dashboard/providers/SidebarProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ISidebarStateRepository } from '../repositories/ISidebarStateRepository';
import { LocalStorageSidebarStateRepository } from '../repositories/LocalStorageSidebarStateRepository';
import { InMemorySidebarStateRepository } from '../repositories/InMemorySidebarStateRepository';
import { SidebarState } from '../dto/DashboardTypes';
import { getDefaultSidebarState } from '../core/ValidationFunctions';

interface SidebarContextValue {
  state: SidebarState;
  setState: (state: SidebarState) => void;
  repository: ISidebarStateRepository;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
  children: React.ReactNode;
  repository?: ISidebarStateRepository;
}

export function SidebarProvider({ children, repository }: SidebarProviderProps) {
  const [repo] = useState<ISidebarStateRepository>(() => {
    if (repository) return repository;
    
    // Try localStorage, fallback to in-memory
    const localStorageRepo = new LocalStorageSidebarStateRepository();
    return localStorageRepo.isAvailable()
      ? localStorageRepo
      : new InMemorySidebarStateRepository();
  });

  const [state, setState] = useState<SidebarState>(getDefaultSidebarState());
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state from repository
  useEffect(() => {
    repo.getState().then((savedState) => {
      if (savedState) {
        setState(savedState);
      }
      setIsLoading(false);
    });
  }, [repo]);

  // Save state to repository when it changes
  useEffect(() => {
    if (!isLoading) {
      repo.setState(state).catch(console.error);
    }
  }, [state, repo, isLoading]);

  return (
    <SidebarContext.Provider value={{ state, setState, repository: repo }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within SidebarProvider');
  }
  return context;
}
```

#### Step 2.2: Create Application Hooks

**Location**: `src/app/dashboard/hooks/`

**Files to create**:

1. **useSidebar.ts**
```typescript
// src/app/dashboard/hooks/useSidebar.ts
'use client';

import { useCallback } from 'react';
import { useSidebarContext } from '../providers/SidebarProvider';

export function useSidebar() {
  const { state, setState } = useSidebarContext();

  const toggle = useCallback(() => {
    setState({ ...state, isCollapsed: !state.isCollapsed });
  }, [state, setState]);

  const expand = useCallback(() => {
    setState({ ...state, isCollapsed: false });
  }, [state, setState]);

  const collapse = useCallback(() => {
    setState({ ...state, isCollapsed: true });
  }, [state, setState]);

  const openMobile = useCallback(() => {
    setState({ ...state, isMobileOpen: true });
  }, [state, setState]);

  const closeMobile = useCallback(() => {
    setState({ ...state, isMobileOpen: false });
  }, [state, setState]);

  const setActiveNavItem = useCallback(
    (id: string | null) => {
      setState({ ...state, activeNavItemId: id });
    },
    [state, setState]
  );

  return {
    state,
    isCollapsed: state.isCollapsed,
    isMobileOpen: state.isMobileOpen,
    activeNavItemId: state.activeNavItemId,
    toggle,
    expand,
    collapse,
    openMobile,
    closeMobile,
    setActiveNavItem,
  };
}
```

2. **useMediaQuery.ts** - Responsive helper
```typescript
// src/app/dashboard/hooks/useMediaQuery.ts
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}
```

### Phase 3: Presentation Layer (Components)

#### Step 3.1: Create Mock Data

**Location**: `src/app/dashboard/data/`

**Files to create**:

1. **mockDashboardConfig.ts**
```typescript
// src/app/dashboard/data/mockDashboardConfig.ts
// Copy mock data example from data-model.md
import { DashboardConfig } from '../dto/DashboardTypes';
// ... (full mock data structure)
```

#### Step 3.2: Create UI Components

**Location**: `src/app/dashboard/components/`

**Files to create** (reuse/adapt existing components):

1. **AppSidebar.tsx** - Main sidebar wrapper
2. **NavMain.tsx** - Main navigation (hierarchical)
3. **NavProjects.tsx** - Projects list
4. **NavUser.tsx** - User profile section
5. **TeamSwitcher.tsx** - Team/workspace switcher
6. **DashboardLayout.tsx** - Main layout wrapper

**Note**: Most of these already exist in `src/components/` and can be moved/adapted to `src/app/dashboard/components/`

#### Step 3.3: Create Page and Layout

**Location**: `src/app/dashboard/`

**Files to create**:

1. **page.tsx** - Dashboard page
```typescript
// src/app/dashboard/page.tsx
import { SidebarProvider } from './providers/SidebarProvider';
import { AppSidebar } from './components/AppSidebar';
import { mockDashboardConfig } from './data/mockDashboardConfig';
import { SidebarInset } from '@/components/ui/sidebar';
// ... rest of implementation
```

2. **error.tsx** - Error boundary
```typescript
// src/app/dashboard/error.tsx
'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

3. **loading.tsx** - Loading UI (optional)
```typescript
// src/app/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return <div>Loading dashboard...</div>;
}
```

### Phase 4: Testing

#### Step 4.1: Unit Tests

**Location**: `tests/unit/dashboard/`

**Tests to create**:
- `core/SidebarLogic.test.ts`
- `core/ValidationFunctions.test.ts`
- `repositories/LocalStorageSidebarStateRepository.test.ts`

#### Step 4.2: Integration Tests

**Location**: `tests/integration/dashboard/`

**Tests to create**:
- `hooks/useSidebar.test.tsx`
- `providers/SidebarProvider.test.tsx`

#### Step 4.3: E2E Tests

**Location**: `tests/e2e/dashboard/`

**Tests to create**:
- `sidebar-toggle.spec.ts`
- `mobile-navigation.spec.ts`
- `state-persistence.spec.ts`

### Phase 5: Refinement

#### Step 5.1: Accessibility Audit
- Test keyboard navigation
- Test with screen reader
- Verify ARIA attributes
- Check color contrast

#### Step 5.2: Performance Optimization
- Measure bundle size
- Check Core Web Vitals
- Optimize re-renders with React.memo
- Add loading states

#### Step 5.3: Responsive Testing
- Test on mobile (320px, 375px, 414px)
- Test on tablet (768px, 1024px)
- Test on desktop (1280px, 1920px)

## Development Workflow

1. **Start development server**:
   ```bash
   pnpm dev
   ```

2. **Run tests** (once test files created):
   ```bash
   pnpm test
   ```

3. **Check TypeScript**:
   ```bash
   pnpm tsc --noEmit
   ```

4. **Build for production**:
   ```bash
   pnpm build
   ```

## File Structure Summary

```
src/app/dashboard/
├── page.tsx                           # Route entry
├── error.tsx                          # Error boundary
├── loading.tsx                        # Loading UI
│
├── components/                        # Presentation Layer
│   ├── AppSidebar.tsx
│   ├── NavMain.tsx
│   ├── NavProjects.tsx
│   ├── NavUser.tsx
│   ├── TeamSwitcher.tsx
│   └── DashboardLayout.tsx
│
├── hooks/                             # Application Layer
│   ├── useSidebar.ts
│   └── useMediaQuery.ts
│
├── core/                              # Domain Layer
│   ├── SidebarLogic.ts
│   └── ValidationFunctions.ts
│
├── repositories/                      # Infrastructure Layer
│   ├── ISidebarStateRepository.ts
│   ├── LocalStorageSidebarStateRepository.ts
│   └── InMemorySidebarStateRepository.ts
│
├── providers/                         # Dependency Injection
│   └── SidebarProvider.tsx
│
├── dto/                               # Data Transfer Objects
│   └── DashboardTypes.ts
│
├── data/                              # Mock Data
│   └── mockDashboardConfig.ts
│
└── index.ts                           # Barrel export
```

## Common Issues and Solutions

### Issue 1: localStorage not available
**Solution**: Use InMemorySidebarStateRepository as fallback (already implemented in SidebarProvider)

### Issue 2: Sidebar state not persisting
**Solution**: Check browser console for errors, verify localStorage quota, ensure SidebarProvider is wrapping components

### Issue 3: Hydration mismatch errors
**Solution**: Use 'use client' directive on components that use useState/useEffect, ensure initial state matches server/client

### Issue 4: Icons not rendering
**Solution**: Verify Lucide React icons are imported correctly, check function component syntax

### Issue 5: Mobile sidebar not opening
**Solution**: Check useMediaQuery hook, verify isMobileOpen state, ensure Sheet component is rendered on mobile

## Next Steps

After completing this implementation:

1. Run `/speckit.tasks` to generate detailed task list
2. Run `/speckit.implement` to execute implementation tasks
3. Test all user stories from spec.md
4. Conduct accessibility audit
5. Measure performance metrics

## Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Zod Documentation](https://zod.dev)
- [Clean Architecture Principles](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Implementation Status**: Ready to begin ✅

For detailed task breakdown, run: `/speckit.tasks`
