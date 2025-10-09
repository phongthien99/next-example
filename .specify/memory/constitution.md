<!--
SYNC IMPACT REPORT
==================
Version Change: 2.20.0 → 3.0.0
Rationale: MAJOR version bump - Complete architecture paradigm shift from simple layered architecture to Clean Architecture with SOLID principles and Repository pattern

Modified Principles:
  - Principle VI: Feature Architecture Pattern (Frontend-Only) → Clean Architecture with SOLID Principles
    * Removed: Simple layered structure (schemas/, services/, hooks/)
    * Added: 4-layer Clean Architecture (Presentation, Application, Domain, Infrastructure)
    * Added: Repository pattern with interface abstraction and dependency inversion
    * Added: Multiple repository implementations (API + localStorage)
    * Added: Dependency Injection via React Context providers
    * Added: Domain models and pure business logic layer
    * Added: SOLID principles application throughout

  - Principle VII: Technology Stack & Architecture Standards
    * Updated: Emphasis on Clean Architecture patterns
    * Added: Repository pattern as core data access strategy
    * Clarified: No React Query mentioned in actual implementation (uses custom hooks + repositories)
    * Enhanced: Testing strategy to include repository mocking at interface level

Templates Status:
  ✅ plan-template.md - Updated with Clean Architecture structure and SOLID principles checklist
  ✅ spec-template.md - Compatible with Clean Architecture (technology-agnostic)
  ✅ tasks-template.md - Updated with Clean Architecture task breakdown by layers
  ✅ checklist-template.md - Compatible (generic template)

Architecture Changes:
  - FROM: Simple layered (Presentation → Hooks → Services → API)
  - TO: Clean Architecture (Presentation → Application → Domain ← Infrastructure)
  - Repository Pattern: All data access through interfaces with DIP
  - Dependency Injection: React Context for repository implementations
  - SOLID Principles: Applied at every layer

New Mandatory Layers:
  - core/ (Domain Layer): Pure business logic, framework-independent
  - models/ (Domain Models): TypeScript classes/interfaces for entities
  - repositories/ (Infrastructure): Interface + multiple implementations
  - providers/ (DI): React Context for dependency injection
  - dto/ (Data Transfer Objects): Zod schemas replacing simple schemas/

Removed Patterns:
  - Simple services/ folder (replaced with repositories/)
  - Direct API calls from hooks (now through repository interfaces)
  - schemas/ folder (replaced with dto/ for Data Transfer Objects)

Follow-up TODOs:
  - Update any existing features to follow new Clean Architecture pattern
  - Document migration guide for converting simple layered features to Clean Architecture
  - Consider adding architectural decision records (ADRs) for future changes
  - Add example feature demonstrating full Clean Architecture implementation

Ratification:
  - Original constitution: 2.20.0 (2025-10-09) - Simple layered frontend-only
  - Updated constitution: 3.0.0 (2025-10-09) - Clean Architecture with SOLID principles
  - Breaking change requires full architectural review for all new features
-->

# Next-Soild Project Constitution

**Project Type**: **Frontend-Only Web Application** (Clean Architecture with SOLID Principles)

## Core Principles

### I. Type Safety First

Every component, function, and API interaction MUST be fully typed using TypeScript. No `any` types are permitted in production code except with explicit justification documented in code comments. Zod schemas MUST be defined for all external data boundaries (API responses, user inputs, environment variables).

**Rationale**: Type safety catches errors at compile time, provides better IDE support, and serves as living documentation for the codebase.

### II. Component-Driven Architecture

UI features MUST be built as reusable, composable components. Components MUST follow the single responsibility principle and be organized hierarchically: primitives (Radix UI) → base components (shadcn/ui) → feature components → page layouts. Each component MUST have a clear, documented API (props interface).

**Rationale**: Component-driven design enables parallel development, easier testing, consistent UI/UX, and maintainable code at scale.

### III. Frontend-Only Rendering Strategy

