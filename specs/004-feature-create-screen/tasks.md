# Tasks: Dashboard Screen with Sidebar Navigation

**Feature Branch**: `004-feature-create-screen`  
**Input**: Design documents from `/specs/004-feature-create-screen/`  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/README.md, research.md

**User Context**: Keep current UI components, only add Clean Architecture logic layers

**Tests**: Not explicitly requested - focusing on implementation only

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- File paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create Clean Architecture folder structure without modifying existing UI

- [ ] T001 Create directory structure for Clean Architecture layers in `src/app/dashboard/`
  - Create `src/app/dashboard/dto/` (Data Transfer Objects)
  - Create `src/app/dashboard/core/` (Domain Layer - pure business logic)
  - Create `src/app/dashboard/repositories/` (Infrastructure Layer - data access)
  - Create `src/app/dashboard/providers/` (Dependency Injection)
  - Create `src/app/dashboard/hooks/` (Application Layer - use cases)
  - Create `src/app/dashboard/data/` (Mock data moved from components)
  - Note: `src/app/dashboard/components/` already exists with UI

- [ ] T002 [P] Move existing components to correct location if needed
  - Verify `src/app/dashboard/components/app-sidebar.tsx` exists
  - Verify `src/app/dashboard/components/nav-main.tsx` exists (currently at `src/components/`)
  - Verify `src/app/dashboard/components/nav-projects.tsx` exists (currently at `src/components/`)
  - Verify `src/app/dashboard/components/nav-user.tsx` exists (currently at `src/components/`)
  - Verify `src/app/dashboard/components/team-switcher.tsx` exists (currently at `src/components/`)
  - Move components from `src/components/` to `src/app/dashboard/components/` if they are dashboard-specific

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data structures and validation that ALL user stories depend on

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

### Data Transfer Objects (DTOs) - Foundation for all entities

- [ ] T003 Create Zod schemas and TypeScript types in `src/app/dashboard/dto/DashboardTypes.ts`
  - Define `UserSchema` with id, name, email, avatar validation
  - Define `PlanTypeSchema` enum ('Free', 'Startup', 'Enterprise')
  - Define `TeamSchema` with id, name, logo (function), plan validation
  - Define `NavigationSubItemSchema` with id, title, url validation
  - Define `NavigationItemSchema` with id, title, url, icon (function), isActive, optional items array
  - Define `ProjectSchema` with id, name, url, icon (function) validation
  - Define `SidebarStateSchema` with isCollapsed, isMobileOpen, activeNavItemId (nullable) validation
  - Define `DashboardConfigSchema` combining User, Teams array, NavMain array, Projects array
  - Export all inferred TypeScript types using `z.infer<typeof Schema>`

### Domain Layer (Core Business Logic) - Pure functions

- [ ] T004 [P] Create validation functions in `src/app/dashboard/core/ValidationFunctions.ts`
  - Implement `validateDashboardConfig(data: unknown): DashboardConfig` using Zod parse
  - Implement `validateSidebarState(data: unknown): SidebarState | null` using Zod safeParse
  - Implement `getDefaultSidebarState(): SidebarState` returning default values (isCollapsed: false, isMobileOpen: false, activeNavItemId: null)
  - All functions are pure (no side effects, no external dependencies)

- [ ] T005 [P] Create sidebar state logic in `src/app/dashboard/core/SidebarLogic.ts`
  - Implement `toggleSidebar(isCollapsed: boolean): boolean` - returns opposite state
  - Implement `shouldAutoCollapse(screenWidth: number): boolean` - returns true if screenWidth < 768
  - Implement `deriveActiveNavItemId(pathname: string, navItems: NavigationItem[]): string | null`
    - Iterate through navItems checking if pathname matches item.url or starts with item.url + '/'
    - Check sub-items if present, return parent item ID if sub-item matches
    - Return null if no match found
  - All functions are pure (testable without React or external dependencies)

### Mock Data - Extracted from inline component data

- [ ] T006 Create mock dashboard configuration in `src/app/dashboard/data/mockDashboardConfig.ts`
  - Import Lucide React icons (SquareTerminal, Bot, BookOpen, Settings2, GalleryVerticalEnd, AudioWaveform, Command, Frame, PieChart, Map)
  - Define `mockDashboardConfig` object matching `DashboardConfig` type
  - Include user: { id: 'user-1', name: 'shadcn', email: 'm@example.com', avatar: '/avatars/shadcn.jpg' }
  - Include teams array with 3 teams (Acme Inc, Acme Corp., Evil Corp.)
  - Include navMain array with 4 navigation items (Playground, Models, Documentation, Settings) with sub-items
  - Include projects array with 3 projects (Design Engineering, Sales & Marketing, Travel)
  - Export `mockDashboardConfig` with Zod validation applied
  - This replaces the inline `data` constant in app-sidebar.tsx

