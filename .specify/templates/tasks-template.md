---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- **Clean Architecture layers**: `components/` (Presentation), `hooks/` (Application), `core/` (Domain), `repositories/` (Infrastructure)
- Paths shown below assume single project with Clean Architecture - adjust based on plan.md structure

<!-- 
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/
  
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project and Clean Architecture):

- [ ] T004 Setup shared UI components in src/components/ui/ (button, input, etc.)
- [ ] T005 [P] Create base utility functions in src/lib/utils.ts
- [ ] T006 [P] Setup React Query provider in src/app/providers.tsx
- [ ] T007 Configure error boundary component structure
- [ ] T008 Setup environment configuration (.env.local template)
- [ ] T009 [P] Create shared TypeScript types/interfaces (if cross-feature)
- [ ] T010 Setup testing infrastructure (Vitest config, MSW handlers)

**Clean Architecture Foundation** (if applicable to multiple features):
- [ ] T011 [P] Create base repository interface pattern documentation
- [ ] T012 [P] Setup shared API client wrapper in src/lib/api-client.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

**NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T011 [P] [US1] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 1 (Clean Architecture Layers)

**Domain Layer (Core Business Logic)**:
- [ ] T012 [P] [US1] Create [Entity1] domain model in src/app/[feature]/models/[Entity1].ts
- [ ] T013 [P] [US1] Create [Entity2] domain model in src/app/[feature]/models/[Entity2].ts
- [ ] T014 [P] [US1] Implement [Feature]Logic pure functions in src/app/[feature]/core/[Feature]Logic.ts

**Data Transfer Objects (DTOs)**:
- [ ] T015 [P] [US1] Define Zod schemas in src/app/[feature]/dto/[Feature]Types.ts

**Infrastructure Layer (Data Access)**:
- [ ] T016 [US1] Create I[Feature]Repository interface in src/app/[feature]/repositories/I[Feature]Repository.ts
- [ ] T017 [P] [US1] Implement Api[Feature]Repository in src/app/[feature]/repositories/Api[Feature]Repository.ts
- [ ] T018 [P] [US1] Implement LocalStorage[Feature]Repository in src/app/[feature]/repositories/LocalStorage[Feature]Repository.ts
- [ ] T019 [US1] Create [Feature]RepositoryRegistry in src/app/[feature]/repositories/[Feature]RepositoryRegistry.ts

**Dependency Injection**:
- [ ] T020 [US1] Create [Feature]RepositoryProvider in src/app/[feature]/providers/[Feature]RepositoryProvider.tsx

**Application Layer (Use Cases)**:
- [ ] T021 [US1] Implement Use[Feature] hook in src/app/[feature]/hooks/Use[Feature].ts (orchestrates domain + infrastructure)

**Presentation Layer (UI)**:
- [ ] T022 [US1] Create [Feature]Form component in src/app/[feature]/components/[Feature]Form.tsx
- [ ] T023 [US1] Create page.tsx route in src/app/[feature]/page.tsx
- [ ] T024 [US1] Create error.tsx boundary in src/app/[feature]/error.tsx

**Public API**:
- [ ] T025 [US1] Create index.ts barrel export in src/app/[feature]/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently with all SOLID principles applied

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T019 [P] [US2] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 2 (Clean Architecture Layers)

**Domain Layer**:
- [ ] T026 [P] [US2] Create domain models in src/app/[feature]/models/
- [ ] T027 [P] [US2] Implement core business logic in src/app/[feature]/core/

**DTOs & Infrastructure**:
- [ ] T028 [P] [US2] Define Zod schemas in src/app/[feature]/dto/
- [ ] T029 [US2] Create repository interface in src/app/[feature]/repositories/I[Feature]Repository.ts
- [ ] T030 [P] [US2] Implement repository implementations (API + localStorage)
- [ ] T031 [US2] Create repository registry

**DI & Application**:
- [ ] T032 [US2] Create provider for DI in src/app/[feature]/providers/
- [ ] T033 [US2] Implement use case hook in src/app/[feature]/hooks/

**Presentation**:
- [ ] T034 [US2] Create UI components in src/app/[feature]/components/
- [ ] T035 [US2] Create page.tsx and error.tsx
- [ ] T036 [US2] Integrate with User Story 1 (if needed, via public APIs only)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T024 [P] [US3] Contract test for [endpoint] in tests/contract/test_[name].py
- [ ] T025 [P] [US3] Integration test for [user journey] in tests/integration/test_[name].py

### Implementation for User Story 3 (Clean Architecture Layers)

**Follow same Clean Architecture pattern as US1 and US2**:
- [ ] T037 [P] [US3] Domain models and core logic (models/ + core/)
- [ ] T038 [P] [US3] DTOs with Zod schemas (dto/)
- [ ] T039 [US3] Repository interface and implementations (repositories/)
- [ ] T040 [US3] Dependency injection provider (providers/)
- [ ] T041 [US3] Use case hook (hooks/)
- [ ] T042 [US3] UI components and routes (components/ + page.tsx)

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if requested) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence


