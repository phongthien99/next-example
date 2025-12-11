# Research: Dashboard Screen with Sidebar Navigation

**Feature**: 004-feature-create-screen  
**Date**: 2025-10-12  
**Purpose**: Document technology decisions and research findings for dashboard implementation

## Overview

This document captures research findings and technology decisions for implementing a dashboard interface with collapsible sidebar navigation, following Clean Architecture principles with SOLID design patterns.

## Technology Decisions

### 1. Sidebar Component Architecture

**Decision**: Use Radix UI sidebar primitive with custom state management via Repository pattern

**Rationale**:
- Radix UI provides accessible sidebar primitive with built-in keyboard navigation
- Existing `@radix-ui/react-collapsible` already in project dependencies
- Custom state management allows Clean Architecture implementation
- Enables dependency injection for testing and flexibility

**Alternatives Considered**:
- **shadcn/ui sidebar component**: Already available in project (`src/components/ui/sidebar.tsx`), provides pre-built patterns
  - **Selected**: Use existing shadcn/ui sidebar as base, extend with repository pattern for state persistence
- **Custom implementation from scratch**: Would require reinventing accessibility features
  - **Rejected**: Violates DRY principle, accessibility is complex to implement correctly
- **Third-party libraries (react-pro-sidebar, react-sidebar)**: Would add unnecessary bundle size
  - **Rejected**: Increases bundle size, adds maintenance burden, existing components sufficient

**Implementation Approach**:
- Leverage existing `src/components/ui/sidebar.tsx` (SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter components)
- Extend SidebarProvider with Repository pattern for state persistence
- Create ISidebarStateRepository interface for localStorage abstraction
- Implement LocalStorageSidebarStateRepository and InMemorySidebarStateRepository

### 2. State Management Strategy

**Decision**: React Context + Repository Pattern for sidebar state, no external state library

**Rationale**:
- Sidebar state is feature-scoped, doesn't require global state management
- Repository pattern provides testability and flexibility
- Aligns with Clean Architecture: Application layer (hooks) depends on Infrastructure layer (repositories) via interfaces
- localStorage access abstracted behind repository interface

**Alternatives Considered**:
- **Zustand/Redux**: Overkill for single feature state
  - **Rejected**: Adds unnecessary dependency, increases complexity
- **React Query**: Not needed, no server state to manage
  - **Rejected**: No external API calls in this feature, localStorage only
- **URL state (query params)**: Poor UX for sidebar state
  - **Rejected**: Clutters URLs, not appropriate for UI preference state

**State Structure**:
```typescript
interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeNavItem: string | null;
}
```

### 3. Responsive Design Approach

**Decision**: CSS-in-Tailwind with custom breakpoints + useMediaQuery hook

**Rationale**:
- Tailwind CSS 4.x already configured in project
- Mobile-first design aligns with performance goals
- useMediaQuery hook enables responsive behavior in React components
- Matches existing project patterns (seen in other components)

**Breakpoints**:
- Mobile: `< 768px` (sidebar hidden by default, sheet/drawer for mobile)
- Tablet: `768px - 1023px` (sidebar visible, can collapse)
- Desktop: `>= 1024px` (sidebar visible, can collapse)

**Alternatives Considered**:
- **Container queries**: Too new, browser support limited
  - **Rejected**: Browser compatibility concerns
- **JavaScript-only responsive**: Performance impact, layout shift
  - **Rejected**: Causes CLS issues, poor Core Web Vitals

### 4. Animation Strategy

**Decision**: CSS transitions via Tailwind utilities + Radix UI motion primitives

**Rationale**:
- Tailwind transition utilities provide 300ms animations (meets performance goal)
- Radix UI collapsible has built-in motion support
- CSS animations more performant than JavaScript animations
- No additional dependencies needed

**Animation Targets**:
- Sidebar width: `transition-[width] ease-linear` (300ms)
- Navigation expand/collapse: Radix Collapsible built-in animations
- Mobile sidebar: `@radix-ui/react-dialog` for sheet animation

**Performance Considerations**:
- Use `transform` and `opacity` (GPU-accelerated) instead of width when possible
- Avoid animating height directly (use Radix Collapsible auto-height)
- Prefers-reduced-motion media query support

### 5. Accessibility Implementation