**Architecture Context**: This is a **frontend-only application** that consumes external APIs. There is **no backend database** or Server Actions.

**Rendering Strategy**:
- Use **server components** for static page shells, layouts, and SEO-critical content
- Use **client components** (`'use client'`) for forms, interactive UI, API calls, and stateful logic
- **React Query** MUST be used for external API state management, caching, and mutations (when applicable)
- **localStorage** MAY be used for client-side caching of non-sensitive data only

**Data Flow Pattern**:
```
User Interaction → Client Component → Hook (Use Case) → Repository Interface
                                                              ↓
                                              Repository Implementation (API/localStorage)
                                                              ↓
                                              External System (API/Browser Storage)
```

**Key Rules**:
1. Server components are static shells only (no dynamic data fetching from backend)
2. All data access happens through Repository pattern
3. Forms use client components with Zod validation
4. No Server Actions (not applicable for frontend-only)
5. State management: Repositories (data) + React Context (global UI state) + URL state

**Rationale**: Frontend-only architecture with server components for static content provides excellent SEO and initial page load performance while maintaining flexibility to consume any external API without backend complexity.

### IV. Data Validation & Error Handling

All external inputs (forms, API calls, URL parameters) MUST be validated using Zod schemas. Error boundaries MUST be implemented at appropriate component tree levels. User-facing errors MUST be actionable and friendly; technical errors MUST be logged with sufficient context for debugging.

**Frontend-Only Specific**:
- Validate form inputs client-side with Zod before submission
- Validate external API responses with Zod (never trust external data)
- Handle network errors gracefully with retry mechanisms
- Provide offline feedback when API is unreachable

**Rationale**: Robust validation prevents runtime errors and security issues. Proper error handling improves user experience and system observability.

### V. Performance & Accessibility

All pages MUST meet Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1). Components MUST be accessible (WCAG 2.1 AA minimum) with proper semantic HTML, ARIA labels, and keyboard navigation. Images MUST use Next.js Image optimization. Client-side data access MUST implement proper loading states and caching strategies.

**Rationale**: Performance and accessibility are not optional—they directly impact user satisfaction, SEO rankings, and legal compliance.

### VI. Clean Architecture with SOLID Principles (NON-NEGOTIABLE)

Every feature MUST follow **Clean Architecture** with **SOLID principles** and the **Repository pattern**. Features are organized by domain (e.g., `login`, `signup`, `dashboard`) with clear separation of concerns and dependency inversion.

**Architectural Layers** (Outside-In):

```
Presentation Layer → Application Layer → Domain Layer ← Infrastructure Layer
(UI Components)     (Hooks/Use Cases)    (Core Logic)    (Repositories/APIs)
```

**Standard Feature Structure** (example: Login):

```
src/app/[feature]/
├── page.tsx                          # Route: Next.js page (presentation entry)
├── error.tsx                         # Error boundary
├── loading.tsx                       # Loading UI (optional)
│
├── components/                       # Presentation Layer
│   └── [Feature]Form.tsx             # Client component: UI + form handling
│
├── hooks/                            # Application Layer (Use Cases)
│   └── Use[Feature].ts               # Custom hook: orchestrates business flow
│
├── core/                             # Domain Layer (Business Logic)
│   └── [Feature]Logic.ts             # Pure functions: validation, transformations
│
├── repositories/                     # Infrastructure Layer (Data Access)
│   ├── I[Feature]Repository.ts       # Interface: defines contract (DIP)
│   ├── Api[Feature]Repository.ts     # Implementation: external API
│   ├── LocalStorage[Feature]Repository.ts  # Implementation: localStorage
│   └── [Feature]RepositoryRegistry.ts      # Registry: selects implementation
│
├── providers/                        # Dependency Injection
│   └── [Feature]RepositoryProvider.tsx     # React Context for DI
│
├── models/                           # Domain Models
│   └── [DomainEntity].ts             # TypeScript classes/interfaces
│
├── dto/                              # Data Transfer Objects
│   └── [Feature]Types.ts             # Zod schemas + inferred types
│
└── index.ts                          # Public API: barrel export
```

