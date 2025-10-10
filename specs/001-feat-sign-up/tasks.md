# Tasks: User Sign-Up Feature

**Branch**: `001-feat-sign-up`  
**Input**: Design documents from `/specs/001-feat-sign-up/`  
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, contracts/api-signup.md ✅, quickstart.md ✅

**Tests**: Tests are NOT included by default. Add test tasks if TDD approach is required.

**Organization**: Tasks are organized by Clean Architecture layers to enable systematic implementation following SOLID principles.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = User Sign-Up MVP)
- Include exact file paths in descriptions

## Path Conventions
- **Next.js App Router**: `src/app/signup/` (feature root)
- **Clean Architecture layers**: 
  - `components/` (Presentation)
  - `hooks/` (Application)
  - `core/` (Domain)
  - `models/` (Domain Models)
  - `dto/` (Data Transfer Objects)
  - `repositories/` (Infrastructure)
  - `providers/` (Dependency Injection)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verify existing dependencies

- [X] T001 [P] Verify Next.js 15.5.4, React 19.1.0, TypeScript 5.x configuration
- [X] T002 [P] Verify Radix UI primitives installed (@radix-ui/react-label, @radix-ui/react-slot)
- [X] T003 [P] Verify Tailwind CSS 4.x, clsx, tailwind-merge, class-variance-authority
- [X] T004 [P] Verify Zod 4.1.12 installed
- [X] T005 Create feature directory structure: `src/app/signup/` with subdirectories (components/, hooks/, core/, models/, dto/, repositories/, providers/)