**Decision**: WCAG 2.1 AA compliance via Radix UI primitives + semantic HTML + ARIA attributes

**Rationale**:
- Radix UI components provide accessible foundations
- Semantic HTML (nav, aside, button) ensures screen reader compatibility
- Keyboard navigation built into Radix primitives
- Project constitution mandates WCAG 2.1 AA minimum

**Accessibility Checklist**:
- [x] Keyboard navigation: Tab, Enter, Escape keys
- [x] Screen reader support: ARIA labels, roles, live regions
- [x] Focus management: Focus trap in mobile sidebar, visible focus indicators
- [x] Color contrast: Meets WCAG AA standards (4.5:1 minimum)
- [x] Motion: Respects prefers-reduced-motion
- [x] Touch targets: Minimum 44x44px for interactive elements

**ARIA Attributes**:
- `aria-expanded` on collapsible trigger buttons
- `aria-label` on icon-only buttons
- `aria-current="page"` on active navigation items
- `role="navigation"` on nav containers

### 6. Data Structure for Navigation

**Decision**: Typed mock data structure with Zod validation, no external API

**Rationale**:
- Feature spec indicates "same as current dashboard" which uses mock data
- No external API dependency for this feature
- Zod validation ensures type safety at runtime
- Enables easy migration to API later via Repository pattern

**Data Schema** (Zod):
```typescript
// Team/Workspace
const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().or(z.function()), // Lucide icon or URL
  plan: z.enum(['Free', 'Startup', 'Enterprise']),
});

// Navigation Item (hierarchical)
const NavItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  icon: z.function(), // Lucide React component
  isActive: z.boolean().optional(),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
  })).optional(),
});

// Project
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  icon: z.function(), // Lucide React component
});

// User
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url(),
});

// Dashboard Configuration
const DashboardConfigSchema = z.object({
  user: UserSchema,
  teams: z.array(TeamSchema),
  navMain: z.array(NavItemSchema),
  projects: z.array(ProjectSchema),
});
```

### 7. Testing Strategy

**Decision**: Unit tests (core logic) + Integration tests (components with MSW) + E2E tests (user flows)

**Rationale**:
- Clean Architecture enables testing at each layer independently
- Repository pattern allows mocking at interface boundary
- Component tests verify UI interactions
- E2E tests validate responsive behavior and state persistence

**Test Coverage**:
1. **Unit Tests** (Domain layer):
   - Sidebar state logic (expand/collapse/toggle)
   - Navigation validation functions
   - Zod schema validation

2. **Integration Tests** (Application + Infrastructure):
   - useSidebar hook with mocked repository
   - LocalStorageSidebarStateRepository (with localStorage mock)
   - Component interactions (click, keyboard navigation)

3. **E2E Tests** (Full user flows):
   - Sidebar expand/collapse on desktop
   - Mobile sidebar open/close
   - Navigation item expand/collapse
   - Team switcher interaction
   - State persistence across page reload
   - Responsive breakpoint transitions

**Testing Tools**:
- **Unit/Integration**: Vitest or Jest + React Testing Library
- **E2E**: Playwright (recommended) or Cypress
- **Mocking**: MSW for API mocking (if needed), Vitest mock for localStorage

### 8. Performance Optimization

**Decision**: Code splitting + lazy loading + memoization for optimal performance

**Rationale**:
- Dashboard is heavy feature with many components
- Next.js 15.5.4 provides automatic code splitting
- React.memo and useMemo prevent unnecessary re-renders
- Lazy loading icons reduces initial bundle size

**Optimization Techniques**:
1. **Code Splitting**: 
   - Dynamic import for mobile sidebar (sheet component)
   - Lazy load project icons (Lucide React tree-shaking)

2. **Memoization**:
   - React.memo on NavMain, NavProjects, NavUser components
   - useMemo for filtered/sorted navigation items
   - useCallback for event handlers passed to child components

3. **Asset Optimization**:
   - Lucide React icons (tree-shakeable, only import used icons)
   - Avatar images via Next.js Image component (if using real images)

4. **Bundle Analysis**:
   - Target: Dashboard bundle < 50KB gzipped
   - Monitor with Next.js bundle analyzer

