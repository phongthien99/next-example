# Implementation Plan: Password Reset

**Branch**: `003-feat-reset-password` | **Date**: 2025-10-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-feat-reset-password/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a password reset screen that allows users to set a new password using a token received via email. The feature includes two password input fields with validation (minimum 4 characters, matching passwords), show/hide password toggles, token extraction from URL, and integration with an external password reset API endpoint. The implementation follows Clean Architecture with the Repository pattern for API access.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with Next.js 15.5.4  
**Primary Dependencies**: React 19.1.0, Zod 4.1.12, @tanstack/react-query 5.90.2, Radix UI (@radix-ui/react-label, @radix-ui/react-slot), Lucide React 0.545.0  
**Storage**: External password reset API endpoint + URL query parameters (token)  
**Testing**: Jest (unit), MSW (API mocking), React Testing Library (component), Playwright (E2E)  
**Target Platform**: Web (mobile, tablet, desktop browsers)  
**Project Type**: Frontend-Only Web Application (Next.js App Router, no backend database)  
**Performance Goals**: Form validation < 100ms (client-side), token extraction < 50ms, page load < 2.5s LCP, API request < 2s  
**Constraints**: WCAG 2.1 AA accessibility, Core Web Vitals compliance, external API dependency, token-based security  
**Scale/Scope**: Single feature, ~8-10 files (~800-1000 LOC total):
  - 1 page component (page.tsx)
  - 1 form component (ResetPasswordForm.tsx)
  - 1 hook (UseResetPassword.ts)
  - 1 core logic module (ResetPasswordLogic.ts)
  - 3 repository files (interface + API implementation + registry)
  - 1 DTO file (ResetPasswordTypes.ts with Zod schemas)
  - 1 provider (ResetPasswordRepositoryProvider.tsx)
  - Test files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Check**: ✅ Passed (2025-10-11 - before Phase 0)  
**Post-Design Check**: ✅ Passed (2025-10-11 - after Phase 1)

### ✅ Principle I: Type Safety First
- [x] All components fully typed with TypeScript strict mode
- [x] Zod schemas defined for external data boundaries (password input, token, API responses)
- [x] No `any` types without explicit justification

### ✅ Principle II: Component-Driven Architecture
- [x] UI features built as reusable, composable components (ResetPasswordForm)
- [x] Single responsibility principle followed (form UI separate from business logic)
- [x] Clear props interfaces documented (form component accepts token via props)

### ✅ Principle III: Frontend-Only Rendering Strategy
- [x] Server components used for static page shells (page.tsx wrapper)
- [x] Client components used for forms, interactive UI, and API calls (ResetPasswordForm)
- [x] React Query configured for password reset mutation (useMutation)
- [x] localStorage NOT used (no need for client-side caching in this feature - token from URL, no sensitive data)

### ✅ Principle IV: Data Validation & Error Handling
- [x] Zod schemas for all external inputs (password validation, token validation, API responses)
- [x] Error boundaries at page level (error.tsx for unexpected errors)
- [x] User-facing errors are actionable and friendly (clear messages for validation, expired tokens, network errors)

### ✅ Principle V: Performance & Accessibility
- [x] Core Web Vitals targets defined (LCP < 2.5s, client-side validation < 100ms)
- [x] WCAG 2.1 AA compliance planned (semantic HTML, ARIA labels, keyboard navigation, show/hide password toggles)
- [x] Semantic HTML and ARIA labels in components (password inputs, error messages, submit button)

### ✅ Principle VI: Clean Architecture with SOLID Principles
- [x] All 4 architectural layers identified: Presentation (ResetPasswordForm), Application (UseResetPassword hook), Domain (ResetPasswordLogic), Infrastructure (ResetPasswordRepository)
- [x] Repository pattern with interface abstraction designed (IResetPasswordRepository + ApiResetPasswordRepository)
- [x] Dependency Inversion Principle applied (hook depends on IResetPasswordRepository interface)
- [x] Single Responsibility Principle followed (UI renders, hook orchestrates, logic validates, repository accesses API)
- [x] Domain layer is framework-independent (pure validation functions in ResetPasswordLogic.ts)
- [x] Multiple repository implementations planned (API implementation only - no localStorage needed for this feature, but structure supports adding mock implementation)
- [x] Dependency Injection via React Context providers designed (ResetPasswordRepositoryProvider)
- [x] Feature structure follows Clean Architecture pattern from constitution