**Checkpoint**: Foundation complete - Clean Architecture structure ready, mock data extracted, validation in place

---

## Phase 3: User Story 1 - Access Dashboard with Collapsible Sidebar (Priority: P1) 🎯 MVP

**Goal**: Implement sidebar state management with persistence using Clean Architecture, keeping existing UI

**Independent Test**: Load dashboard, click collapse/expand toggle, reload page to verify state persists

### Infrastructure Layer (Data Access via Repository Pattern)

- [ ] T007 Create repository interface in `src/app/dashboard/repositories/ISidebarStateRepository.ts`
  - Define `ISidebarStateRepository` interface with methods:
    - `getState(): Promise<SidebarState | null>` - retrieve sidebar state
    - `setState(state: SidebarState): Promise<void>` - save sidebar state
    - `clearState(): Promise<void>` - remove sidebar state
    - `isAvailable(): boolean` - check if storage is available
  - Export interface (no implementation yet)

- [ ] T008 Implement localStorage repository in `src/app/dashboard/repositories/LocalStorageSidebarStateRepository.ts`
  - Import `ISidebarStateRepository` interface and `SidebarState` type
  - Import validation functions from core layer
  - Define storage key constant: `STORAGE_KEY = 'dashboard:sidebarState'`
  - Implement `class LocalStorageSidebarStateRepository implements ISidebarStateRepository`
  - Implement `isAvailable()`: try localStorage test, catch exceptions, return boolean
  - Implement `getState()`: read from localStorage, parse JSON, validate with Zod, return state or null on error
  - Implement `setState(state)`: validate state with Zod, stringify, save to localStorage, throw on error
  - Implement `clearState()`: remove key from localStorage, silent on error
  - Handle localStorage quota exceeded, disabled, and private mode errors gracefully

- [ ] T009 [P] Implement in-memory fallback repository in `src/app/dashboard/repositories/InMemorySidebarStateRepository.ts`
  - Import `ISidebarStateRepository` interface and `SidebarState` type
  - Implement `class InMemorySidebarStateRepository implements ISidebarStateRepository`
  - Use private property `state: SidebarState | null = null` for storage
  - Implement all interface methods using in-memory state
  - `isAvailable()` always returns true
  - Used as fallback when localStorage is unavailable or for testing

### Dependency Injection (React Context Provider)

- [ ] T010 Create sidebar state provider in `src/app/dashboard/providers/SidebarProvider.tsx`
  - Add 'use client' directive at top
  - Import React createContext, useContext, useState, useEffect
  - Import repository implementations and interface
  - Import `SidebarState` type and `getDefaultSidebarState` function
  - Define `SidebarContextValue` interface with: state, setState, repository
  - Create `SidebarContext` with createContext
  - Implement `SidebarProvider` component accepting children and optional repository prop
  - Initialize repository: try LocalStorageSidebarStateRepository, fallback to InMemorySidebarStateRepository if unavailable
  - Initialize state with getDefaultSidebarState(), track loading state
  - useEffect: load initial state from repository on mount
  - useEffect: persist state changes to repository (skip if loading)
  - Provide context value to children
  - Export `useSidebarContext()` hook that throws error if used outside provider

### Application Layer (Use Case Hook)

- [ ] T011 Create sidebar state management hook in `src/app/dashboard/hooks/useSidebar.ts`
  - Add 'use client' directive at top
  - Import useCallback from React
  - Import `useSidebarContext` from providers
  - Implement `useSidebar()` hook
  - Destructure state and setState from context
  - Implement `toggle()` using useCallback: toggle isCollapsed state
  - Implement `expand()` using useCallback: set isCollapsed to false
  - Implement `collapse()` using useCallback: set isCollapsed to true
  - Implement `openMobile()` using useCallback: set isMobileOpen to true
  - Implement `closeMobile()` using useCallback: set isMobileOpen to false
  - Implement `setActiveNavItem(id: string | null)` using useCallback: update activeNavItemId
  - Return object with: state, isCollapsed, isMobileOpen, activeNavItemId, toggle, expand, collapse, openMobile, closeMobile, setActiveNavItem
  - No direct localStorage access - all through repository via context