**Performance Metrics** (from spec):
- Sidebar toggle animation: < 300ms ✓
- Page load LCP: < 2s ✓
- Responsive layout CLS: < 0.1 ✓
- Support 20+ navigation items without degradation ✓

### 9. Error Handling Strategy

**Decision**: Error boundaries + graceful fallbacks + localStorage failure handling

**Rationale**:
- localStorage can fail (quota exceeded, disabled, private mode)
- Error boundaries catch unexpected React errors
- Graceful degradation maintains UX when features fail

**Error Scenarios**:
1. **localStorage unavailable**:
   - Fallback to in-memory state (InMemorySidebarStateRepository)
   - Show non-intrusive warning to user
   - Functionality remains intact, just no persistence

2. **Invalid data structure**:
   - Zod validation catches malformed data
   - Fallback to default dashboard configuration
   - Log error for debugging

3. **Component render errors**:
   - Error boundary at dashboard route level (`error.tsx`)
   - Display user-friendly error message
   - Provide "Reset to default" action

**Error Boundary Implementation**:
```typescript
// src/app/dashboard/error.tsx
'use client';
import { DashboardError } from './components/DashboardError';

export default function DashboardErrorBoundary({ error, reset }) {
  return <DashboardError error={error} reset={reset} />;
}
```

### 10. Migration Path from Current Implementation

**Decision**: Refactor existing dashboard to Clean Architecture incrementally

**Rationale**:
- Current implementation exists (`src/app/dashboard/page.tsx` with mock data)
- Existing components can be refactored to follow Clean Architecture
- Incremental migration reduces risk

**Migration Steps**:
1. **Phase 1**: Extract components (already done: AppSidebar, NavMain, etc.)
2. **Phase 2**: Add Repository pattern for sidebar state persistence
3. **Phase 3**: Add Zod validation for data structures
4. **Phase 4**: Implement error boundaries and loading states
5. **Phase 5**: Add comprehensive tests

**Backward Compatibility**:
- Existing components continue to work during migration
- New Repository pattern is additive, doesn't break existing code
- Feature flag can control old vs new implementation

## Best Practices

### Sidebar State Management
- Use Repository pattern for all persistence operations
- Never directly access localStorage in components or hooks
- Inject repository via React Context (SidebarProvider)
- Support multiple implementations (localStorage, in-memory, session storage)

### Component Structure
- Keep components small and focused (< 200 LOC)
- Extract reusable sub-components (NavItem, ProjectItem, TeamItem)
- Use compound component pattern for complex components (Sidebar with sub-components)
- Props interfaces should be explicit and documented

### Responsive Design
- Mobile-first approach (base styles for mobile, media queries for larger screens)
- Use Tailwind breakpoint prefixes (md:, lg:, xl:)
- Test on real devices, not just browser DevTools
- Consider touch targets on mobile (44x44px minimum)

### Accessibility
- Always include ARIA labels for icon-only buttons
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS, or VoiceOver)
- Ensure color contrast meets WCAG AA (use contrast checker)

### Performance
- Measure before optimizing (use React DevTools Profiler)
- Avoid premature optimization
- Monitor bundle size with each change
- Use Next.js built-in optimizations (automatic code splitting, image optimization)

## Dependencies Summary

**No new dependencies required** - all needed packages already in project:

Existing Dependencies Used:
- `@radix-ui/react-collapsible` ^1.1.12 (sidebar collapse functionality)
- `@radix-ui/react-dropdown-menu` ^2.1.16 (team switcher, user menu)
- `@radix-ui/react-separator` ^1.1.7 (visual separators)
- `@radix-ui/react-tooltip` ^1.2.8 (tooltips for collapsed sidebar)
- `@radix-ui/react-avatar` ^1.1.10 (user avatar)
- `@radix-ui/react-dialog` ^1.1.15 (mobile sidebar sheet - already installed)
- `lucide-react` 0.545.0 (navigation icons)
- `zod` 4.1.12 (data validation)
- `class-variance-authority` 0.7.1 (component variants)
- `clsx` 2.1.1 + `tailwind-merge` 3.3.1 (className utilities)

## Conclusion

All technology decisions align with project constitution and Clean Architecture principles. No new dependencies required, reusing existing components and patterns. Implementation can proceed to Phase 1 (Design & Contracts).

**Ready for Phase 1**: ✅
