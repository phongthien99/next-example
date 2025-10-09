<!--
SYNC IMPACT REPORT
==================
Version Change: 1.0.0 → 1.1.0
Rationale: MINOR version bump - New principle added (Feature Architecture Pattern)

Modified Principles: None
Added Sections:
  - Principle VI: Feature Architecture Pattern (with concrete login example)

Removed Sections: None

Templates Status:
  ✅ plan-template.md - Reviewed, compatible with new principle
  ✅ spec-template.md - Reviewed, compatible with new principle
  ✅ tasks-template.md - Reviewed, compatible with new principle

Follow-up TODOs: None
-->

# Next-Soild Project Constitution

## Core Principles

### I. Type Safety First

Every component, function, and API interaction MUST be fully typed using TypeScript. No `any` types are permitted in production code except with explicit justification documented in code comments. Zod schemas MUST be defined for all external data boundaries (API responses, user inputs, environment variables).

**Rationale**: Type safety catches errors at compile time, provides better IDE support, and serves as living documentation for the codebase.

### II. Component-Driven Architecture

UI features MUST be built as reusable, composable components. Components MUST follow the single responsibility principle and be organized hierarchically: primitives (Radix UI) → base components (shadcn/ui) → feature components → page layouts. Each component MUST have a clear, documented API (props interface).

**Rationale**: Component-driven design enables parallel development, easier testing, consistent UI/UX, and maintainable code at scale.

### III. Server-First Rendering (NON-NEGOTIABLE)

Leverage Next.js App Router server components by default. Client components (`'use client'`) MUST be justified and limited to interactive boundaries. Data fetching MUST happen on the server when possible. State management MUST be minimized and colocated with components that need it.

**Rationale**: Server-first rendering improves performance (smaller bundles, faster initial loads), SEO, and reduces client-side complexity while maintaining interactivity where needed.

### IV. Data Validation & Error Handling

All external inputs (forms, API calls, URL parameters) MUST be validated using Zod schemas. Error boundaries MUST be implemented at appropriate component tree levels. User-facing errors MUST be actionable and friendly; technical errors MUST be logged with sufficient context for debugging.

**Rationale**: Robust validation prevents runtime errors and security issues. Proper error handling improves user experience and system observability.

### V. Performance & Accessibility

All pages MUST meet Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1). Components MUST be accessible (WCAG 2.1 AA minimum) with proper semantic HTML, ARIA labels, and keyboard navigation. Images MUST use Next.js Image optimization. Route handlers MUST implement caching strategies where appropriate.

**Rationale**: Performance and accessibility are not optional—they directly impact user satisfaction, SEO rankings, and legal compliance.

### VI. Feature Architecture Pattern (NON-NEGOTIABLE)

Every feature MUST follow a consistent layered architecture pattern. Features are organized by domain (e.g., `login`, `dashboard`, `billing`) with clear separation of concerns across layers:

**Required Structure** (using Login as reference example):

```
src/app/login/                    # Route + Page layer (App Router)
├── page.tsx                      # Server Component: page entry, data fetching
├── layout.tsx                    # (optional) Feature-specific layout
├── actions/                      # Server Actions layer
│   └── loginAction.ts            # Form submission, server-side logic
├── components/                   # UI Components layer
│   ├── LoginForm.tsx             # Client component: interactive form
│   └── SocialLoginButtons.tsx   # Client component: OAuth buttons
├── schemas/                      # Data Validation layer
│   └── loginSchema.ts            # Zod schemas for validation
├── services/                     # Business Logic layer
│   └── authService.ts            # Authentication logic, API calls
└── providers/                    # State/Context layer (if needed)
    └── AuthProvider.tsx          # Auth context for client components
```

**Mandatory Layers for All Features**:
- **Route Layer** (`page.tsx`): Next.js App Router page, server component by default
- **Schemas Layer** (`schemas/`): Zod validation schemas for all inputs/outputs
- **Components Layer** (`components/`): UI components (server by default, client when needed)

**Conditional Layers** (include when feature requires):
- **Actions Layer** (`actions/`): Server Actions for mutations (forms, data updates)
- **Services Layer** (`services/`): Complex business logic, external API integration
- **Providers Layer** (`providers/`): React Context for client-side state sharing

**Layer Interaction Rules**:
1. Pages MUST only call Server Actions or Services directly
2. Components MUST receive data via props (server) or hooks/context (client)
3. Server Actions MUST use Services for business logic (no inline logic)
4. Services MUST validate all inputs using Schemas
5. No circular dependencies between layers

**Example Flow for Login**:
```
User submits form → LoginForm.tsx (client component)
                 → loginAction.ts (server action, validates with loginSchema)
                 → authService.ts (business logic, API call)
                 → Returns result to page.tsx
                 → Re-render with new auth state
```

**Rationale**: Consistent feature architecture enables predictable code organization, easier onboarding, better testability (mock at layer boundaries), and enforces separation of concerns. This pattern scales from simple forms to complex multi-step workflows while maintaining clarity.

## Development Standards

### Code Quality

- **Formatting**: Consistent code style via Prettier/ESLint (configuration in project root)
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for files
- **File Organization**: Feature-based folder structure under `src/app/` (App Router) and `src/components/`
- **Import Order**: React/Next.js → third-party → local absolute → local relative

### Testing Strategy

- **Unit Tests**: Required for complex business logic, utilities, and custom hooks
- **Integration Tests**: Required for critical user flows (authentication, payments, data mutations)
- **E2E Tests**: Required for core user journeys before production deployment
- **Visual Tests**: Recommended for component libraries and design system consistency

### Git Workflow

- **Branch Naming**: `feature/###-description`, `fix/###-description`, `docs/###-description`
- **Commits**: Conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Pull Requests**: Must reference spec documents, include test results, and pass all CI checks

## Quality Gates

### Before Implementation

1. Feature specification MUST be approved and documented in `.specify/specs/`
2. Design artifacts (data models, API contracts) MUST be reviewed
3. Constitution compliance MUST be verified (particularly type safety, component architecture, **feature architecture pattern**)

### Before Merge

1. All tests MUST pass (unit, integration, and applicable E2E)
2. TypeScript MUST compile with zero errors (strict mode enabled)
3. Build MUST succeed without warnings
4. Code review MUST be completed by at least one team member
5. Performance budget MUST not be exceeded (bundle size, Lighthouse scores)
6. **Feature architecture layers MUST be properly organized and documented**

### Before Deployment

1. Production build MUST complete successfully
2. Critical user flows MUST be validated in staging environment
3. Database migrations (if any) MUST be tested and reversible
4. Environment variables MUST be configured and validated

## Governance

This constitution represents the non-negotiable architectural and quality standards for the next-soild project. All code contributions, whether features, fixes, or refactors, MUST comply with these principles.

**Amendment Process**: Proposals for constitutional changes require:
1. Written justification with concrete examples
2. Impact analysis on existing codebase and templates
3. Team consensus (or project owner approval for solo projects)
4. Version bump following semantic versioning (see below)
5. Update of all dependent templates and documentation

**Versioning Policy**:
- **MAJOR** (e.g., 1.x.x → 2.0.0): Backward-incompatible changes (principle removal, fundamental architecture change)
- **MINOR** (e.g., 1.0.x → 1.1.0): New principles added, expanded guidance, new mandatory sections
- **PATCH** (e.g., 1.0.0 → 1.0.1): Clarifications, typo fixes, non-semantic refinements

**Compliance Review**: Every pull request MUST verify alignment with constitutional principles. Violations require explicit justification in the complexity tracking table (see plan-template.md). Repeated violations without justification may result in PR rejection.

**Version**: 1.1.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09