**Checkpoint**: Dependencies verified, feature structure created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core UI components and utilities that must exist before feature implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Verify shared UI components exist in `src/components/ui/` (button, input, label, card)
- [X] T007 [P] Verify `cn()` utility function exists in `src/lib/utils.ts` for className merging
- [X] T008 Create environment variable template `.env.local.example` with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_USE_LOCAL_STORAGE`
- [X] T009 [P] Setup MSW handlers structure in `tests/mocks/handlers.ts` (if testing infrastructure exists)

**Checkpoint**: Foundation ready - Clean Architecture implementation can now begin

---

## Phase 3: User Story 1 - User Sign-Up with Clean Architecture (Priority: P1) 🎯 MVP

**Goal**: Users can register with name and email following Clean Architecture with SOLID principles. Repository pattern with multiple implementations (API + localStorage) and Dependency Inversion.

**Independent Test**: Navigate to `/signup`, enter valid name/email, submit form, verify user created (check API response or localStorage)

### Domain Layer (Core Business Logic) - Framework-Independent

**Models (Domain Entities)**:
- [X] T010 [P] [US1] Create `User` interface in `src/app/signup/models/User.ts` (fields: id?, name, email, createdAt, emailVerified?)
- [X] T011 [P] [US1] Create `SignupSession` interface in `src/app/signup/models/SignupSession.ts` (fields: inProgress, user?, error?, startedAt?, completedAt?)

**Data Transfer Objects (DTOs with Zod Validation)**:
- [X] T012 [US1] Create `SignupTypes.ts` in `src/app/signup/dto/` with:
  - SignupInputSchema (Zod schema: name 2-100 chars, email valid format)
  - SignupOutputSchema (Zod schema: id, name, email, createdAt, emailVerified)
  - SignupInput type (inferred from schema)
  - SignupOutput type (inferred from schema)
  - Custom error classes: SignupValidationError, DuplicateEmailError, SignupAPIError

**Core Business Logic (Pure Functions)**:
- [X] T013 [US1] Create `SignupLogic.ts` in `src/app/signup/core/` with validation function `validate(data: unknown): SignupInput` using Zod schema

**Checkpoint**: Domain layer complete - pure TypeScript, no framework dependencies

---

### Infrastructure Layer (Data Access with Repository Pattern)

**Repository Interface (Abstraction)**:
- [X] T014 [US1] Create `ISignupRepository.ts` in `src/app/signup/repositories/` with interface:
  - `signup(input: SignupInput): Promise<User>`
  - `checkEmailExists(email: string): Promise<boolean>`

**Repository Implementations (Concrete)**:
- [X] T015 [P] [US1] Implement `ApiSignupRepository.ts` in `src/app/signup/repositories/`:
  - Constructor accepts baseUrl (from env)
  - `signup()` method: POST to `/api/signup`, validate response with SignupOutputSchema, map to User model
  - Handle errors: 409 → DuplicateEmailError, 400 → SignupAPIError, others → SignupAPIError
  - `checkEmailExists()` method: GET `/api/signup/check-email?email={email}`

- [X] T016 [P] [US1] Implement `LocalStorageSignupRepository.ts` in `src/app/signup/repositories/`:
  - `signup()` method: generate UUID, save to localStorage key `signup_users` (array), check duplicates first
  - `checkEmailExists()` method: iterate localStorage array, compare emails case-insensitive
  - Wrap localStorage calls in try-catch (quota exceeded, disabled)

**Repository Registry (Factory)**:
- [X] T017 [US1] Create `SignupRepositoryRegistry.ts` in `src/app/signup/repositories/`:
  - Static method `getRepository(type: 'api' | 'localStorage'): ISignupRepository`
  - Returns appropriate implementation based on type

**Checkpoint**: Infrastructure layer complete - Repository pattern with DIP implemented

---

### Dependency Injection (React Context)

- [X] T018 [US1] Create `SignupRepositoryProvider.tsx` in `src/app/signup/providers/`:
  - SignupRepositoryContext with React.createContext
  - SignupRepositoryProvider component accepts `type` prop ('api' | 'localStorage')
  - Uses SignupRepositoryRegistry to get implementation
  - `useSignupRepository()` hook to consume context (throws error if used outside provider)

**Checkpoint**: Dependency Injection complete - Repository can be injected via React Context

---

### Application Layer (Use Cases / Orchestration)

- [X] T019 [US1] Create `UseSignup.ts` hook in `src/app/signup/hooks/`:
  - Call `useSignupRepository()` to get repository (depends on ISignupRepository interface)
  - Manage signup state: SignupSession (inProgress, user, error)
  - `signup(input: SignupInput)` function:
    1. Set inProgress = true
    2. Call SignupLogic.validate(input) (domain layer)
    3. Call repository.checkEmailExists(input.email)
    4. If exists: throw DuplicateEmailError
    5. Call repository.signup(input)
    6. On success: set user, inProgress = false
    7. On error: set error message, inProgress = false
  - Return: { signup, session, isLoading, error }

**Checkpoint**: Application layer complete - Business flow orchestrated through hook

---

### Presentation Layer (UI Components)

**Client Component (Form)**:
- [X] T020 [US1] Create `SignUpForm.tsx` in `src/app/signup/components/`:
  - Add `'use client'` directive
  - Import Radix UI Label component
  - Import shared UI components (Button, Input, Card)
  - Use `useSignup()` hook from Application layer
  - Form state: useState for name and email
  - On blur: validate with SignupLogic.validate()
  - On submit:
    1. Call signup() from hook
    2. Show loading state (disable form, show spinner)
    3. On success: show success message with user.name
    4. On error: display user-friendly error message
  - Accessibility: aria-invalid, aria-describedby for errors, aria-live for announcements
  - Styling: Tailwind classes, use cn() utility

**Route Setup**:
- [X] T021 [US1] Create `page.tsx` in `src/app/signup/`:
  - Server component (default)
  - Import SignUpForm and SignupRepositoryProvider
  - Wrap `<SignUpForm />` in `<SignupRepositoryProvider type="api">`
  - Read type from env: `process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true' ? 'localStorage' : 'api'`
  - Add page metadata (title, description)

