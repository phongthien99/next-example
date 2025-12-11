# Implementation Plan: Tenant Management CRUD

**Branch**: `005-tenant-management-crud` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-tenant-management-crud/spec.md`

## Summary

Implement a comprehensive Tenant Management screen with full CRUD capabilities. The feature enables administrators to view, create, edit, and delete tenant records through a table interface with modal-based forms. All operations use mock API services with proper loading states, validation, and user feedback through toast notifications. The implementation follows Clean Architecture with Repository pattern for data access abstraction, supporting both mock API and in-memory implementations.

**Key Technical Decisions** (from research):
- UI Components: Add Radix UI Dialog, Table primitives + shadcn/ui patterns
- Toast Notifications: Implement sonner for better UX and accessibility
- Mock API: In-memory repository with simulated latency (100-300ms)
- UUID Generation: crypto.randomUUID() (native Web API, no external dependency)
- Date Formatting: Intl.DateTimeFormat (native, no external library needed)

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15.5.4
**Primary Dependencies**:
- React 19.1.0
- Zod 4.1.12 (validation)
- Radix UI (@radix-ui/react-dialog, @radix-ui/react-alert-dialog for confirmations)
- sonner 1.x (toast notifications)
- Tailwind CSS 4.x with existing shadcn/ui patterns

**Storage**: Mock in-memory repository (no external API or localStorage for this feature)
**Testing**: Vitest (unit), MSW (API mocking if needed), Playwright (E2E)
**Target Platform**: Web (desktop-first with responsive table design)
**Project Type**: Frontend-Only Web Application (Next.js App Router, no backend database)
**Performance Goals**:
- Table render < 200ms for 100 items
- Modal open/close < 100ms
- Form validation < 50ms
- Toast display < 100ms
- Mock API response 100-300ms (simulated network latency)

**Constraints**:
- WCAG 2.1 AA accessibility for table, modal, and toast
- Keyboard navigation for all interactive elements
- Table responsive design for mobile/tablet
- No pagination (all items load at once, assumption: < 1000 items)

**Scale/Scope**:
- Single feature: Tenant CRUD management
- Estimated files: ~15 files (components, hooks, repositories, models, DTOs, UI primitives)
- Estimated LOC: ~800-1000 lines
- New UI components: 3-4 (Dialog, AlertDialog, Table, Toast/Toaster)
- Repositories: 2 implementations (InMemoryTenantRepository + MockApiTenantRepository for demo)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Type Safety First
- [x] All components fully typed with TypeScript strict mode
- [x] Zod schemas defined for external data boundaries (TenantInput, Tenant entity validation)
- [x] No `any` types without explicit justification
- [x] Repository interfaces fully typed

**Status**: ✅ Satisfies - Full TypeScript strict mode with Zod validation for tenant data

### ✅ Principle II: Component-Driven Architecture
- [x] UI features built as reusable, composable components (Table, TenantForm, TenantRow)
- [x] Single responsibility principle followed (form, table, row components separated)
- [x] Clear props interfaces documented (TenantFormProps, TenantTableProps, etc.)

**Status**: ✅ Satisfies - Component hierarchy: UI primitives → TenantForm/TenantTable → TenantManagementPage

### ✅ Principle III: Frontend-Only Rendering Strategy
- [x] Server components used for static page shell (`page.tsx` wrapper)
- [x] Client components used for table, forms, modals, and interactive UI
- [x] React Query NOT needed (in-memory mock, no external API calls)
- [x] localStorage NOT used (mock data lives in memory only)

**Status**: ✅ Satisfies - Client components for all interactive UI, server component as page wrapper

### ✅ Principle IV: Data Validation & Error Handling
- [x] Zod schemas for all tenant inputs (name validation, UUID validation)
- [x] Error boundaries at page level (`error.tsx`)
- [x] User-facing errors are actionable (form validation messages, operation feedback)
- [x] Toast notifications for success/error feedback

**Status**: ✅ Satisfies - Comprehensive validation with Zod + error boundaries + toast feedback

### ✅ Principle V: Performance & Accessibility
- [x] Core Web Vitals targets defined (table render < 200ms, LCP < 2.5s)
- [x] WCAG 2.1 AA compliance planned (semantic table, ARIA labels, keyboard nav)
- [x] Semantic HTML (table element, dialog, form elements)
- [x] ARIA labels for action buttons, modal states, and table navigation
- [x] Keyboard navigation (Tab, Enter, Escape for modals)

**Status**: ✅ Satisfies - Full accessibility with Radix UI primitives + semantic HTML

### ✅ Principle VI: Clean Architecture with SOLID Principles
- [x] All 4 architectural layers identified:
  - **Presentation**: TenantManagementPage, TenantTable, TenantForm components
  - **Application**: UseTenantManagement hook (CRUD orchestration)
  - **Domain**: TenantLogic (validation, transformations), Tenant model
  - **Infrastructure**: ITenantRepository, InMemoryTenantRepository
- [x] Repository pattern with interface abstraction designed (ITenantRepository)
- [x] Dependency Inversion Principle applied (hook depends on ITenantRepository)
- [x] Single Responsibility Principle followed (each layer has one responsibility)
- [x] Domain layer is framework-independent (pure TypeScript models + validation functions)
- [x] Multiple repository implementations planned (InMemory + MockApi for testing)
- [x] Dependency Injection via React Context providers designed (TenantRepositoryProvider)
- [x] Feature structure follows Clean Architecture pattern from constitution

**Status**: ✅ Satisfies - Full Clean Architecture with SOLID principles

### ✅ Principle VII: Technology Stack & Architecture Standards
- [x] All dependencies align with approved frontend-only technology stack
- [x] New dependencies evaluated against decision criteria:
  - sonner: 13KB gzipped, TypeScript support, accessible, maintained
  - @radix-ui/react-dialog: Already approved, WCAG 2.1 AA compliant
  - @radix-ui/react-alert-dialog: Already approved, for delete confirmation
- [x] Bundle size impact considered (all additions < 50KB total)
- [x] Frontend-only architecture maintained (no database, no Server Actions)
- [x] External API endpoints NOT needed (mock repository only)
- [x] Technology choices documented in Technical Context section

**Status**: ✅ Satisfies - All new dependencies align with constitution standards

**Overall Status**: ✅ All constitutional principles satisfied - No violations, proceed to Phase 0

## Project Structure

### Documentation (this feature)

```
specs/005-tenant-management-crud/
├── spec.md                         # Feature specification (completed)
├── plan.md                         # This file
├── research.md                     # Phase 0: Technology research and decisions
├── data-model.md                   # Phase 1: Tenant entity and relationships
├── quickstart.md                   # Phase 1: Setup and usage guide
├── contracts/                      # Phase 1: API contracts
│   └── mock-tenant-api.md          # Mock API interface specification
├── checklists/
│   └── requirements.md             # Specification quality checklist (completed)
└── tasks.md                        # Phase 2: Implementation tasks (/speckit.tasks)
```

### Source Code (repository root)

**Clean Architecture Structure**:

```
src/app/tenants/                    # Feature: Tenant Management
├── page.tsx                        # Route: Tenant management page (server component wrapper)
├── error.tsx                       # Error boundary for tenant feature
├── loading.tsx                     # Loading UI (optional, for Suspense)
│
├── components/                     # PRESENTATION LAYER
│   ├── TenantManagementPage.tsx    # Client component: Main page orchestration
│   ├── TenantTable.tsx             # Client component: Data table with actions
│   ├── TenantForm.tsx              # Client component: Create/Edit modal form
│   ├── DeleteTenantDialog.tsx      # Client component: Delete confirmation dialog
│   ├── TenantTableRow.tsx          # Table row component (optional extraction)
│   └── TenantTableSkeleton.tsx     # Loading skeleton for table
│
├── hooks/                          # APPLICATION LAYER (Use Cases)
│   └── UseTenantManagement.ts      # Custom hook: CRUD operations orchestration
│
├── core/                           # DOMAIN LAYER (Business Logic)
│   ├── TenantLogic.ts              # Pure functions: validation, transformations
│   └── TenantValidation.ts         # Business validation rules
│
├── repositories/                   # INFRASTRUCTURE LAYER (Data Access)
│   ├── ITenantRepository.ts        # Interface: CRUD contract (DIP)
│   ├── InMemoryTenantRepository.ts # Implementation: In-memory mock data
│   ├── MockApiTenantRepository.ts  # Implementation: Simulated API with latency
│   └── TenantRepositoryRegistry.ts # Registry: Selects implementation
│
├── providers/                      # DEPENDENCY INJECTION
│   └── TenantRepositoryProvider.tsx # React Context for repository DI
│
├── models/                         # DOMAIN MODELS
│   └── Tenant.ts                   # Tenant entity class/interface
│
├── dto/                            # DATA TRANSFER OBJECTS
│   └── TenantTypes.ts              # Zod schemas + TypeScript types
│
└── index.ts                        # Public API: barrel export