- [ ] T012 [P] Create responsive media query hook in `src/app/dashboard/hooks/useMediaQuery.ts`
  - Add 'use client' directive at top
  - Import useState, useEffect from React
  - Implement `useMediaQuery(query: string): boolean`
    - Use window.matchMedia to create MediaQueryList
    - Track matches state with useState
    - Add change event listener in useEffect
    - Cleanup listener on unmount
    - Return current matches state
  - Export helper hooks:
    - `useIsMobile()`: returns useMediaQuery('(max-width: 767px)')
    - `useIsTablet()`: returns useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
    - `useIsDesktop()`: returns useMediaQuery('(min-width: 1024px)')

### Presentation Layer Integration (Update Existing UI)

- [ ] T013 Update app-sidebar.tsx to use mock data from data layer
  - Import `mockDashboardConfig` from `src/app/dashboard/data/mockDashboardConfig.ts`
  - Remove inline `data` constant
  - Replace all `data.user` references with `mockDashboardConfig.user`
  - Replace all `data.teams` references with `mockDashboardConfig.teams`
  - Replace all `data.navMain` references with `mockDashboardConfig.navMain`
  - Replace all `data.projects` references with `mockDashboardConfig.projects`
  - Keep all component structure and styling unchanged
  - Update imports if nav components moved to dashboard/components