### ✅ Principle VII: Technology Stack & Architecture Standards
- [x] All dependencies align with approved frontend-only technology stack (React, Next.js, Zod, React Query, Radix UI, Lucide React)
- [x] New dependencies evaluated against decision criteria (no new dependencies needed)
- [x] Bundle size impact considered (reusing existing dependencies, no new libraries)
- [x] Frontend-only architecture maintained (no database, no Server Actions - external API only)
- [x] External API endpoints documented and validated (password reset POST endpoint)
- [x] Technology choices documented in Technical Context section

**Status**: ✅ All principles satisfied

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**Clean Architecture Structure** (Next.js App Router):

```
src/app/[feature]/                # Feature-based routing
├── page.tsx                      # Route: Next.js page (presentation entry)
├── error.tsx                     # Error boundary
├── loading.tsx                   # Loading UI (optional)
│
├── components/                   # PRESENTATION LAYER
│   └── [Feature]Form.tsx         # Client component: UI + form handling
│
├── hooks/                        # APPLICATION LAYER (Use Cases)
│   └── Use[Feature].ts           # Custom hook: orchestrates business flow
│
├── core/                         # DOMAIN LAYER (Business Logic)
│   └── [Feature]Logic.ts         # Pure functions: validation, transformations
│
├── repositories/                 # INFRASTRUCTURE LAYER (Data Access)
│   ├── I[Feature]Repository.ts   # Interface: defines contract (DIP)
│   ├── Api[Feature]Repository.ts # Implementation: external API
│   ├── LocalStorage[Feature]Repository.ts  # Implementation: localStorage
│   └── [Feature]RepositoryRegistry.ts      # Registry: selects implementation
│
├── providers/                    # DEPENDENCY INJECTION
│   └── [Feature]RepositoryProvider.tsx     # React Context for DI
│
├── models/                       # DOMAIN MODELS
│   └── [DomainEntity].ts         # TypeScript classes/interfaces
│
├── dto/                          # DATA TRANSFER OBJECTS
│   └── [Feature]Types.ts         # Zod schemas + inferred types
│
└── index.ts                      # Public API: barrel export

src/lib/                          # Shared utilities
├── api-client.ts                 # Base fetch wrapper (if shared)
└── utils.ts                      # General utilities

src/components/ui/                # Reusable UI components
├── button.tsx
├── input.tsx
└── card.tsx                      # Radix UI + Tailwind

tests/                            # Test files
├── unit/                         # Unit tests (core logic, models)
├── integration/                  # Integration tests (hooks, repositories with MSW)
└── e2e/                          # E2E tests (user flows)
```

**Clean Architecture Notes**:
- **Layer Dependencies**: Presentation → Application → Domain ← Infrastructure
- **Domain Layer**: Pure business logic, no framework dependencies
- **Repository Pattern**: All data access through interfaces (IAuthRepository)
- **Dependency Inversion**: Hooks depend on interfaces, not concrete implementations
- **Dependency Injection**: Repository implementations injected via React Context
- **SOLID Principles**: Each layer follows SRP, DIP applied throughout
- No Server Actions or backend database (frontend-only)
- Multiple repository implementations (API + localStorage) for flexibility

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**Status**: No violations - all principles satisfied

---

## Planning Summary

### Phase 0: Research (Completed)
- ✅ All technical decisions documented in [research.md](./research.md)
- ✅ No new dependencies required (using existing: React Query, Zod, Radix UI, Lucide React)
- ✅ URL token extraction strategy defined
- ✅ Password validation strategy defined (minimum 4 characters)
- ✅ Show/hide password toggle implementation planned
- ✅ API integration pattern established (React Query + Repository)
- ✅ Performance optimization strategy defined
- ✅ Accessibility requirements documented (WCAG 2.1 AA)
- ✅ Testing strategy outlined (unit, integration, component, E2E)

### Phase 1: Design (Completed)
- ✅ Data models documented in [data-model.md](./data-model.md)
  - ResetPasswordInput, ResetPasswordRequest, ResetPasswordResponse
  - ResetPasswordError with error codes
  - ValidationError for UI state
- ✅ API contract documented in [contracts/reset-password-api.md](./contracts/reset-password-api.md)
  - POST /api/auth/reset-password endpoint
  - Request/response schemas
  - Error handling matrix
  - Security considerations
- ✅ Developer quickstart guide created in [quickstart.md](./quickstart.md)
  - Complete code examples for all layers
  - Step-by-step implementation guide
  - Testing examples
  - Common issues and solutions
- ✅ Agent context updated in [CLAUDE.md](../../CLAUDE.md)

### Ready for Phase 2: Implementation
The planning phase is complete. All design artifacts have been generated:
- Specification defines WHAT to build
- Research defines WHY and HOW
- Data models define the structure
- API contracts define the interface
- Quickstart provides the implementation guide

**Next Command**: `/speckit.tasks` to generate actionable implementation tasks from this plan