**Error Boundary**:
- [X] T022 [P] [US1] Create error boundary components:
  - Create `components/SignUpError.tsx` - Reusable error UI component with full implementation
  - Create `error.tsx` at route level - Thin wrapper that delegates to SignUpError component
  - SignUpError displays user-friendly error message, "Try Again" button, and logs to console
  - Pattern: error.tsx (Next.js special file) → SignUpError.tsx (testable component)

**Loading UI (Optional)**:
- [X] T023 [P] [US1] Create loading UI components:
  - Create `components/SignUpLoading.tsx` - Reusable loading skeleton component
  - Create `loading.tsx` at route level - Thin wrapper that delegates to SignUpLoading component
  - SignUpLoading displays skeleton loader with animated placeholders
  - Pattern: loading.tsx (Next.js special file) → SignUpLoading.tsx (testable component)

**Checkpoint**: Presentation layer complete - UI connected to Application layer

---

### Public API & Integration

- [X] T024 [US1] Create `index.ts` barrel export in `src/app/signup/`:
  - Export types: User, SignupSession, SignupInput, SignupOutput
  - Export schemas: SignupInputSchema, SignupOutputSchema
  - Export errors: SignupValidationError, DuplicateEmailError, SignupAPIError
  - Export interface: ISignupRepository
  - Export hook: useSignup (if needed by other features)

**Checkpoint**: User Story 1 COMPLETE - Full signup flow functional with Clean Architecture + SOLID principles

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation

- [X] T025 [P] Update `README.md` with signup feature description
- [X] T026 [P] Add navigation link to signup page in main layout (if needed)
- [X] T027 Verify environment variables documented in `.env.local.example`
- [X] T028 [P] Code review: Verify all 7 constitutional principles satisfied
- [X] T029 [P] Accessibility audit: Run axe DevTools on `/signup` page
- [X] T030 [P] Performance audit: Run Lighthouse, verify LCP < 2.5s, validation < 500ms
- [X] T031 Manual testing: Follow test cases in `quickstart.md` (valid signup, validation errors, duplicate email, network error)
- [X] T032 [P] Clean up console.logs and debug code
- [X] T033 Final commit and push to branch `001-feat-sign-up`

**Checkpoint**: Feature complete, tested, and ready for review

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - start immediately
2. **Foundational (Phase 2)**: Depends on Setup - BLOCKS all feature work
3. **User Story 1 (Phase 3)**: Depends on Foundational completion
   - Within Phase 3, follow Clean Architecture layer order:
     - Domain Layer (T010-T013) → can all run in parallel (different files)
     - Infrastructure Layer (T014-T017) → T014 first (interface), then T015-T016 parallel, then T017
     - Dependency Injection (T018) → depends on T014-T017
     - Application Layer (T019) → depends on T018 (needs repository provider)
     - Presentation Layer (T020-T023) → depends on T019 (needs useSignup hook)
     - Public API (T024) → depends on all previous tasks
4. **Polish (Phase 4)**: Depends on Phase 3 completion

### Critical Path (Blocking Tasks)

1. T005 (feature structure) → blocks all Phase 3
2. T014 (ISignupRepository interface) → blocks T015, T016, T017
3. T017 (Registry) → blocks T018 (Provider needs Registry)
4. T018 (Provider) → blocks T019 (Hook needs Provider)
5. T019 (UseSignup hook) → blocks T020 (Form needs Hook)
6. T020 (SignUpForm) → blocks T021 (Page needs Form)

### Parallel Opportunities

**Phase 1 (Setup)**: T001-T004 all parallel

**Phase 2 (Foundational)**: T006-T007, T009 all parallel

**Phase 3 - Domain Layer**: T010, T011 parallel (different files)

**Phase 3 - Infrastructure**: T015, T016 parallel after T014 (different files)

**Phase 3 - Presentation**: T022, T023 parallel after T020 (different files)

**Phase 4 (Polish)**: T025, T026, T028, T029, T030, T032 all parallel