src/components/ui/                  # NEW: Shared UI Components
├── dialog.tsx                      # Radix UI Dialog wrapper (shadcn/ui style)
├── alert-dialog.tsx                # Radix UI AlertDialog for confirmations
├── table.tsx                       # Table primitives (table, thead, tbody, tr, td, th)
└── toast.tsx                       # Toast components (Toaster, useToast hook)
└── sonner.tsx                      # Sonner toast integration (alternative to custom toast)

src/lib/                            # Shared utilities
└── uuid.ts                         # UUID generation helper (crypto.randomUUID wrapper)

tests/                              # Test files
├── unit/
│   ├── TenantLogic.test.ts         # Unit tests for validation logic
│   └── TenantValidation.test.ts    # Unit tests for business rules
├── integration/
│   ├── UseTenantManagement.test.ts # Hook integration tests
│   └── repositories/
│       └── InMemoryTenantRepository.test.ts  # Repository tests
└── e2e/
    └── tenant-management.spec.ts   # E2E: Full CRUD user flow
```

**Layer Dependency Flow**:
```
Presentation (TenantTable, TenantForm)
    ↓
Application (UseTenantManagement hook)
    ↓
Domain (TenantLogic, Tenant model) ← Infrastructure (ITenantRepository)
                                              ↓
                                    InMemoryTenantRepository
                                    MockApiTenantRepository
