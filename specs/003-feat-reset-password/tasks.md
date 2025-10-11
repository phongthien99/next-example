# Tasks: Password Reset Feature

**Feature**: Password Reset  
**Branch**: 003-feat-reset-password  
**Input**: Design documents from `/specs/003-feat-reset-password/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

**Tests**: Tests are not included in this task list as they were not explicitly requested in the feature specification.

---

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths follow Clean Architecture structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure for password reset feature

- [x] **T001** Create feature directory structure at `src/app/reset-password/` with subdirectories: `components/`, `hooks/`, `core/`, `repositories/`, `providers/`, `dto/`
- [x] **T002** [P] Verify environment variable setup: ensure `.env.local` has `NEXT_PUBLIC_API_BASE_URL` configured
- [x] **T003** [P] Verify existing dependencies are installed: `@tanstack/react-query`, `zod`, `lucide-react`, `@radix-ui/react-label`, `@radix-ui/react-slot`

**Checkpoint**: ✅ Feature structure ready, dependencies verified

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core building blocks that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Data Transfer Objects (DTOs) - Foundation

- [x] **T004** Create Zod schemas in `src/app/reset-password/dto/ResetPasswordTypes.ts`:
  - `ResetPasswordInputSchema` (password, confirmPassword with min 4 chars validation)
  - `ResetPasswordRequestSchema` (token, newPassword)
  - `ResetPasswordResponseSchema` (success, message)
  - Export TypeScript types via `z.infer<typeof Schema>`

- [x] **T005** [P] Create error handling types in `src/app/reset-password/dto/ResetPasswordTypes.ts`:
  - `ResetPasswordErrorCode` enum (TOKEN_INVALID, TOKEN_EXPIRED, TOKEN_MISSING, VALIDATION_ERROR, NETWORK_ERROR, SERVER_ERROR)
  - `ResetPasswordError` class extending Error
  - `ValidationError` interface for form state

### Domain Layer - Foundation

- [x] **T006** [P] Create pure validation functions in `src/app/reset-password/core/ResetPasswordLogic.ts`:
  - `validateResetPasswordInput()` - validates password and confirmPassword
  - `validateToken()` - basic token format validation
  - `toResetPasswordRequest()` - transforms form input to API request

### Infrastructure Layer - Foundation

- [x] **T007** Create repository interface in `src/app/reset-password/repositories/IResetPasswordRepository.ts`:
  - Define `IResetPasswordRepository` interface with `resetPassword(request): Promise<response>` method

- [x] **T008** Implement API repository in `src/app/reset-password/repositories/ApiResetPasswordRepository.ts`:
  - Implement `IResetPasswordRepository` interface
  - Make POST request to `/api/auth/reset-password`
  - Parse response with Zod schema
  - Map HTTP status codes to error codes
  - Handle network errors

- [x] **T009** Create repository registry in `src/app/reset-password/repositories/ResetPasswordRepositoryRegistry.ts`:
  - Factory function `getRepository(type: 'api')` returns `ApiResetPasswordRepository`
  - Supports future mock implementations

### Dependency Injection - Foundation

- [x] **T010** Create React Context provider in `src/app/reset-password/providers/ResetPasswordRepositoryProvider.tsx`:
  - `ResetPasswordRepositoryProvider` component using React Context
  - `useResetPasswordRepository()` hook to access injected repository
  - Use registry to instantiate repository

**Checkpoint**: ✅ Foundation complete - All layers defined, repository pattern established, user story implementation can now begin

---

## Phase 3: User Story 1 - Successful Password Reset (Priority: P1) 🎯 MVP

**Goal**: Allow users with valid reset tokens to successfully reset their password

**Independent Test**: Provide valid token in URL, enter matching passwords (4+ chars), submit form, verify success message and redirect to login

**Acceptance Criteria**:
1. User enters 4+ character password in both fields → submission succeeds
2. After success → user sees confirmation message
3. After 2 seconds → user redirected to `/login`

### Application Layer (Use Case)

- [x] **T011** [US1] Implement password reset hook in `src/app/reset-password/hooks/UseResetPassword.ts`:
  - Accept `token` parameter from URL
  - Use `useMutation` from React Query
  - Call `validateResetPasswordInput()` before API call
  - Call `repository.resetPassword()` via injected repository
  - Handle success: set success message, redirect after 2 seconds
  - Handle errors: map error codes to user messages
  - Return: `submitReset`, `isLoading`, `isSuccess`, `error`, `validationErrors`

### Presentation Layer (UI Components)

- [x] **T012** [US1] Create form component in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Accept `token` prop (string | null)
  - Two password input fields (password, confirmPassword)
  - Show/hide password toggles using Lucide React `Eye`/`EyeOff` icons
  - Display validation errors inline below each field
  - Display API errors with link to `/forgot-password` for expired tokens
  - Submit button with loading state
  - Success message display
  - Handle missing token case with error UI
  - All inputs have proper ARIA labels and semantic HTML

- [x] **T013** [US1] Create page route in `src/app/reset-password/page.tsx`:
  - Use `'use client'` directive
  - Extract token from URL using `useSearchParams()` hook
  - Wrap `useSearchParams()` usage in `<Suspense>` boundary
  - Wrap form in `ResetPasswordRepositoryProvider`
  - Render `ResetPasswordForm` with token prop
  - Include loading fallback for Suspense

- [x] **T014** [US1] Create error boundary in `src/app/reset-password/error.tsx`:
  - Client component with error and reset props
  - Display user-friendly error message
  - Provide retry button that calls reset()
  - Link to `/forgot-password` for recovery

### Public API

- [x] **T015** [US1] Create barrel export in `src/app/reset-password/index.ts`:
  - Export `ResetPasswordForm` component
  - Export `useResetPassword` hook
  - Export types from DTOs

**Checkpoint**: ✅ User Story 1 complete - Users can successfully reset passwords with valid tokens. MVP is functional!

---

## Phase 4: User Story 2 - Password Validation and Feedback (Priority: P1)

**Goal**: Provide immediate, clear validation feedback when users enter invalid passwords

**Independent Test**: Enter invalid passwords (too short, mismatched) and verify error messages appear instantly without API call

**Acceptance Criteria**:
1. Password < 4 characters → error message appears
2. Passwords don't match → error message appears
3. Errors corrected → error messages disappear

### Enhancement to Application Layer

- [x] **T016** [US2] Enhance `UseResetPassword` hook in `src/app/reset-password/hooks/UseResetPassword.ts`:
  - Add real-time validation on blur or input change
  - Update `validationErrors` state immediately
  - Add `clearValidationErrors()` function
  - Prevent API submission if validation fails

### Enhancement to Presentation Layer

- [x] **T017** [US2] Enhance form validation in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Add `onBlur` handlers to password inputs for instant validation
  - Display validation errors immediately (< 1 second requirement)
  - Clear errors when user starts correcting input
  - Disable submit button when validation errors exist
  - Add visual indicators: red border on invalid inputs, green checkmark on valid
  - Ensure error messages have `role="alert"` for screen readers
  - Add `aria-invalid` attribute to inputs with errors
  - Associate errors with inputs using `aria-describedby`

**Checkpoint**: ✅ User Story 2 complete - Users receive instant, clear feedback on validation errors. Both US1 and US2 are functional!

---

## Phase 5: User Story 3 - Invalid or Expired Token Handling (Priority: P2)

**Goal**: Handle expired/invalid tokens gracefully and guide users to recovery

**Independent Test**: Access page with expired/invalid token, verify error message and link to request new reset

**Acceptance Criteria**:
1. Expired token → clear error message with explanation
2. Invalid token → error message displayed
3. User shown link to `/forgot-password` page

### Enhancement to Application Layer

- [x] **T018** [US3] Enhance error handling in `UseResetPassword` hook in `src/app/reset-password/hooks/UseResetPassword.ts`:
  - Detect `TOKEN_EXPIRED` and `TOKEN_INVALID` error codes from API response
  - Set appropriate error message for each case
  - Provide flag to show "Request New Link" button

### Enhancement to Presentation Layer

- [x] **T019** [US3] Enhance error display in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Add specific error UI for expired tokens
  - Add specific error UI for invalid tokens
  - Show "Request New Reset Link" button that redirects to `/forgot-password`
  - Display message: "This reset link has expired. Please request a new one."
  - Ensure all error states are accessible (proper ARIA, keyboard navigation)

- [x] **T020** [US3] Add missing token handling in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Check if token is null on component mount
  - Display error: "Reset link is invalid. Please request a new password reset."
  - Show link to `/forgot-password`
  - Prevent form rendering when token is missing

**Checkpoint**: ✅ User Story 3 complete - All token error cases handled gracefully. All three user stories are functional!

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final touches, styling, and cross-cutting improvements

### Styling & UX

- [x] **T021** [P] Apply Tailwind CSS styling to form component in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Style form layout (centered, max-width, padding)
  - Style input fields (consistent with existing UI)
  - Style buttons (primary style for submit, ghost style for toggle)
  - Style error messages (red text, icon, accessible contrast)
  - Style success messages (green background, icon)
  - Ensure responsive design for mobile, tablet, desktop

- [x] **T022** [P] Add loading animations in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Loading spinner on submit button during API call
  - Disable form inputs during submission
  - Loading skeleton for suspense fallback

### Accessibility Final Review

- [x] **T023** Review accessibility compliance for all components:
  - Verify all inputs have associated labels
  - Verify all error messages use `role="alert"`
  - Verify all interactive elements are keyboard accessible
  - Verify focus management (auto-focus first field on load)
  - Verify color contrast meets WCAG 2.1 AA standards
  - Test with screen reader (NVDA/JAWS/VoiceOver)

### Performance Optimization

- [x] **T024** [P] Optimize form performance:
  - Add debounce to validation (300ms delay after typing stops)
  - Use `useMemo` for computed validation state
  - Minimize re-renders using `React.memo` if needed
  - Verify icon tree-shaking (Lucide React)

### Documentation

- [x] **T025** [P] Update feature documentation:
  - Add usage examples to `specs/003-feat-reset-password/quickstart.md` (if needed)
  - Document environment variables in root README.md
  - Add component documentation comments (JSDoc)

### Edge Case Handling

- [x] **T026** Add edge case handling in `src/app/reset-password/components/ResetPasswordForm.tsx`:
  - Handle empty password submission (show validation error)
  - Handle extremely long passwords (128 char max from Zod schema)
  - Handle network timeout errors with retry option
  - Handle token reuse (409 status from API)

**Checkpoint**: ✅ All polish tasks complete - Feature is production-ready!

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)** → No dependencies, start immediately
2. **Foundational (Phase 2)** → Depends on Setup, **BLOCKS all user stories**
3. **User Story 1 (Phase 3)** → Depends on Foundational completion
4. **User Story 2 (Phase 4)** → Depends on Foundational, can run parallel to US1 (but builds on US1 components)
5. **User Story 3 (Phase 5)** → Depends on Foundational, can run parallel to US1/US2 (but builds on US1 components)
6. **Polish (Phase 6)** → Depends on desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories ✅ Can start after Foundational
- **US2 (P1)**: Enhances US1 components ⚠️ Should complete after US1 for easier implementation
- **US3 (P2)**: Enhances US1 error handling ⚠️ Should complete after US1 for easier implementation

**Recommended Order**: Foundational → US1 (MVP) → US2 → US3 → Polish

### Within Each Phase

**Phase 2 (Foundational)**:
- T004 (DTOs) must complete first
- T005 (Error types) can run parallel to T006 [P]
- T006 (Domain logic) depends on T004 (needs types)
- T007 (Interface) can run parallel to T006 [P]
- T008 (API Repository) depends on T004, T005, T007
- T009 (Registry) depends on T008
- T010 (Provider) depends on T007, T009

**Phase 3 (US1)**:
- T011 (Hook) must complete before T012 (Form uses hook)
- T012 (Form) must complete before T013 (Page uses form)
- T013 (Page) and T014 (Error boundary) can run parallel [P] if different developers
- T015 (Barrel export) must be last

**Phase 4 (US2)**:
- T016 (Hook enhancement) and T017 (Form enhancement) are sequential (hook first)

**Phase 5 (US3)**:
- T018 (Hook enhancement) must complete before T019, T020
- T019 and T020 are both form enhancements (sequential)

**Phase 6 (Polish)**:
- Most tasks marked [P] can run in parallel

### Parallel Opportunities

**Setup Phase**:
```bash
# All can run in parallel:
T002 [P] Verify environment variables
T003 [P] Verify dependencies
```

**Foundational Phase**:
```bash
# First wave (parallel):
T005 [P] Error types
T006 [P] Domain logic (after T004)
T007 [P] Repository interface

