# Implementation Plan: Dashboard Screen with Sidebar Navigation

**Branch**: `004-feature-create-screen` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-feature-create-screen/spec.md`

**Note**: This plan includes clarifications from 2025-10-12 session regarding observability and localStorage fallback behavior.

## Summary

Primary requirement: Create a dashboard interface with collapsible sidebar navigation, team/workspace switching, hierarchical menu structure, user profile section, projects quick access, and responsive breadcrumb navigation. The dashboard must support responsive layouts (mobile/tablet/desktop) with sidebar state persistence across sessions.

Technical approach: Implement using Next.js 15.5.4 App Router with React 18.3.1 client components for interactive UI. Leverage existing Radix UI sidebar primitives and shadcn/ui component patterns. Use localStorage Repository pattern for sidebar state persistence with graceful fallback to in-memory storage when localStorage is unavailable. Implement responsive layouts with Tailwind CSS breakpoints and React hooks for sidebar state management. Include error logging and performance metrics tracking (page load time, sidebar toggle duration) for observability. All UI components follow Clean Architecture with separation between presentation (components), application (hooks for sidebar state), and infrastructure (localStorage repository for state persistence).

## Technical Context

**Language/Version**: TypeScript 5.9.3 with Next.js 15.5.4  
**Primary Dependencies**: 
- React 18.3.1 (client components for interactive UI)
- Zod 4.1.12 (data validation for dashboard configuration)
- Radix UI (@radix-ui/react-collapsible ^1.1.12, @radix-ui/react-dropdown-menu ^2.1.16, @radix-ui/react-separator ^1.1.7, @radix-ui/react-tooltip ^1.2.8, @radix-ui/react-avatar ^1.1.10)
- Lucide React 0.545.0 (navigation icons)
- Tailwind CSS 4.x with @tailwindcss/postcss (styling and responsive layouts)
- class-variance-authority 0.7.1, clsx 2.1.1, tailwind-merge 3.3.1 (component variants)

**Storage**: localStorage for sidebar state persistence (collapsed/expanded preference) with silent fallback to in-memory storage when unavailable, mock data structure for teams/navigation/projects (no external API for this feature)  
**Observability**: Error logging to console with exception details and context, performance metrics via browser Performance API (page load time, sidebar toggle duration)  
**Testing**: Unit tests for sidebar state logic, integration tests for component interactions, E2E tests for responsive behavior and state persistence  
**Target Platform**: Web (mobile 320px+, tablet 768px+, desktop 1024px+ browsers)  
**Project Type**: Frontend-Only Web Application (Next.js App Router, no backend database)  
**Performance Goals**: 
- Sidebar toggle animation < 300ms
- Page load < 2s LCP
- Responsive layout shift < 0.1 CLS
- Support 20+ navigation items without performance degradation

**Constraints**: 
- WCAG 2.1 AA accessibility (keyboard navigation, screen reader support)
- Core Web Vitals compliance
- No external API dependency (uses mock data structure)
- Mobile-first responsive design
- Silent localStorage fallback (no user-visible errors when storage unavailable)

**Scale/Scope**: 
- Single dashboard feature
- ~12-15 component files (sidebar, navigation, team switcher, user profile, breadcrumb, layout)
- ~3-4 hook files (sidebar state, navigation state, responsive breakpoints)
- ~2-3 repository files (localStorage + in-memory fallback for sidebar state)
- ~2 utility files (error logging, performance tracking)
- Estimated ~1800-2200 LOC total (including observability code)
- Reuses existing UI components (button, dropdown, collapsible, separator, avatar, breadcrumb, tooltip, skeleton, sheet from shadcn/ui)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Type Safety First
- [x] All components fully typed with TypeScript strict mode (sidebar, navigation, team switcher components)
- [x] Zod schemas defined for external data boundaries (dashboard configuration schema, navigation items schema, team data schema, sidebar state schema)
- [x] No `any` types without explicit justification

### ✅ Principle II: Component-Driven Architecture
- [x] UI features built as reusable, composable components (AppSidebar, NavMain, NavProjects, NavUser, TeamSwitcher, BreadcrumbNav)
- [x] Single responsibility principle followed (each component handles one UI concern)
- [x] Clear props interfaces documented (TeamSwitcherProps, NavMainProps, NavProjectsProps, NavUserProps)

### ✅ Principle III: Frontend-Only Rendering Strategy
- [x] Server components used for static page shells and SEO content (page.tsx as wrapper)
- [x] Client components used for forms, interactive UI, and API calls (all sidebar components with 'use client')
- [x] React Query NOT needed for this feature (no external API calls, uses mock data + localStorage only)
- [x] localStorage usage documented (non-sensitive data only: sidebar collapsed state, user preference)

### ✅ Principle IV: Data Validation & Error Handling
- [x] Zod schemas for all external inputs (DashboardConfigSchema for configuration validation, SidebarStateSchema for localStorage data)
- [x] Error boundaries at appropriate levels (error.tsx at dashboard route level)
- [x] User-facing errors are actionable and friendly (graceful fallback when localStorage fails - no user-visible errors per clarification)
- [x] Error logging implemented for debugging (console.error with context per NFR-001)

### ✅ Principle V: Performance & Accessibility
- [x] Core Web Vitals targets defined (LCP < 2s, CLS < 0.1, sidebar toggle < 300ms)
- [x] WCAG 2.1 AA compliance planned (keyboard navigation for sidebar, ARIA labels for icons, semantic HTML)
- [x] Semantic HTML and ARIA labels in components (nav, aside, button with aria-expanded, aria-label for icon-only buttons)
- [x] Performance monitoring implemented (browser Performance API for page load and sidebar toggle timing per NFR-002, NFR-003, NFR-004)

### ✅ Principle VI: Clean Architecture with SOLID Principles
- [x] All 4 architectural layers identified:
  - **Presentation**: components/ (AppSidebar, NavMain, NavProjects, NavUser, TeamSwitcher, DashboardLayout)
  - **Application**: hooks/ (useSidebar for state management, useMediaQuery for responsive)
  - **Domain**: core/ (sidebar state logic, validation functions)
  - **Infrastructure**: repositories/ (ISidebarStateRepository, LocalStorageSidebarStateRepository, InMemorySidebarStateRepository)
- [x] Repository pattern with interface abstraction designed (ISidebarStateRepository for state persistence)
- [x] Dependency Inversion Principle applied (useSidebar hook depends on ISidebarStateRepository interface)
- [x] Single Responsibility Principle followed (sidebar state, navigation rendering, team switching all separate)
- [x] Domain layer is framework-independent (pure business logic for sidebar state transitions)
- [x] Multiple repository implementations planned (LocalStorageSidebarStateRepository with InMemorySidebarStateRepository fallback per FR-018)
- [x] Dependency Injection via React Context providers designed (SidebarProvider with repository injection)
- [x] Feature structure follows Clean Architecture pattern from constitution

### ✅ Principle VII: Technology Stack & Architecture Standards
- [x] All dependencies align with approved frontend-only technology stack (Radix UI, Lucide React, Tailwind CSS - all pre-approved)
- [x] New dependencies evaluated against decision criteria (no new dependencies added, reuses existing UI components)
- [x] Bundle size impact considered (reusing existing components, no additional libraries)
- [x] Frontend-only architecture maintained (no database, no Server Actions, uses localStorage only)
- [x] External API endpoints documented and validated (N/A - uses mock data structure, no external APIs)
- [x] Technology choices documented in Technical Context section

**Status**: ✅ All principles satisfied

**Clarifications Applied**:
- Observability: Standard level - error logging + performance metrics (FR-016, FR-017, NFR-001 through NFR-004)
- localStorage Fallback: Silent graceful degradation - defaults to expanded, in-memory state, no user warnings (FR-018, NFR-005)

## Project Structure

### Documentation (this feature)

```
specs/004-feature-create-screen/
├── spec.md              # Feature specification (updated with clarifications 2025-10-12)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technology decisions and research
├── data-model.md        # Phase 1: Domain entities and data structures
├── quickstart.md        # Phase 1: Implementation guide
├── contracts/           # Phase 1: API contracts (localStorage interface)
│   └── README.md        # Contract documentation
├── checklists/          # Quality checklists
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2: Implementation task list (29 tasks)
```

### Source Code (repository root)

**Clean Architecture Structure** (Next.js App Router):

```
src/app/dashboard/
├── page.tsx                      # Route: Next.js page (presentation entry)
├── error.tsx                     # Error boundary
├── loading.tsx                   # Loading UI (optional)
│
├── components/                   # PRESENTATION LAYER
│   ├── app-sidebar.tsx           # Main sidebar wrapper
│   ├── nav-main.tsx              # Hierarchical navigation
│   ├── nav-projects.tsx          # Projects list
│   ├── nav-user.tsx              # User profile section
│   └── team-switcher.tsx         # Team/workspace switcher
│
├── hooks/                        # APPLICATION LAYER (Use Cases)
│   ├── useSidebar.ts             # Sidebar state management hook
│   └── useMediaQuery.ts          # Responsive breakpoint hooks
│
├── core/                         # DOMAIN LAYER (Business Logic)
│   ├── SidebarLogic.ts           # Pure functions: toggle, collapse, expand
│   └── ValidationFunctions.ts    # Zod validation helpers
│
├── repositories/                 # INFRASTRUCTURE LAYER (Data Access)
│   ├── ISidebarStateRepository.ts              # Interface: defines contract (DIP)
│   ├── LocalStorageSidebarStateRepository.ts   # Implementation: localStorage
│   └── InMemorySidebarStateRepository.ts       # Implementation: in-memory fallback
│
├── providers/                    # DEPENDENCY INJECTION
│   └── SidebarProvider.tsx       # React Context for DI + repository selection
│
├── dto/                          # DATA TRANSFER OBJECTS
│   └── DashboardTypes.ts         # Zod schemas + inferred TypeScript types
│
├── data/                         # MOCK DATA
│   └── mockDashboardConfig.ts    # Mock dashboard configuration
│
├── utils/                        # UTILITIES (NEW for observability)
│   ├── errorLogger.ts            # Error logging utility (console.error with context)
│   └── performanceTracker.ts     # Performance metrics (Performance API wrapper)
│
└── index.ts                      # Public API: barrel export