- [ ] T014 Update dashboard page.tsx to integrate SidebarProvider
  - Import `SidebarProvider` from `src/app/dashboard/providers/SidebarProvider.tsx`
  - Wrap existing `<SidebarProvider>` with our custom provider (or replace if it's just from UI library)
  - Keep all existing layout structure (AppSidebar, SidebarInset, header, breadcrumb, content)
  - Add error boundary (error.tsx) at route level if not present
  - Ensure 'use client' directive is appropriate based on provider usage

### Error Handling

- [ ] T015 [P] Create error boundary component in `src/app/dashboard/error.tsx`
  - Add 'use client' directive at top
  - Implement default export function with error and reset props
  - Display user-friendly error message
  - Provide "Try again" button that calls reset()
  - Log error to console for debugging
  - Follow Next.js error.tsx conventions

**Checkpoint**: User Story 1 complete - Sidebar state management with persistence works using Clean Architecture, existing UI unchanged

---

## Phase 4: User Story 7 - Responsive Dashboard Layout (Priority: P1)

**Goal**: Ensure sidebar adapts to mobile/tablet/desktop using responsive hooks

**Independent Test**: Resize browser window or test on different devices, verify sidebar behavior changes appropriately

### Implementation (Reuses Foundation)

- [ ] T016 Add responsive behavior to AppSidebar component in `src/app/dashboard/components/app-sidebar.tsx`
  - Import `useSidebar` hook from `src/app/dashboard/hooks/useSidebar.ts`
  - Import `useIsMobile` from `src/app/dashboard/hooks/useMediaQuery.ts`
  - Destructure isCollapsed, isMobileOpen, openMobile, closeMobile from useSidebar()
  - Get isMobile boolean from useIsMobile()
  - On mobile: render sidebar in Sheet component (use existing `src/components/ui/sheet.tsx`)
  - On desktop/tablet: render sidebar normally with collapsible behavior
  - Pass isCollapsed state to Sidebar component
  - Keep all existing styling and structure

- [ ] T017 Update SidebarTrigger behavior in page.tsx
  - Import `useSidebar` hook
  - On mobile: trigger openMobile() / closeMobile()
  - On desktop: trigger toggle()
  - Keep existing trigger button styling and positioning

**Checkpoint**: User Story 7 complete - Responsive layout works across all device sizes

---

## Phase 5: User Story 4 - View Content Area with Breadcrumb Navigation (Priority: P1)

**Goal**: Breadcrumb navigation that adapts to mobile/desktop (already in UI, just verify integration)

**Independent Test**: View breadcrumbs on desktop (full path), view on mobile (current page only)

### Implementation (Verify Existing)

- [ ] T018 Verify breadcrumb responsive behavior in page.tsx
  - Existing breadcrumb uses `className="hidden md:block"` for parent items (correct)
  - Current page (BreadcrumbPage) always visible (correct)
  - No logic changes needed - just verify it follows spec requirements
  - If breadcrumbs need to be dynamic, add logic to derive from current pathname

**Checkpoint**: User Story 4 complete - Breadcrumb navigation verified to work responsively

---

## Phase 6: User Story 2 - Navigate Through Multi-Level Menu (Priority: P2)

**Goal**: Hierarchical navigation with expand/collapse works (UI already has it, verify integration)

**Independent Test**: Click navigation items with sub-items, verify they expand; click sub-items, verify they navigate and highlight

### Implementation (Verify Existing, Add Active State)

- [ ] T019 Add active navigation state to NavMain component in `src/app/dashboard/components/nav-main.tsx`
  - Import `usePathname` from 'next/navigation'
  - Import `useSidebar` hook
  - Get current pathname from usePathname()
  - Import `deriveActiveNavItemId` from core layer
  - Calculate activeNavItemId using deriveActiveNavItemId(pathname, items)
  - Call setActiveNavItem(activeNavItemId) from useSidebar hook
  - Pass isActive state to Collapsible items based on activeNavItemId match
  - Keep existing Collapsible component structure and styling
  - Ensure sub-items highlight when active

**Checkpoint**: User Story 2 complete - Multi-level navigation with active state works

---

## Phase 7: User Story 3 - Switch Between Teams/Workspaces (Priority: P2)

**Goal**: Team switcher dropdown works (UI already has it, add team state management if needed)

**Independent Test**: Click team switcher, select different team, verify context updates

### Implementation (Add Team State if Needed)

- [ ] T020 Add team state management in `src/app/dashboard/hooks/useTeam.ts` (optional)
  - Create hook similar to useSidebar for team context
  - Track active team ID in state
  - Persist active team to localStorage via repository pattern (if needed)
  - Or keep team state in URL query params (simpler approach)
  - Decision: If team switching is just visual, keep existing implementation
  - If team context affects data loading, implement full team state management

- [ ] T021 Verify TeamSwitcher component integration in `src/app/dashboard/components/team-switcher.tsx`
  - Verify it receives teams array from mockDashboardConfig
  - Verify dropdown interaction works
  - If team state added in T020, integrate useTeam hook
  - Keep existing dropdown styling and structure

**Checkpoint**: User Story 3 complete - Team switching works (with or without persistence based on requirements)

---

## Phase 8: User Story 5 - Access User Profile Menu (Priority: P3)

**Goal**: User profile section in sidebar footer shows profile info and menu

**Independent Test**: View user profile in sidebar footer, click to open menu (if applicable)

### Implementation (Verify Existing)

- [ ] T022 Verify NavUser component integration in `src/app/dashboard/components/nav-user.tsx`
  - Verify it receives user object from mockDashboardConfig
  - Verify profile information displays (name, email, avatar)
  - When sidebar collapsed: only avatar visible (verify CSS handles this)
  - When sidebar expanded: full profile visible
  - If dropdown menu needed: add DropdownMenu from existing UI components
  - Keep existing styling

**Checkpoint**: User Story 5 complete - User profile section works

---

## Phase 9: User Story 6 - View and Access Quick Projects (Priority: P3)

**Goal**: Projects section in sidebar shows project list

**Independent Test**: View projects in sidebar, click project link to navigate

### Implementation (Verify Existing)

- [ ] T023 Verify NavProjects component integration in `src/app/dashboard/components/nav-projects.tsx`
  - Verify it receives projects array from mockDashboardConfig
  - Verify project items render with icons and names
  - When sidebar collapsed: only icons visible
  - When sidebar expanded: icons and names visible
  - Verify navigation links work
  - Keep existing structure and styling

**Checkpoint**: User Story 6 complete - Projects quick access works

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and documentation

- [ ] T024 [P] Create public API barrel export in `src/app/dashboard/index.ts`
  - Export all public types from dto/DashboardTypes.ts
  - Export hooks: useSidebar, useMediaQuery, useIsMobile, useIsTablet, useIsDesktop
  - Export providers: SidebarProvider
  - Export repository interface: ISidebarStateRepository
  - Export validation functions from core layer
  - Do NOT export repository implementations (internal infrastructure)
  - Do NOT export internal helpers

- [ ] T025 [P] Add TypeScript strict mode validation
  - Run `pnpm tsc --noEmit` to check for type errors
  - Fix any `any` types that crept in
  - Ensure all props interfaces are exported and documented
  - Verify Zod schemas cover all validation cases

- [ ] T026 [P] Verify accessibility compliance
  - Test keyboard navigation: Tab through all interactive elements
  - Verify ARIA labels on icon-only buttons (sidebar collapsed state)
  - Test with screen reader (if available): nav should announce properly
  - Verify focus indicators are visible
  - Check color contrast for WCAG AA compliance

- [ ] T027 [P] Performance check
  - Run Next.js build: `pnpm build`
  - Check bundle size for dashboard route
  - Verify sidebar toggle animation is smooth (< 300ms)
  - Test with 20+ navigation items to ensure no degradation
  - Add React.memo to components if needed

- [ ] T028 [P] Update CLAUDE.md context file
  - Already updated by `/speckit.plan` command
  - Verify dashboard feature is documented
  - No action needed unless manual updates required

- [ ] T029 Add loading state component in `src/app/dashboard/loading.tsx` (optional)
  - Create loading.tsx with Skeleton components
  - Show loading skeleton for sidebar and content area
  - Follows Next.js loading.tsx conventions
  - Only if needed for better UX

- [ ] T030 [P] Create error logging utility in `src/app/dashboard/utils/errorLogger.ts`
  - Create utils directory if not exists
  - Implement `logError(error: Error, context?: Record<string, any>): void` function
  - Use console.error with error details, stack trace, and context
  - Include timestamp, user agent, and current URL in context
  - Follow NFR-001 requirement for error logging
  - Pure utility function (no React dependencies)

- [ ] T031 [P] Create performance tracking utility in `src/app/dashboard/utils/performanceTracker.ts`
  - Implement `trackPageLoad(): void` using Navigation Timing API
  - Implement `trackSidebarToggle(action: 'start' | 'end'): void` using User Timing API
  - Use performance.mark() and performance.measure() for timing
  - Log metrics to console in development mode
  - Follow NFR-002, NFR-003, NFR-004 requirements
  - Pure utility function (no React dependencies)

- [ ] T032 Integrate performance tracking in `src/app/dashboard/page.tsx`
  - Import performanceTracker utility
  - Add useEffect to track page load time on mount
  - Call trackPageLoad() after component renders
  - Measure time from navigation start to first contentful paint
  - Log result for monitoring (FR-017)

- [ ] T033 Integrate performance tracking in `src/app/dashboard/hooks/useSidebar.ts`
  - Import performanceTracker utility
  - Add performance.mark('sidebar-toggle-start') before state change in toggle()
  - Add performance.mark('sidebar-toggle-end') after state change completes
  - Use performance.measure() to calculate duration
  - Track animation completion time (< 300ms per SC-002)
  - Log result for monitoring (FR-017)

**Checkpoint**: All polish tasks complete - Feature ready for testing with observability

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - START HERE
2. **Foundational (Phase 2)**: Depends on Setup - BLOCKS ALL USER STORIES
3. **User Story 1 (Phase 3)**: Depends on Foundational - MVP CRITICAL
4. **User Story 7 (Phase 4)**: Depends on User Story 1 (uses useSidebar hook)
5. **User Story 4 (Phase 5)**: Depends on Foundational - Can parallelize with US1/US7
6. **User Story 2 (Phase 6)**: Depends on User Story 1 (uses useSidebar hook)
7. **User Story 3 (Phase 7)**: Depends on Foundational - Can parallelize after Foundational
8. **User Story 5 (Phase 8)**: Depends on Foundational - Can parallelize after Foundational
9. **User Story 6 (Phase 9)**: Depends on Foundational - Can parallelize after Foundational
10. **Polish (Phase 10)**: Depends on all desired user stories being complete

### Critical Path (MVP - Minimum Viable Product)

```
Setup → Foundational → User Story 1 + User Story 7 → User Story 4
```

This gives you: Collapsible sidebar with persistence + Responsive layout + Breadcrumbs = Functional MVP

### Parallel Opportunities

**After Setup complete**:
- T003 (DTOs), T004 (ValidationFunctions), T005 (SidebarLogic), T006 (mockData) can all run in parallel

**After Foundational complete**:
- User Story 1 (Phase 3) - MUST complete first (others depend on it)
- Once US1 complete:
  - User Story 7 (responsive) in parallel with
  - User Story 4 (breadcrumbs) in parallel with
  - User Story 2 (navigation active state)
- User Story 3, 5, 6 can all run in parallel after Foundational (don't depend on US1)

**During Polish**:
- All T024-T029 tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After Setup complete, launch all foundational tasks together:

# Terminal 1:
Task T003: "Create Zod schemas in src/app/dashboard/dto/DashboardTypes.ts"

# Terminal 2:
Task T004: "Create validation functions in src/app/dashboard/core/ValidationFunctions.ts"

# Terminal 3:
Task T005: "Create sidebar logic in src/app/dashboard/core/SidebarLogic.ts"

# Terminal 4:
Task T006: "Create mock data in src/app/dashboard/data/mockDashboardConfig.ts"
```

---

## Implementation Strategy

### MVP First (Fastest Path to Working Dashboard)

1. **Phase 1**: Setup (T001-T002) → 30 min
2. **Phase 2**: Foundational (T003-T006) → 1-2 hours (parallel)
3. **Phase 3**: User Story 1 (T007-T015) → 2-3 hours (sequential)
4. **Phase 4**: User Story 7 (T016-T017) → 1 hour
5. **Phase 5**: User Story 4 (T018) → 15 min (verification only)

**Total MVP Time**: ~5-7 hours for fully functional collapsible, responsive dashboard with persistence

### Full Feature Delivery

Continue with:
6. **Phase 6**: User Story 2 (T019) → 30 min
7. **Phase 7**: User Story 3 (T020-T021) → 1 hour
8. **Phase 8**: User Story 5 (T022) → 30 min (verification)
9. **Phase 9**: User Story 6 (T023) → 30 min (verification)
10. **Phase 10**: Polish (T024-T029) → 2-3 hours (parallel)

**Total Full Feature Time**: ~10-14 hours

### Validation Checkpoints

After each phase, verify:
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] No console errors when loading dashboard
- [ ] Sidebar toggle works
- [ ] State persists across page reloads
- [ ] Responsive behavior works on mobile/desktop
- [ ] All navigation links are functional

---

## Key Implementation Notes

### Preserving Existing UI

**DO NOT MODIFY** (keep as-is):
- UI component structure and JSX in components
- Tailwind CSS classes and styling
- Radix UI component usage patterns
- Component composition and hierarchy

**DO MODIFY** (add Clean Architecture):
- Extract inline mock data → move to data layer
- Add imports for hooks, providers, types
- Add 'use client' directives where needed
- Wire up state management via hooks
- Add repository-based persistence

### Clean Architecture Boundaries

**Domain Layer** (`core/`):
- Pure functions only
- No React, no Next.js, no external libraries
- Testable with just TypeScript

**Infrastructure Layer** (`repositories/`):
- Only place that touches localStorage
- Implements interfaces defined by domain
- Concrete implementations hidden from application layer

**Application Layer** (`hooks/`):
- Orchestrates domain logic and infrastructure
- Uses repository interfaces (not implementations)
- React hooks that components consume

**Presentation Layer** (`components/`):
- UI components only
- No business logic (use hooks for logic)
- No direct localStorage access

### Type Safety

All data flows through Zod validation:
```
Mock Data → Zod Schema → Type-safe TypeScript → Components
localStorage → Zod Schema → Type-safe TypeScript → Components
```

Never trust external data (localStorage, API responses, etc.)

---

## Success Criteria Verification

After implementation, verify these success criteria from spec.md:

- [ ] **SC-001**: Dashboard loads with all navigation elements within 2 seconds
- [ ] **SC-002**: Sidebar toggle completes within 300 milliseconds
- [ ] **SC-003**: Layout adapts correctly on mobile (320px+), tablet (768px+), desktop (1024px+)
- [ ] **SC-004**: Any navigation item reachable within 3 clicks
- [ ] **SC-005**: Sidebar collapse/expand feature is intuitive (user testing recommended)
- [ ] **SC-006**: Team switching completes within 1 second (if implemented)
- [ ] **SC-007**: Sidebar state persists across browser sessions
- [ ] **SC-008**: Dashboard supports 20+ navigation items without degradation
- [ ] **SC-009**: All interactive elements meet WCAG 2.1 AA (keyboard nav, ARIA, contrast)
- [ ] **SC-010**: Navigation tasks faster with collapsible sidebar (user testing recommended)

---

## Final Notes

- **Estimated total tasks**: 33 tasks (29 base + 4 observability tasks)
- **Parallel opportunities**: 14 tasks can run in parallel (marked [P])
- **MVP tasks**: 15 tasks (Setup + Foundational + US1 + US7 + US4)
- **Observability tasks**: 4 tasks (T030-T033 for error logging and performance tracking)
- **Total estimated time**: 12-16 hours for full feature (includes observability)
- **MVP estimated time**: 5-7 hours (before observability additions)

**Next Command**: `/speckit.implement` to execute these tasks automatically

---

**Status**: Tasks generated ✅  
**Ready for Implementation**: ✅