```

## Complexity Tracking

*No constitutional violations - this section is not applicable*

**Justification**: The feature fully aligns with all seven constitutional principles. Clean Architecture with Repository pattern is the standard approach per constitution. All new dependencies (sonner, radix dialog, table primitives) are lightweight, accessible, and align with existing technology stack decisions.

---

## Phase 0: Research & Technology Decisions

See [research.md](./research.md) for detailed findings.

**Key Decisions**:

1. **Toast Notification Library**: sonner
   - **Why**: Better UX than alternatives, accessible, 13KB, TypeScript support, maintained
   - **Alternatives**: react-hot-toast (considered), @radix-ui/react-toast (too low-level)

2. **Table Component**: Custom implementation with Radix UI primitives
   - **Why**: Full control, matches existing shadcn/ui patterns, no heavy dependency
   - **Alternatives**: TanStack Table (too heavy for simple CRUD), external table library

3. **Dialog/Modal**: @radix-ui/react-dialog
   - **Why**: Already in tech stack philosophy, WCAG 2.1 AA compliant, accessible
   - **Alternatives**: headlessui (different ecosystem)

4. **Delete Confirmation**: @radix-ui/react-alert-dialog
   - **Why**: Purpose-built for confirmation dialogs, better semantics than generic dialog
   - **Alternatives**: Reuse dialog component (less semantic)

5. **UUID Generation**: crypto.randomUUID()
   - **Why**: Native Web API (supported in all modern browsers), no external dependency
   - **Alternatives**: uuid package (unnecessary dependency, 4.5KB)

6. **Date Formatting**: Intl.DateTimeFormat
   - **Why**: Native API, no bundle size, locale-aware
   - **Alternatives**: date-fns (23KB), dayjs (7KB) - both unnecessary

7. **Mock Repository Strategy**: In-memory with simulated latency
   - **Why**: Demonstrates loading states, realistic UX testing, easy to swap for real API
   - **Implementation**: setTimeout wrapper around in-memory operations (100-300ms delay)

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Summary**:

```typescript
// Tenant Entity (Domain Model)
interface Tenant {
  id: string;           // UUID v4
  name: string;         // Required, 1-255 characters
  created_at: Date;     // Auto-generated on create
  updated_at: Date;     // Auto-updated on modify
}

