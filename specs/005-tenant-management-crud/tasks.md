# Tasks: Tenant Management CRUD

**Input**: Design documents from `/specs/005-tenant-management-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mock-tenant-api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story following Clean Architecture principles.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Clean Architecture layers**:
  - `components/` (Presentation Layer)
  - `hooks/` (Application Layer)
  - `core/` (Domain Layer)
  - `repositories/` (Infrastructure Layer)
  - `providers/` (Dependency Injection)
  - `models/` (Domain Models)
  - `dto/` (Data Transfer Objects)
- All paths relative to `src/app/tenants/` unless specified otherwise

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create basic project structure

- [x] T001 Install sonner for toast notifications via `pnpm add sonner`
- [x] T002 [P] Install @radix-ui/react-dialog via `pnpm add @radix-ui/react-dialog`
- [x] T003 [P] Install @radix-ui/react-alert-dialog via `pnpm add @radix-ui/react-alert-dialog`
- [x] T004 Create feature directory structure at `src/app/tenants/` with subdirectories: components/, hooks/, core/, repositories/, providers/, models/, dto/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared UI Components (src/components/ui/)

- [x] T005 [P] Create Table primitives in `src/components/ui/table.tsx` (Table, TableHeader, TableBody, TableRow, TableHead, TableCell components with Tailwind styling following shadcn/ui patterns)
- [x] T006 [P] Create Dialog component in `src/components/ui/dialog.tsx` (Radix UI Dialog wrapper: DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose)
- [x] T007 [P] Create AlertDialog component in `src/components/ui/alert-dialog.tsx` (Radix UI AlertDialog wrapper: AlertDialogRoot, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction)
- [x] T008 [P] Create Toaster integration in `src/components/ui/sonner.tsx` (Export Toaster from sonner with default configuration)

### Shared Utilities

- [x] T009 [P] Create UUID utility in `src/lib/uuid.ts` (Export generateUUID function wrapping crypto.randomUUID())
- [x] T010 [P] Create date formatter utility in `src/lib/date-formatter.ts` (Export formatDateTime function using Intl.DateTimeFormat for "Jan 15, 2024, 10:30 AM" format)

### Layout Integration

- [x] T011 Add Toaster component to root layout in `src/app/layout.tsx` (Import Toaster from sonner and add to body)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Tenant List (Priority: P1) 🎯 MVP

**Goal**: Administrators can view all tenants in a table with columns for id, name, created_at, updated_at, and action placeholders

**Independent Test**: Load `/tenants` route and verify table displays 5 pre-seeded tenants sorted by creation date (newest first) with loading state briefly visible

### Domain Layer (Core Business Logic)

- [x] T012 [P] [US1] Create Tenant domain model in `src/app/tenants/models/Tenant.ts` (Export Tenant interface with id: string, name: string, created_at: Date, updated_at: Date)

### Data Transfer Objects (DTOs)

- [x] T013 [P] [US1] Define Zod schemas in `src/app/tenants/dto/TenantTypes.ts`:
  - Export TenantInputSchema (z.object with name field: string, trim, min 1, max 255)
  - Export TenantInput type (z.infer<typeof TenantInputSchema>)
  - Export TenantSchema for full validation (id: UUID, name: string 1-255, created_at: date, updated_at: date with refinement updated_at >= created_at)

### Infrastructure Layer (Data Access)

- [x] T014 [US1] Create ITenantRepository interface in `src/app/tenants/repositories/ITenantRepository.ts`:
  - Export interface with methods: getTenants(): Promise<Tenant[]>, getTenantById(id: string): Promise<Tenant | null>, createTenant(input: TenantInput): Promise<Tenant>, updateTenant(id: string, input: TenantInput): Promise<Tenant>, deleteTenant(id: string): Promise<void>

- [x] T015 [US1] Implement InMemoryTenantRepository in `src/app/tenants/repositories/InMemoryTenantRepository.ts`:
  - Implement ITenantRepository interface
  - Private Map<string, Tenant> for storage
  - seedMockData() method with 5 pre-seeded tenants (IDs: 550e8400-e29b-41d4-a716-446655440001 to 005, names: Acme Corporation, TechStart Inc., Global Solutions Ltd, Innovation Labs, Digital Ventures LLC)
  - simulateLatency() method (100-300ms random delay)
  - getTenants() returns sorted by created_at desc
  - All methods call simulateLatency()

- [x] T016 [US1] Create TenantRepositoryRegistry in `src/app/tenants/repositories/TenantRepositoryRegistry.ts`:
  - Export class with static getRepository(type: 'memory'): ITenantRepository method
  - Returns new InMemoryTenantRepository() for 'memory' type

### Dependency Injection

- [x] T017 [US1] Create TenantRepositoryProvider in `src/app/tenants/providers/TenantRepositoryProvider.tsx`:
  - Export TenantRepositoryContext (React.createContext<ITenantRepository | null>)
  - Export TenantRepositoryProvider component accepting children and repositoryType prop (defaults to 'memory')
  - Export useTenantRepository() hook returning context value with error if null

### Application Layer (Use Cases)

- [x] T018 [US1] Implement UseTenantManagement hook in `src/app/tenants/hooks/UseTenantManagement.ts`:
  - Import useTenantRepository
  - State: tenants (Tenant[]), isLoading (boolean), error (Error | null)
  - useEffect to fetch tenants on mount (call repository.getTenants())
  - Export: { tenants, isLoading, error, refetch } (US1 only needs read operations)

### Presentation Layer (UI)

- [x] T019 [US1] Create TenantTableSkeleton in `src/app/tenants/components/TenantTableSkeleton.tsx`:
  - Export component rendering skeleton loading state
  - Use Skeleton component from `src/components/ui/skeleton.tsx` (create if not exists)
  - Show 5 skeleton rows with columns matching tenant table structure

- [x] T020 [US1] Create TenantTable in `src/app/tenants/components/TenantTable.tsx`:
  - Accept props: tenants: Tenant[], isLoading: boolean
  - Use Table primitives from src/components/ui/table.tsx
  - Table columns: ID (truncated UUID first 8 chars), Name, Created At (formatted with formatDateTime), Updated At (formatted), Actions (placeholder div for Edit/Delete buttons)
  - If isLoading, render TenantTableSkeleton
  - If empty array and not loading, show empty state message
  - Apply responsive Tailwind classes for mobile/tablet

- [x] T021 [US1] Create TenantManagementPage in `src/app/tenants/components/TenantManagementPage.tsx`:
  - 'use client' directive
  - Import useTenantManagement hook
  - Destructure { tenants, isLoading, error }
  - Render header with "Tenant Management" title
  - Render "Add Tenant" button (disabled for US1, will be implemented in US2)
  - Render error message if error exists
  - Render TenantTable with tenants and isLoading props

- [x] T022 [US1] Create page.tsx route wrapper in `src/app/tenants/page.tsx`:
  - Import TenantRepositoryProvider and TenantManagementPage
  - Export default component wrapping TenantManagementPage with TenantRepositoryProvider(repositoryType="memory")
  - Add metadata export: title "Tenant Management", description "Manage tenant organizations"

- [x] T023 [US1] Create error.tsx boundary in `src/app/tenants/error.tsx`:
  - 'use client' directive
  - Export default component accepting error and reset props
  - Display user-friendly error message
  - "Try Again" button calling reset()
  - Styled with Tailwind for error states

### Public API

- [x] T024 [US1] Create index.ts barrel export in `src/app/tenants/index.ts`:
  - Export { TenantManagementPage } from components/TenantManagementPage
  - Export { useTenantManagement } from hooks/UseTenantManagement
  - Export type { Tenant } from models/Tenant
  - Export type { TenantInput } from dto/TenantTypes

**Checkpoint**: User Story 1 complete - `/tenants` route displays table with 5 pre-seeded tenants, sorted newest first, with loading states

---

## Phase 4: User Story 2 - Create New Tenant (Priority: P2)

**Goal**: Administrators can click "Add Tenant" button, open modal form, enter tenant name, submit, and see new tenant appear in table with success toast

**Independent Test**: Click "Add Tenant", enter "New Corporation", submit, verify modal closes, toast shows success, and new tenant appears at top of table with auto-generated UUID and timestamps

### Domain Layer (Business Logic)

- [x] T025 [P] [US2] Create TenantLogic in `src/app/tenants/core/TenantLogic.ts`:
  - Export validateTenantInput(input: unknown) function using TenantInputSchema.parse()
  - Export createTenantEntity(input: TenantInput): Tenant function (generates UUID, creates Tenant object with current timestamps)

### Application Layer (Extend Hook)

- [x] T026 [US2] Extend UseTenantManagement hook in `src/app/tenants/hooks/UseTenantManagement.ts`:
  - Add createTenant async function:
    - Accept input: TenantInput
    - Call repository.createTenant(input)
    - Show success toast: toast.success('Tenant created successfully')
    - Call refetch() to update list
    - Catch errors: show toast.error(error.message)
  - Export createTenant in return value

### Presentation Layer (UI Components)

- [x] T027 [US2] Create TenantForm component in `src/app/tenants/components/TenantForm.tsx`:
  - 'use client' directive
  - Props: mode: 'create' | 'edit', tenant?: Tenant, onSubmit: (input: TenantInput) => Promise<void>, onClose: () => void
  - Use Dialog from src/components/ui/dialog.tsx
  - Form with name input field (Input from src/components/ui/input.tsx)
  - If mode === 'edit', show readonly fields for id, created_at, updated_at (using formatDateTime)
  - Zod validation using TenantInputSchema
  - Loading state during submission (disable inputs, show spinner on button)
  - Cancel button calls onClose
  - Submit button calls onSubmit with validated input
  - Close dialog on successful submission (onClose)

- [x] T028 [US2] Update TenantManagementPage in `src/app/tenants/components/TenantManagementPage.tsx`:
  - Add state: isCreateModalOpen (boolean), setIsCreateModalOpen
  - Update "Add Tenant" button: onClick={() => setIsCreateModalOpen(true)}, remove disabled prop
  - Add TenantForm with mode="create", open={isCreateModalOpen}, onSubmit={createTenant}, onClose={() => setIsCreateModalOpen(false)}

**Checkpoint**: User Story 2 complete - Can create new tenants via modal form with validation and success feedback

---

## Phase 5: User Story 3 - Update Existing Tenant (Priority: P2)

**Goal**: Administrators can click "Edit" button on any tenant row, modify tenant name in modal, submit, and see updated name in table with success toast

**Independent Test**: Click "Edit" on first tenant, change name to "Updated Corporation", submit, verify modal closes, toast shows success, and table displays updated name with new updated_at timestamp

### Application Layer (Extend Hook)

- [X] T029 [US3] Extend UseTenantManagement hook in `src/app/tenants/hooks/UseTenantManagement.ts`:
  - Add updateTenant async function:
    - Accept id: string, input: TenantInput
    - Call repository.updateTenant(id, input)
    - Show success toast: toast.success('Tenant updated successfully')
    - Call refetch() to update list
    - Catch errors: show toast.error(error.message)
  - Export updateTenant in return value

### Presentation Layer (UI Components)

- [X] T030 [US3] Update TenantTable in `src/app/tenants/components/TenantTable.tsx`:
  - Add props: onEdit: (tenant: Tenant) => void
  - In Actions column, add Edit button:
    - Use Button from src/components/ui/button.tsx
    - variant="outline", size="sm"
    - onClick={() => onEdit(tenant)}
    - Text: "Edit" or pencil icon from lucide-react

- [X] T031 [US3] Update TenantManagementPage in `src/app/tenants/components/TenantManagementPage.tsx`:
  - Add state: isEditModalOpen (boolean), editingTenant (Tenant | null)
  - Add handleEdit function: setIsEditModalOpen(true), setEditingTenant(tenant)
  - Pass onEdit={handleEdit} to TenantTable
  - Add TenantForm with mode="edit", tenant={editingTenant}, open={isEditModalOpen}, onSubmit={(input) => updateTenant(editingTenant!.id, input)}, onClose={() => { setIsEditModalOpen(false); setEditingTenant(null); }}

**Checkpoint**: User Story 3 complete - Can edit existing tenants with pre-filled form and validation

---

## Phase 6: User Story 4 - Delete Tenant (Priority: P3)

**Goal**: Administrators can click "Delete" button on any tenant row, see confirmation dialog, confirm deletion, and see tenant removed from table with success toast

**Independent Test**: Click "Delete" on last tenant, confirm in alert dialog, verify dialog closes, toast shows success, and tenant no longer appears in table

### Application Layer (Extend Hook)

- [X] T032 [US4] Extend UseTenantManagement hook in `src/app/tenants/hooks/UseTenantManagement.ts`:
  - Add deleteTenant async function:
    - Accept id: string
    - Call repository.deleteTenant(id)
    - Show success toast: toast.success('Tenant deleted successfully')
    - Call refetch() to update list
    - Catch errors: show toast.error(error.message)
  - Export deleteTenant in return value

### Presentation Layer (UI Components)

- [X] T033 [US4] Create DeleteTenantDialog in `src/app/tenants/components/DeleteTenantDialog.tsx`:
  - 'use client' directive
  - Props: tenant: Tenant | null, open: boolean, onConfirm: () => Promise<void>, onCancel: () => void
  - Use AlertDialog from src/components/ui/alert-dialog.tsx
  - AlertDialogTitle: "Delete Tenant"
  - AlertDialogDescription: "Are you sure you want to delete {tenant.name}? This action cannot be undone."
  - Cancel button (default focus): onClick={onCancel}
  - Delete button (destructive variant): onClick={onConfirm}, loading state during deletion

- [X] T034 [US4] Update TenantTable in `src/app/tenants/components/TenantTable.tsx`:
  - Add props: onDelete: (tenant: Tenant) => void
  - In Actions column, add Delete button:
    - Use Button from src/components/ui/button.tsx
    - variant="destructive", size="sm"
    - onClick={() => onDelete(tenant)}
    - Text: "Delete" or trash icon from lucide-react

- [X] T035 [US4] Update TenantManagementPage in `src/app/tenants/components/TenantManagementPage.tsx`:
  - Add state: isDeleteDialogOpen (boolean), deletingTenant (Tenant | null)
  - Add handleDelete function: setIsDeleteDialogOpen(true), setDeletingTenant(tenant)
  - Pass onDelete={handleDelete} to TenantTable
  - Add DeleteTenantDialog with tenant={deletingTenant}, open={isDeleteDialogOpen}, onConfirm={() => deleteTenant(deletingTenant!.id)}, onCancel={() => { setIsDeleteDialogOpen(false); setDeletingTenant(null); }}

**Checkpoint**: User Story 4 complete - Can delete tenants with confirmation dialog and success feedback

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and accessibility enhancements

- [X] T036 [P] Add ARIA labels to TenantTable action buttons in `src/app/tenants/components/TenantTable.tsx` (aria-label="Edit {tenant.name}" and "Delete {tenant.name}")
- [X] T037 [P] Add keyboard navigation to TenantTable in `src/app/tenants/components/TenantTable.tsx` (Tab through rows, Enter to trigger actions)
- [X] T038 [P] Add responsive mobile styles to TenantTable in `src/app/tenants/components/TenantTable.tsx` (Stack columns vertically on small screens using Tailwind)
- [X] T039 [P] Verify loading.tsx exists at `src/app/tenants/loading.tsx` (Create if missing: export default component with TenantTableSkeleton)
- [X] T040 Test complete CRUD flow: Create → Read → Update → Delete with all edge cases from spec.md
- [X] T041 [P] Update quickstart.md with actual implementation notes (if needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) completion (extends hook and components)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) completion (extends hook and components)
- **User Story 4 (Phase 6)**: Depends on User Story 3 (Phase 5) completion (extends hook and components)
- **Polish (Phase 7)**: Depends on all User Stories (Phases 3-6) being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation + no other stories (read-only, fully independent)
- **User Story 2 (P2)**: Extends US1 hook and components (adds create functionality)
- **User Story 3 (P2)**: Extends US2 hook and components (adds update functionality)
- **User Story 4 (P3)**: Extends US3 hook and components (adds delete functionality)

**Note**: User stories are NOT independent in this implementation because they progressively extend the same hook and components. This is intentional to avoid duplication and maintain a single source of truth.

### Within Each Phase

- Tasks marked [P] can run in parallel (different files)
- Non-parallel tasks must run sequentially (same file modifications)
- Domain layer before infrastructure layer (models before repositories)
- Infrastructure layer before application layer (repositories before hooks)
- Application layer before presentation layer (hooks before components)

### Parallel Opportunities

**Setup (Phase 1)**: T002 and T003 can run in parallel

**Foundational (Phase 2)**:
- T005, T006, T007, T008 can run in parallel (different UI files)
- T009, T010 can run in parallel (different utility files)

**User Story 1 (Phase 3)**:
- T012, T013 can run in parallel (different domain files)

**User Story 2 (Phase 4)**:
- T025 can run before T026 (domain before application)

**User Story 3 (Phase 5)**:
- T030, T031 depend on T029 (hook must be extended first)

**User Story 4 (Phase 6)**:
- T033, T034, T035 depend on T032 (hook must be extended first)

**Polish (Phase 7)**:
- T036, T037, T038, T039, T041 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all UI component creation tasks together:
Task: "Create Table primitives in src/components/ui/table.tsx"
Task: "Create Dialog component in src/components/ui/dialog.tsx"
Task: "Create AlertDialog component in src/components/ui/alert-dialog.tsx"
Task: "Create Toaster integration in src/components/ui/sonner.tsx"

# Launch all utility tasks together:
Task: "Create UUID utility in src/lib/uuid.ts"
Task: "Create date formatter utility in src/lib/date-formatter.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Dependencies installed
2. Complete Phase 2: Foundational → All UI components and utilities ready
3. Complete Phase 3: User Story 1 → Read-only tenant list working
4. **STOP and VALIDATE**: Navigate to `/tenants`, verify 5 tenants display in table
5. **MVP COMPLETE** - Can demo read-only tenant list

### Incremental Delivery (Add Features Progressively)

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Read-only list)
3. Add User Story 2 → Test create flow → Deploy/Demo (Can create tenants)
4. Add User Story 3 → Test update flow → Deploy/Demo (Can edit tenants)
5. Add User Story 4 → Test delete flow → Deploy/Demo (Full CRUD complete)
6. Polish → Accessibility, responsive design, final touches

### Sequential Implementation (Recommended)

Due to progressive enhancement of shared hook and components:

1. **Phase 1 → Phase 2** → Foundation
2. **Phase 3 (US1)** → Read-only list
3. **Phase 4 (US2)** → Add create to existing components
4. **Phase 5 (US3)** → Add edit to existing components
5. **Phase 6 (US4)** → Add delete to existing components
6. **Phase 7** → Polish and finalize

---

## Notes

- [P] tasks = different files, can run in parallel
- [Story] label (US1-US4) maps task to specific user story for traceability
- User stories extend the same hook and components progressively (not fully independent)
- No tests included (not requested in spec.md)
- All components follow Clean Architecture with clear layer separation
- Repository pattern with Dependency Inversion Principle applied throughout
- Simulated latency (100-300ms) provides realistic loading states for UX testing
- Pre-seeded mock data (5 tenants) enables immediate testing without setup
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate functionality independently

---

## Task Summary

**Total Tasks**: 41

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (User Story 1 - View): 13 tasks
- Phase 4 (User Story 2 - Create): 4 tasks
- Phase 5 (User Story 3 - Update): 4 tasks
- Phase 6 (User Story 4 - Delete): 4 tasks
- Phase 7 (Polish): 6 tasks

**By Story**:
- US1 (View List): 13 tasks
- US2 (Create): 4 tasks
- US3 (Update): 4 tasks
- US4 (Delete): 4 tasks
- Shared/Foundation: 11 tasks
- Polish: 6 tasks

**Parallel Opportunities**: 14 tasks marked [P] can run in parallel with other tasks

**MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = 24 tasks = Complete read-only tenant list

**Full CRUD Scope**: Phases 1-6 = 36 tasks = All CRUD operations functional

**Production Ready**: All phases 1-7 = 41 tasks = Polished, accessible, production-ready feature