**SOLID Principles Application**:

1. **Single Responsibility Principle (SRP)**:
   - Each layer has ONE responsibility
   - Components only handle UI rendering
   - Core logic only contains pure business functions
   - Repositories only handle data access

2. **Open/Closed Principle (OCP)**:
   - Add new repository implementations without modifying existing code
   - Extend functionality through new hooks/services, not modifications

3. **Liskov Substitution Principle (LSP)**:
   - All repository implementations MUST be interchangeable
   - `ApiAuthRepository` and `LocalStorageAuthRepository` both implement `IAuthRepository`

4. **Interface Segregation Principle (ISP)**:
   - Repository interfaces define only methods needed by clients
   - No fat interfaces with unused methods

5. **Dependency Inversion Principle (DIP)**:
   - High-level modules (hooks) depend on abstractions (interfaces), not concrete implementations
   - `UseLogin` hook depends on `IAuthRepository` interface, not `ApiAuthRepository`
   - Concrete implementations injected via React Context providers

**Repository Pattern**:

```typescript
// 1. Interface (abstraction)
interface IAuthRepository {
  login(input: LoginInput): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): AuthSession | null;
}

// 2. Implementations (concrete)
class ApiAuthRepository implements IAuthRepository { /* ... */ }
class LocalStorageAuthRepository implements IAuthRepository { /* ... */ }

// 3. Registry (factory)
class AuthRepositoryRegistry {
  static getRepository(type: 'api' | 'local'): IAuthRepository { /* ... */ }
}

// 4. Provider (dependency injection)
<AuthRepositoryProvider type="api">
  {/* Components use injected repository */}
</AuthRepositoryProvider>

// 5. Hook (consumer)
function UseLogin() {
  const repository = useAuthRepository(); // IAuthRepository
  // Hook doesn't know which implementation it's using
}
```

**Data Flow** (Clean Architecture):

```
User Input → Component → Hook (Use Case) → Core Logic (Domain)
                           ↓
                      Repository Interface (abstraction)
                           ↓
                 Repository Implementation (API/LocalStorage)
                           ↓
                      External System (API/Browser Storage)
```

**Example: Login Flow**:

1. User fills `LoginForm` → Component validates with `LoginInputSchema` (DTO)
2. Component calls `useLogin()` hook (Application Layer)
3. Hook calls `validateLogin()` from `LoginLogic` (Domain Layer)
4. Hook calls `repository.login()` using `IAuthRepository` interface
5. Provider injects `ApiAuthRepository` or `LocalStorageAuthRepository`
6. Repository makes API call or reads localStorage
7. Repository returns `AuthSession` domain model
8. Hook updates state, triggers side effects
9. Component renders result

**Benefits of This Architecture**:

- **Testability**: Mock repositories at interface boundary
- **Flexibility**: Swap implementations (API ↔ localStorage) without changing business logic
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Add new features following same pattern
- **Type Safety**: Full TypeScript coverage with interfaces
- **Domain-Driven**: Business logic independent of frameworks

**Mandatory Layers**:

- **Presentation** (`components/`): UI components
- **Application** (`hooks/`): Use cases and orchestration
- **Domain** (`core/`, `models/`): Business logic and entities
- **Infrastructure** (`repositories/`): Data access implementations
- **DTO** (`dto/`): Data validation and type definitions

**Optional Layers**:

- **Providers** (`providers/`): Dependency injection (when DI needed)
- **Error Boundary** (`error.tsx`): Feature-level error handling
- **Loading UI** (`loading.tsx`): Suspense boundaries

**Layer Interaction Rules**:

