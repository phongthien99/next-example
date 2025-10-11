# Implementation Plan: Forgot Password

**Branch**: `002-feat-forgot-password` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-feat-forgot-password/spec.md`

## Summary

Implement a forgot password form that allows users to request a password reset by entering their email address. The feature includes email validation using Zod, loading states during submission, success/error messaging, and full accessibility compliance. The form integrates with an external API endpoint through the Repository pattern and follows Clean Architecture principles with SOLID design.

**Technical Approach**: Client-side form with real-time Zod validation, repository pattern for API integration, React hooks for state management, and shadcn/ui components for consistent UI. The implementation follows the same architectural pattern as the existing signup feature.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with Next.js 15.5.4  
**Primary Dependencies**: 
- React 18.3.1 (core framework)
- Zod 4.1.12 (validation)
- shadcn/ui + Radix UI primitives (UI components)
- Tailwind CSS 4.x (styling)
- class-variance-authority 0.7.1 (component variants)

**Storage**: External API endpoint for password reset requests + localStorage for form state persistence (optional, non-sensitive)  
**Testing**: TypeScript compilation, manual testing (E2E framework to be determined)  
**Target Platform**: Web (mobile, tablet, desktop browsers - responsive design required)  
**Project Type**: Frontend-Only Web Application (Next.js App Router, no backend database)  
**Performance Goals**: 
- Form validation < 500ms (client-side Zod)
- Page load < 2s LCP
- Form submission feedback < 100ms (loading state)

**Constraints**: 
- WCAG 2.1 AA accessibility compliance
- Core Web Vitals compliance
- External API dependency (POST /api/forgot-password)
- No email enumeration (same message for all emails)

**Scale/Scope**: 
- Single feature: forgot password form
- Estimated 10-12 files (~800-1000 LOC)
- Routes: `/forgot-password` (new page)
- Layers: Presentation (1 form), Application (1 hook), Domain (1 validation logic), Infrastructure (2 repositories), DTO (1 types file)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Type Safety First
- [x] All components fully typed with TypeScript strict mode
- [x] Zod schemas defined for external data boundaries (ForgotPasswordInputSchema, API response schema)
- [x] No `any` types without explicit justification

**Status**: ✅ Pass - Form input, API request/response, and state all typed with Zod + TypeScript

### ✅ Principle II: Component-Driven Architecture
- [x] UI features built as reusable, composable components (ForgotPasswordForm.tsx)
- [x] Single responsibility principle followed (form component only handles UI)
- [x] Clear props interfaces documented (minimal props, self-contained form)

**Status**: ✅ Pass - Single form component with clear responsibility

### ✅ Principle III: Frontend-Only Rendering Strategy
- [x] Server components used for static page shells (page.tsx as static shell)
- [x] Client components used for forms, interactive UI, and API calls (ForgotPasswordForm with 'use client')
- [x] React Query NOT needed (simple one-time mutation, no caching required)
- [x] localStorage usage documented (optional form state persistence if needed)

**Status**: ✅ Pass - Follows signup pattern: server shell + client form component

### ✅ Principle IV: Data Validation & Error Handling
- [x] Zod schemas for all external inputs (email validation)
- [x] Error boundaries at page level (error.tsx, loading.tsx)
- [x] User-facing errors are actionable and friendly (field-level + form-level errors)

**Status**: ✅ Pass - Comprehensive validation and error handling strategy

### ✅ Principle V: Performance & Accessibility
- [x] Core Web Vitals targets defined (LCP < 2s, form interaction < 500ms)
- [x] WCAG 2.1 AA compliance planned (semantic HTML, ARIA labels, keyboard nav)
- [x] Semantic HTML and ARIA labels in components (input, button, error messages)

**Status**: ✅ Pass - Explicit accessibility requirements in spec (FR-010, FR-011)

### ✅ Principle VI: Clean Architecture with SOLID Principles
- [x] All 4 architectural layers identified:
  - **Presentation**: ForgotPasswordForm.tsx, page.tsx, error.tsx, loading.tsx
  - **Application**: UseForgotPassword.ts hook
  - **Domain**: ForgotPasswordLogic.ts (validation)
  - **Infrastructure**: IForgotPasswordRepository.ts, ApiForgotPasswordRepository.ts, LocalStorageForgotPasswordRepository.ts
- [x] Repository pattern with interface abstraction designed (IForgotPasswordRepository)
- [x] Dependency Inversion Principle applied (hook depends on interface, not implementation)
- [x] Single Responsibility Principle followed (each file has one clear purpose)
- [x] Domain layer is framework-independent (pure validation functions)
- [x] Multiple repository implementations planned (API + localStorage fallback)
- [x] Dependency Injection via React Context providers designed (ForgotPasswordRepositoryProvider)
- [x] Feature structure follows Clean Architecture pattern from constitution

**Status**: ✅ Pass - Full Clean Architecture with Repository pattern

### ✅ Principle VII: Technology Stack & Architecture Standards
- [x] All dependencies align with approved frontend-only technology stack (Zod, React, Next.js, Radix UI)
- [x] New dependencies evaluated: NONE (reuses existing dependencies)
- [x] Bundle size impact considered (minimal, reuses existing UI components)
- [x] Frontend-only architecture maintained (external API, no database)
- [x] External API endpoints documented (POST /api/forgot-password)
- [x] Technology choices documented in Technical Context section

**Status**: ✅ Pass - No new dependencies, follows existing patterns

**Overall Constitution Status**: ✅ **ALL PRINCIPLES SATISFIED** - No violations, ready to proceed

## Project Structure

### Documentation (this feature)

```
specs/002-feat-forgot-password/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (to be generated)
├── data-model.md        # Phase 1 output (to be generated)
├── quickstart.md        # Phase 1 output (to be generated)
├── contracts/           # Phase 1 output (to be generated)
│   └── forgot-password-api.md
└── checklists/
    └── requirements.md  # Spec quality checklist (completed)