---

## Parallel Execution Example

```bash
# Phase 1: Setup (all in parallel)
Task: "Verify Next.js 15.5.4, React 19.1.0, TypeScript 5.x configuration"
Task: "Verify Radix UI primitives installed"
Task: "Verify Tailwind CSS 4.x dependencies"
Task: "Verify Zod 4.1.12 installed"

# Phase 3 - Domain Layer (parallel)
Task: "Create User interface in src/app/signup/models/User.ts"
Task: "Create SignupSession interface in src/app/signup/models/SignupSession.ts"

# Phase 3 - Infrastructure (parallel after interface)
Task: "Implement ApiSignupRepository.ts"
Task: "Implement LocalStorageSignupRepository.ts"

# Phase 3 - Presentation (parallel after form)
Task: "Create error.tsx boundary"
Task: "Create loading.tsx"

# Phase 4 - Polish (all parallel)
Task: "Update README.md"
Task: "Accessibility audit with axe DevTools"
Task: "Performance audit with Lighthouse"
Task: "Clean up debug code"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (verify dependencies)
2. ✅ Complete Phase 2: Foundational (shared UI components)
3. → Complete Phase 3: User Story 1 (full signup flow)
   - Follow Clean Architecture layer order
   - Test at each checkpoint
4. **STOP and VALIDATE**: Test signup flow manually
   - Valid signup: success message
   - Validation errors: inline errors
   - Duplicate email: specific error
   - Network error: fallback to localStorage
5. Complete Phase 4: Polish (review, audit, cleanup)
6. Deploy/demo

### Recommended Order (Sequential Implementation)

If implementing solo, follow this order for systematic progress:

1. **T001-T005**: Setup (verify dependencies, create structure)
2. **T006-T009**: Foundational (shared components)
3. **T010-T013**: Domain Layer (models, DTOs, core logic) - SOLID foundation
4. **T014-T017**: Infrastructure Layer (repository pattern) - Dependency Inversion
5. **T018**: Dependency Injection (provider for repositories)
6. **T019**: Application Layer (use case hook orchestrates everything)
7. **T020-T024**: Presentation Layer (UI connects to application layer)
8. **T025-T033**: Polish (review, test, cleanup)

### Checkpoints for Validation

- **After T013**: Domain layer complete → unit test validation functions
- **After T017**: Infrastructure layer complete → integration test repositories (with MSW if available)
- **After T019**: Application layer complete → test hook with mock repository
- **After T024**: Full feature complete → manual E2E test in browser
- **After T033**: Feature polished → final review and deployment

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **Clean Architecture**: Dependencies flow inward (Presentation → Application → Domain ← Infrastructure)
- **SOLID Principles**: Applied throughout (SRP, OCP, LSP, ISP, DIP)
- **Repository Pattern**: All data access through ISignupRepository interface
- **Dependency Injection**: Repositories injected via React Context providers
- **Type Safety**: Full TypeScript coverage, Zod schemas for runtime validation
- **Accessibility**: WCAG 2.1 AA compliance (Radix UI + ARIA labels)
- **Performance**: Target LCP < 2.5s, validation < 500ms
- **Testing**: Optional - add test tasks if TDD approach required
- **Commit Strategy**: Commit after each checkpoint or logical group of tasks
- **Constitution Compliance**: All 7 principles satisfied (see plan.md Constitution Check)

---

## Reference Documents

- **Implementation Plan**: `specs/001-feat-sign-up/plan.md`
- **Research Decisions**: `specs/001-feat-sign-up/research.md`
- **Data Model**: `specs/001-feat-sign-up/data-model.md`
- **API Contract**: `specs/001-feat-sign-up/contracts/api-signup.md`
- **Quickstart Guide**: `specs/001-feat-sign-up/quickstart.md`
- **Project Constitution**: `.specify/memory/constitution.md` (v3.0.0)