1. Dependencies flow INWARD: Presentation → Application → Domain ← Infrastructure
2. Domain layer is independent (no external dependencies)
3. Infrastructure implements interfaces defined by Domain
4. Application layer orchestrates Domain and Infrastructure
5. Presentation layer only knows about Application layer (hooks)
6. NO circular dependencies between layers
7. Use Dependency Injection for Infrastructure implementations

**Rationale**: Clean Architecture with SOLID principles ensures testable, maintainable, and scalable code. The Repository pattern with dependency inversion allows swapping data sources without changing business logic, supporting both API and localStorage implementations interchangeably.

### VII. Technology Stack & Architecture Standards

#### Current Technology Stack

**Project Architecture**: **Frontend-Only Web Application** (no backend database)

**Core Framework**:
- **Next.js 15.5.4** with App Router (Turbopack for fast development)
- **React 19.1.0** (latest stable with concurrent features)
- **TypeScript 5.x** with strict mode enabled

**UI & Styling**:
- **Tailwind CSS 4.x** with PostCSS for utility-first styling
- **@tailwindcss/postcss** for Tailwind v4 integration
- **Radix UI** primitives for accessible component foundation
  - `@radix-ui/react-label ^2.1.7`
  - `@radix-ui/react-separator ^1.1.7`
  - `@radix-ui/react-slot ^1.2.3`
- **shadcn/ui** philosophy for customizable base components
- **Lucide React 0.545.0** for consistent icon system
- **class-variance-authority 0.7.1** for component variant management
- **clsx 2.1.1** + **tailwind-merge 3.3.1** for className utility (`cn()`)
- **tw-animate-css 1.4.0** for Tailwind animation utilities

**Data Management** (Frontend-Only):
- **Zod 4.1.12** for runtime validation and type inference
- **@tanstack/react-query 5.90.2** for API state management, caching, and mutations
- **Repository Pattern** for data access abstraction (API/localStorage)
- **fetch API** for HTTP requests to external APIs

**Not Used** (Explicitly Excluded):
- ❌ Backend database (PostgreSQL, MongoDB, etc.)
- ❌ ORM/Database libraries (Prisma, Drizzle, etc.)
- ❌ Server Actions (Next.js server-side mutations)
- ❌ NextAuth or auth libraries (use external auth APIs)
- ❌ Backend API routes in Next.js (all APIs are external)

#### Architectural Principles

**1. Clean Architecture with Dependency Inversion**:
- Domain layer independent of frameworks
- Infrastructure depends on domain interfaces
- Dependency Injection via React Context providers
- Repository pattern for all data access

**2. External API First**:
- All data comes from external APIs or localStorage
- API endpoints configured via environment variables
- API responses validated with Zod schemas
- Network errors handled gracefully with retries

**3. Client-Side State Management**:
- **Data Access**: Repository pattern (interfaces + implementations)
- **API State**: React Query for server state (queries, mutations, caching)
- **UI State**: React useState/useReducer in components
- **Global State**: React Context (auth status, theme, user preferences)
- **URL State**: Next.js router for navigation and query params
- **Persistence**: localStorage for non-sensitive client-side caching

**4. Performance-First Development**:
- Turbopack for sub-second hot reload in development
- Next.js automatic code splitting and tree shaking
- React 19 concurrent rendering for better UX
- React Query automatic caching and deduplication
- Server components for static shells (better initial load)

**5. Type Safety End-to-End**:
- TypeScript strict mode enforced across all code
- Zod schemas provide runtime validation + compile-time types
- No type assertion (`as`) without explicit justification
- API contracts typed via Zod inference (e.g., `z.infer<typeof schema>`)
- Repository interfaces provide type-safe data access

**6. Accessibility by Default**:
- Radix UI primitives ensure WCAG 2.1 AA compliance
- Semantic HTML enforced in component structure
- ARIA labels mandatory for interactive elements
- Keyboard navigation tested for all interactive flows