# Second wave (after first):
T008 API Repository (needs T004, T005, T007)
```

**Polish Phase**:
```bash
# All can run in parallel:
T021 [P] Styling
T022 [P] Loading animations
T024 [P] Performance optimization
T025 [P] Documentation
```

---

## Parallel Example: Foundational Phase

```bash
# After T004 completes, launch in parallel:
Task: "Create error types in src/app/reset-password/dto/ResetPasswordTypes.ts (T005)"
Task: "Create validation functions in src/app/reset-password/core/ResetPasswordLogic.ts (T006)"
Task: "Create repository interface in src/app/reset-password/repositories/IResetPasswordRepository.ts (T007)"

# Then launch:
Task: "Implement API repository in src/app/reset-password/repositories/ApiResetPasswordRepository.ts (T008)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) 🎯 RECOMMENDED

**Timeline**: ~2-3 days for solo developer

1. ✅ Complete Phase 1: Setup (15 minutes)
2. ✅ Complete Phase 2: Foundational (2-3 hours - CRITICAL)
3. ✅ Complete Phase 3: User Story 1 (4-6 hours)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo MVP if ready

**Result**: Users can reset passwords with valid tokens - core value delivered!

### Incremental Delivery (All User Stories)

**Timeline**: ~3-4 days for solo developer