src/components/ui/                # Reusable UI components (existing)
├── sidebar.tsx                   # Radix UI sidebar primitives
├── breadcrumb.tsx                # Breadcrumb components
├── dropdown-menu.tsx             # Dropdown menu primitives
├── collapsible.tsx               # Collapsible primitives
├── tooltip.tsx                   # Tooltip primitives
├── avatar.tsx                    # Avatar component
├── separator.tsx                 # Separator component
└── sheet.tsx                     # Sheet component (for mobile sidebar)

tests/                            # Test files
├── unit/                         # Unit tests (core logic, utils)
│   ├── SidebarLogic.test.ts
│   ├── ValidationFunctions.test.ts
│   ├── errorLogger.test.ts
│   └── performanceTracker.test.ts
├── integration/                  # Integration tests (hooks, repositories)
│   ├── useSidebar.test.tsx
│   ├── LocalStorageSidebarStateRepository.test.ts
│   └── InMemorySidebarStateRepository.test.ts
└── e2e/                          # E2E tests (user flows)
    ├── sidebar-toggle.spec.ts
    ├── responsive-layout.spec.ts
    └── state-persistence.spec.ts
```

**Clean Architecture Notes**:
- **Layer Dependencies**: Presentation → Application → Domain ← Infrastructure
- **Domain Layer**: Pure business logic, no framework dependencies
- **Repository Pattern**: All data access through interfaces (ISidebarStateRepository)
- **Dependency Inversion**: Hooks depend on interfaces, not concrete implementations
- **Dependency Injection**: Repository implementations injected via React Context with automatic fallback
- **SOLID Principles**: Each layer follows SRP, DIP applied throughout
- **Observability Layer**: utils/ folder for error logging and performance tracking (cross-cutting concerns)
- No Server Actions or backend database (frontend-only)
- Multiple repository implementations (localStorage + in-memory) for resilience

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations** - All constitutional principles satisfied.

This feature fully complies with Clean Architecture and SOLID principles:
- Repository pattern used for localStorage abstraction (Dependency Inversion)
- Graceful fallback via InMemorySidebarStateRepository (Liskov Substitution)
- Clear layer separation (Presentation, Application, Domain, Infrastructure)
- No backend dependencies (frontend-only architecture maintained)
- All dependencies pre-approved and already in project
- Type safety with TypeScript strict mode and Zod validation
- Observability implemented without introducing new dependencies (browser APIs only)

## Implementation Notes

### Clarifications Applied (Session 2025-10-12)

**1. Observability Requirements**:
- **Decision**: Standard level - Error logging + performance metrics
- **Implementation**:
  - Create `src/app/dashboard/utils/errorLogger.ts` for console.error with context
  - Create `src/app/dashboard/utils/performanceTracker.ts` for Performance API wrapper
  - Track page load time (Navigation Timing API)
  - Track sidebar toggle duration (User Timing API with performance.mark/measure)
  - Log errors with exception details, stack traces, and user context
- **No new dependencies**: Uses browser-native Performance API and console

**2. localStorage Fallback Behavior**:
- **Decision**: Silent graceful degradation
- **Implementation**:
  - SidebarProvider tries LocalStorageSidebarStateRepository first
  - If localStorage unavailable (isAvailable() returns false), automatically falls back to InMemorySidebarStateRepository
  - No user-visible errors, warnings, or toasts
  - Sidebar always starts in expanded state when localStorage unavailable
  - State changes work normally but don't persist across sessions
  - Log localStorage failures to console only (not user-facing)

### Updated Task List

Tasks.md already generated (29 tasks). Key additions based on clarifications:

**New/Updated Tasks**:
- T004: ValidationFunctions.ts now includes localStorage availability check
- T008: LocalStorageSidebarStateRepository includes graceful error handling
- T009: InMemorySidebarStateRepository serves as explicit fallback (not just testing)
- T010: SidebarProvider implements automatic fallback logic
- **T030** (NEW): Create errorLogger utility in src/app/dashboard/utils/errorLogger.ts
- **T031** (NEW): Create performanceTracker utility in src/app/dashboard/utils/performanceTracker.ts
- **T032** (NEW): Integrate performance tracking in page.tsx (page load time)
- **T033** (NEW): Integrate performance tracking in useSidebar (toggle duration)
- T024: Public API exports now include errorLogger and performanceTracker utilities

These additions increase total task count from 29 to 33 tasks.

---

## Next Steps

All planning artifacts complete:
- ✅ research.md: Technology decisions documented
- ✅ data-model.md: Domain entities defined
- ✅ contracts/: Repository interfaces documented
- ✅ quickstart.md: Implementation guide ready
- ✅ tasks.md: 29 base tasks + 4 new tasks for observability = 33 total tasks
- ✅ plan.md: This file (updated with clarifications)

**Ready for**: `/speckit.implement` to execute implementation tasks

**Estimated Implementation Time**:
- MVP (Phases 1-5): 5-7 hours
- Full feature (all 33 tasks): 12-16 hours (includes observability implementation)

---

**Plan Status**: ✅ Complete with clarifications applied  
**Last Updated**: 2025-10-12 (added observability and localStorage fallback requirements)