**7. Repository Error Handling Strategy**:
- **Network Errors**: Graceful degradation with retry
- **API Errors**: Custom error classes with status codes
- **Validation Errors**: Zod validation errors mapped to user-friendly messages
- **Form Errors**: Field-level + form-level error states
- **Error Boundaries**: At page level (`error.tsx`) for unexpected errors

#### Technology Decision Criteria

When adding new dependencies or patterns, evaluate against:

1. **Bundle Size Impact**: Does this add significant KB to client bundle?
2. **Type Safety**: Does this integrate well with TypeScript strict mode?
3. **Accessibility**: Does this maintain or improve WCAG 2.1 AA compliance?
4. **Performance**: Does this impact Core Web Vitals or runtime performance?
5. **Maintenance**: Is this actively maintained with good documentation?
6. **Frontend-Only Fit**: Does this work without a backend? (no database dependencies)
7. **Clean Architecture Fit**: Can this integrate with Repository pattern and DIP?

**Approval Required For**:
- New state management libraries (we use Repository pattern + React Query + Context)
- UI component libraries (we use Radix UI + custom components)
- Validation libraries (we use Zod exclusively)
- Build tools or framework changes
- Backend/database libraries (incompatible with frontend-only architecture)

**Pre-Approved Categories** (still document usage):
- Radix UI primitives (accessibility foundation)
- React Query plugins and devtools
- Zod plugins for specialized validation
- Utility libraries under 5KB gzipped
- HTTP client utilities (fetch wrappers)

#### Architecture Constraints

**Frontend-Only Constraints**:
- **No Database**: All persistent data stored externally via APIs or localStorage
- **No Server-Side Mutations**: No Server Actions, no API routes for mutations
- **Client-Side Only**: All business logic runs in browser (security implications)
- **External Auth**: Authentication handled by external APIs, tokens stored securely
- **API Dependency**: Application requires external APIs or localStorage to function

**Benefits of Frontend-Only**:
- Simpler deployment (static hosting possible with Next.js output: 'export')
- No backend infrastructure management
- Easy integration with any API (microservices, third-party, BaaS)
- Clear separation: frontend handles UI/UX, repositories abstract data access
- Faster development for UI-focused features
- Testability: mock at repository interface boundary

**Trade-offs**:
- Cannot implement custom server-side logic
- Dependent on external API availability and performance
- API keys/secrets exposed to client (use backend-for-frontend pattern if needed)
- No server-side rendering with dynamic data (static or client-side only)

**Rationale**: Explicit frontend-only architecture with Clean Architecture principles ensures all technology choices align with SOLID principles, prevents accidental backend dependencies, and provides clear boundaries for feature implementation.

## Development Standards

### Code Quality

- **Formatting**: Consistent code style via Prettier/ESLint (configuration in project root)
- **Naming**: camelCase for variables/functions, PascalCase for components/types/classes, kebab-case for files
- **File Organization**: Feature-based folder structure under `src/app/` (App Router) and `src/components/`
- **Import Order**: React/Next.js → third-party → local absolute → local relative

### Repository Pattern Best Practices

- **Interfaces First**: Define `I[Feature]Repository` interface before implementations
- **Multiple Implementations**: Support at least 2 implementations (e.g., API + localStorage)
- **Registry Pattern**: Use Registry for implementation selection
- **Dependency Injection**: Inject via React Context providers
- **Error Handling**: Throw custom errors from repositories
- **Type Safety**: Use TypeScript interfaces, not `any` types

### React Query Best Practices

- **Mutations**: Use `useMutation` for POST/PUT/DELETE operations to external APIs
- **Queries**: Use `useQuery` for GET operations from external APIs
- **Error Handling**: Custom error classes with `onError` callbacks
- **Success Handling**: `onSuccess` for side effects (localStorage, navigation)
- **Optimistic Updates**: Implement for better UX on mutations
- **Cache Management**: Configure staleTime and cacheTime per feature needs

### localStorage Guidelines