1. Setup + Foundational → Foundation ready (3 hours)
2. User Story 1 → Test independently → Deploy (MVP ready, 6 hours)
3. User Story 2 → Test independently → Deploy (validation UX, 2 hours)
4. User Story 3 → Test independently → Deploy (error handling, 2 hours)
5. Polish → Final production release (3 hours)

**Result**: Each phase adds value without breaking previous functionality

### Parallel Team Strategy (3+ Developers)

**Timeline**: ~1-2 days with team

1. **Day 1 Morning**: Team completes Setup + Foundational together (3 hours)
2. **Day 1 Afternoon**: Split work after Foundational:
   - Developer A: User Story 1 (core functionality)
   - Developer B: User Story 2 (validation - depends on US1 for context but can read code)
   - Developer C: User Story 3 (error handling - depends on US1 for context but can read code)
3. **Day 2**: Integration, testing, polish together

**Note**: US2 and US3 enhance US1 components, so coordination is needed. Best to complete US1 first, then parallelize US2 and US3.

---

## Task Summary

**Total Tasks**: 26 tasks
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 7 tasks ⚠️ BLOCKING
- **Phase 3 (US1 - P1)**: 5 tasks 🎯 MVP
- **Phase 4 (US2 - P1)**: 2 tasks
- **Phase 5 (US3 - P2)**: 3 tasks
- **Phase 6 (Polish)**: 6 tasks

**Parallel Opportunities**: 10 tasks marked [P] can run in parallel with other tasks

**User Story Breakdown**:
- US1 (Successful Password Reset): 5 implementation tasks → MVP
- US2 (Password Validation): 2 enhancement tasks → Better UX
- US3 (Token Error Handling): 3 enhancement tasks → Complete error handling

**Estimated Effort**:
- Solo Developer (Sequential): ~3-4 days
- Solo Developer (MVP Only): ~1 day
- Team of 3 (Parallel): ~1-2 days

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)

---

## Notes

- **Tests not included**: No test tasks generated as testing was not explicitly requested in the feature specification
- **Clean Architecture**: All tasks follow 4-layer separation (Presentation, Application, Domain, Infrastructure)
- **SOLID Principles**: Repository pattern with dependency inversion applied throughout
- **Independent Stories**: Each user story builds on US1 but adds independent value
- **Accessibility Built-In**: WCAG 2.1 AA compliance requirements included in implementation tasks
- **No New Dependencies**: Feature uses existing project dependencies only

**Ready to implement**: Run `/speckit.implement` to execute these tasks automatically, or implement manually following the task order.