```

### Source Code (repository root)

**Clean Architecture Structure** (Next.js App Router):

```
src/app/forgot-password/          # Feature route
├── page.tsx                      # [Presentation] Server component: static page shell
├── error.tsx                     # [Presentation] Error boundary (thin wrapper)
├── loading.tsx                   # [Presentation] Loading UI (thin wrapper, optional)
│
├── components/                   # PRESENTATION LAYER
│   ├── ForgotPasswordForm.tsx    # Client component: form UI + user interactions
│   ├── ForgotPasswordError.tsx   # Reusable error UI (delegated from error.tsx)
│   └── ForgotPasswordLoading.tsx # Reusable loading UI (delegated from loading.tsx)
│
├── hooks/                        # APPLICATION LAYER (Use Cases)
│   └── UseForgotPassword.ts      # Hook: orchestrates validation + API call
│
├── core/                         # DOMAIN LAYER (Business Logic)
│   └── ForgotPasswordLogic.ts    # Pure functions: email validation with Zod
│
├── repositories/                 # INFRASTRUCTURE LAYER (Data Access)
│   ├── IForgotPasswordRepository.ts       # Interface: contract (DIP)
│   ├── ApiForgotPasswordRepository.ts     # Implementation: external API
│   ├── LocalStorageForgotPasswordRepository.ts  # Implementation: localStorage fallback
│   └── ForgotPasswordRepositoryRegistry.ts      # Registry: selects implementation
│
├── providers/                    # DEPENDENCY INJECTION
│   └── ForgotPasswordRepositoryProvider.tsx     # React Context for DI
│
├── models/                       # DOMAIN MODELS
│   └── ForgotPasswordSession.ts  # Form state model
│
├── dto/                          # DATA TRANSFER OBJECTS
│   └── ForgotPasswordTypes.ts    # Zod schemas + TypeScript types
│
└── index.ts                      # Public API: barrel export

src/lib/                          # Shared utilities (existing)
├── utils.ts                      # cn() utility (existing)
└── api-client.ts                 # Optional: base fetch wrapper (if needed)

src/components/ui/                # Reusable UI components (existing)
├── button.tsx                    # Radix Button (existing)
├── input.tsx                     # Radix Input (existing)
├── label.tsx                     # Radix Label (existing)
└── card.tsx                      # Card components (existing)
```

**File Count**: 15 files (12 new + 3 updated)
- New files: 12 (feature-specific)
- Updated files: 3 (login page.tsx to add "Forgot Password" link, optionally others)

**Clean Architecture Notes**:
- **Layer Dependencies**: Presentation → Application → Domain ← Infrastructure
- **Domain Layer**: Pure validation logic (ForgotPasswordLogic.ts) - no framework dependencies
- **Repository Pattern**: All API access through IForgotPasswordRepository interface
- **Dependency Inversion**: UseForgotPassword hook depends on interface, not concrete API class
- **Dependency Injection**: Repository implementation injected via React Context
- **SOLID Principles**: SRP (each file one responsibility), DIP (interface abstraction), OCP (extend via new repos)
- **Follows signup pattern**: Same architectural structure as existing signup feature

## Complexity Tracking

*No violations - table not needed.*

**Justification**: This feature follows all constitutional principles without exceptions. It reuses the established architectural pattern from the signup feature, requires no new dependencies, and maintains Clean Architecture with SOLID principles throughout.