- **Security**: NEVER store sensitive data (passwords, tokens, PII)
- **Purpose**: Client-side caching for non-sensitive data only
- **Structure**: Access via Repository pattern implementations
- **Error Handling**: Wrap all localStorage access in try-catch (quota exceeded, disabled)
- **Documentation**: Comment what data is stored and why
- **Cleanup**: Implement data expiration and cleanup strategies

### API Integration Best Practices

- **Repository Pattern**: ALL API access through repository implementations
- **Error Handling**: Throw custom errors with status codes, user messages, and error codes
- **Validation**: Validate all API responses with Zod schemas in repositories
- **Timeouts**: Implement request timeouts to prevent hanging
- **Retries**: Use React Query retry logic for transient failures
- **Environment Config**: Store API base URLs in `.env.local`

### Testing Strategy

- **Unit Tests**: Required for Domain layer (core logic, Zod schemas)
- **Integration Tests**: Required for hooks and repositories (use MSW for APIs)
- **Component Tests**: Required for interactive components with user flows
- **E2E Tests**: Required for core user journeys before production deployment
- **API Mocking**: Use MSW (Mock Service Worker) for consistent API mocking
- **Repository Mocking**: Mock at interface level (`IAuthRepository`)

### Git Workflow

- **Branch Naming**: `###-feat-description`, `###-fix-description`, `###-docs-description`
- **Commits**: Conventional commits format (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)
- **Pull Requests**: Must reference spec documents, include test results, and pass all CI checks

## Quality Gates

### Before Implementation

1. Feature specification MUST be approved and documented in `.specify/specs/`
2. API contracts MUST be documented (endpoints, request/response schemas)
3. Repository interfaces MUST be defined before implementations
4. Constitution compliance MUST be verified (Clean Architecture + SOLID principles)
5. External API endpoints MUST be available and documented (if applicable)

### Before Merge

1. All tests MUST pass (unit, integration, component, and applicable E2E)
2. TypeScript MUST compile with zero errors (strict mode enabled)
3. Build MUST succeed without warnings
4. Code review MUST be completed by at least one team member
5. Performance budget MUST not be exceeded (bundle size, Lighthouse scores)
6. **Clean Architecture layers MUST be properly organized**
7. **Repository pattern MUST be used for all data access**
8. **No backend dependencies added** (database libraries, ORM, Server Actions)
9. **SOLID principles MUST be followed**

### Before Deployment

1. Production build MUST complete successfully
2. Critical user flows MUST be validated in staging environment
3. External API endpoints MUST be configured for production (if applicable)
4. Environment variables MUST be configured and validated
5. Error boundaries MUST catch and display errors gracefully
6. Repository implementations MUST handle offline scenarios

## Governance

This constitution represents the non-negotiable architectural and quality standards for the next-soild project as a **frontend-only web application using Clean Architecture with SOLID principles**. All code contributions, whether features, fixes, or refactors, MUST comply with these principles.

**Amendment Process**: Proposals for constitutional changes require:
1. Written justification with concrete examples
2. Impact analysis on existing codebase and templates
3. Team consensus (or project owner approval for solo projects)
4. Version bump following semantic versioning (see below)
5. Update of all dependent templates and documentation

**Versioning Policy**:
- **MAJOR** (e.g., 2.x.x → 3.0.0): Backward-incompatible changes (principle removal, fundamental architecture change)
- **MINOR** (e.g., 3.1.x → 3.2.0): New principles added, expanded guidance, new mandatory sections
- **PATCH** (e.g., 3.2.0 → 3.2.1): Clarifications, typo fixes, non-semantic refinements

**Compliance Review**: Every pull request MUST verify alignment with constitutional principles. Violations require explicit justification. Repeated violations without justification may result in PR rejection.

**Architecture Lock**: This project is **locked to frontend-only architecture with Clean Architecture + SOLID principles**. Any proposal to add backend database, remove Repository pattern, or violate SOLID principles requires MAJOR version bump and complete architecture review.

**Version**: 3.0.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09