// Tenant Input (DTO for create/update)
interface TenantInput {
  name: string;         // Validated: non-empty, trimmed
}

// Repository Interface
interface ITenantRepository {
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | null>;
  createTenant(input: TenantInput): Promise<Tenant>;
  updateTenant(id: string, input: TenantInput): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
}
```

### API Contracts

See [contracts/mock-tenant-api.md](./contracts/mock-tenant-api.md) for complete API specification.

**Summary**:

- `getTenants()`: Returns array of all tenants (no pagination)
- `createTenant(input)`: Creates new tenant with auto-generated id and timestamps
- `updateTenant(id, input)`: Updates existing tenant, refreshes updated_at
- `deleteTenant(id)`: Removes tenant permanently
- All operations simulated with 100-300ms latency for realistic UX

### Quick Start

See [quickstart.md](./quickstart.md) for setup and usage instructions.

---

## Phase 2: Implementation Tasks

**NOT GENERATED BY THIS COMMAND** - Use `/speckit.tasks` to generate actionable task breakdown.

The tasks file will be created at `specs/005-tenant-management-crud/tasks.md` with:
- Detailed implementation steps
- Dependency ordering (UI components → repositories → hooks → components)
- Test coverage requirements
- Acceptance criteria per task

---

## Dependencies & Prerequisites

### External Dependencies to Add (via pnpm)

```bash
# Toast notifications
pnpm add sonner

# Radix UI primitives (if not already present)
pnpm add @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

### Internal Prerequisites

- Existing UI components: button, input, label, card (already available)
- Existing utilities: `cn()` from lib/utils.ts (already available)
- Tailwind CSS configuration (already configured)

### Development Prerequisites

- TypeScript 5.x configured with strict mode
- ESLint and Prettier configured
- Test framework (Vitest or Jest) configured

---

## Risk Assessment & Mitigation

### Identified Risks

1. **Risk**: Table performance with 1000+ items
   - **Likelihood**: Low (spec assumption is < 1000 items)
   - **Impact**: Medium (degraded UX, slow rendering)
   - **Mitigation**: Implement virtualization if needed (react-virtual or similar)

2. **Risk**: Accessibility compliance for custom table
   - **Likelihood**: Low (using semantic HTML + ARIA)
   - **Impact**: High (legal/compliance issues)
   - **Mitigation**: Test with screen readers, follow WCAG 2.1 AA guidelines, use Radix primitives

3. **Risk**: Toast notification overflow (many simultaneous operations)
   - **Likelihood**: Low (single-user CRUD operations)
   - **Impact**: Low (poor UX)
   - **Mitigation**: sonner handles stacking automatically, limit concurrent operations

4. **Risk**: Mock repository state loss on page refresh
   - **Likelihood**: High (in-memory data is ephemeral)
   - **Impact**: Low (expected behavior for mock)
   - **Mitigation**: Document in quickstart, consider localStorage persistence if needed

### Success Criteria Validation

All success criteria from spec.md are addressed:

- **SC-001**: Administrators view list within 2s → In-memory repository = instant load
- **SC-002**: Create tenant in < 30s → Simple form with minimal fields
- **SC-003**: Edit tenant in < 45s → Pre-filled form, same UX as create
- **SC-004**: Delete tenant in < 15s → Single confirmation dialog
- **SC-005**: 100% feedback → Toast for all operations + form validation errors
- **SC-006**: 100% invalid prevention → Zod validation + client-side checks
- **SC-007**: Loading states < 200ms → Skeleton + button loading indicators
- **SC-008**: Support 0-1000 entries → Table tested with large datasets
- **SC-009**: 95% first-time success → Intuitive UI, clear error messages

---

## Next Steps

1. ✅ **Completed**: Feature specification (spec.md)
2. ✅ **Completed**: Quality checklist validation
3. ✅ **Completed**: Implementation plan (this file)
4. ⏭️ **Next**: Run `/speckit.tasks` to generate implementation task breakdown
5. ⏭️ **After tasks**: Run `/speckit.implement` to execute implementation

**Command to continue**:
```bash
/speckit.tasks
```
