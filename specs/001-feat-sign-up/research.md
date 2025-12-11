# Research: User Sign-Up Feature

**Feature**: User Sign-Up  
**Branch**: `001-feat-sign-up`  
**Date**: 2025-10-09

## Overview

This document consolidates research decisions for implementing the user sign-up feature following Clean Architecture with SOLID principles. All decisions align with the project constitution (v3.0.0) which mandates Repository pattern, Dependency Inversion, and frontend-only architecture.

---

## 1. Clean Architecture Implementation Strategy

### Decision: Full Clean Architecture with Repository Pattern

**Rationale**:
- Constitution mandates Clean Architecture with SOLID principles (Principle VI)
- Enables testing through repository interface mocking
- Allows swapping between API and localStorage without changing business logic
- Domain layer independence from frameworks
- Existing `login` feature follows this pattern - maintain consistency

**Implementation**:
- **Domain Layer** (`core/`, `models/`): Pure TypeScript functions and interfaces, no framework dependencies
- **Application Layer** (`hooks/`): Custom React hooks orchestrate domain logic + repositories
- **Infrastructure Layer** (`repositories/`): Data access through interfaces with multiple implementations
- **Presentation Layer** (`components/`): React components consume application layer hooks

**Alternatives Considered**:
- Simple layered architecture (services + hooks) - Rejected: violates updated constitution
- Direct API calls from hooks - Rejected: violates Dependency Inversion Principle

---

## 2. Repository Pattern Design

### Decision: Interface + Multiple Implementations + Registry

**Rationale**:
- Follows existing `IAuthRepository` pattern in `login` feature
- Enables Dependency Inversion Principle (DIP)
- Testable through interface mocking
- Flexibility to add new data sources without modifying existing code

**Repository Interface** (`ISignupRepository`):
```typescript
interface ISignupRepository {
  signup(input: SignupInput): Promise<User>;
  checkEmailExists(email: string): Promise<boolean>;
}
```

**Implementations**:
1. **ApiSignupRepository**: POST to external API endpoint
2. **LocalStorageSignupRepository**: Save to browser localStorage (fallback/offline)

**Registry Pattern**: `SignupRepositoryRegistry` selects implementation based on environment/configuration

**Alternatives Considered**:
- Single implementation only - Rejected: doesn't leverage Clean Architecture benefits
- Direct service pattern - Rejected: violates constitution's Repository pattern requirement

---

## 3. Data Validation Strategy

### Decision: Zod Schemas in Domain Layer (DTO)

**Rationale**:
- Constitution requires Zod for all external data boundaries (Principle I)
- Type inference from Zod schemas ensures type safety
- Validation rules centralized in DTOs
- Same schemas used for both client-side and repository validation

**Validation Rules**:
- **Name**: Required, 2-100 characters, trimmed
- **Email**: Required, valid RFC 5322 format, lowercase normalized, unique

**Implementation Location**: `dto/SignupTypes.ts`
```typescript
import { z } from 'zod';

export const SignupInputSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
});

export type SignupInput = z.infer<typeof SignupInputSchema>;
```

**Alternatives Considered**:
- Custom validation functions - Rejected: Zod provides better type inference
- React Hook Form built-in validation - Rejected: doesn't work with repository layer

---

## 4. Form State Management

### Decision: React useState + Zod Validation (No React Query for This Feature)

**Rationale**:
- Simple form with synchronous validation
- No need for complex caching or refetching logic
- Repository pattern handles data persistence
- Keeps form logic in presentation layer

**Flow**:
1. User types → `useState` updates form state
2. On blur/submit → Call `SignupLogic.validate()` (domain layer)
3. If valid → Call `UseSignup` hook
4. Hook calls `repository.signup()` via interface
5. Success → Show confirmation message
6. Error → Display error from repository

**Alternatives Considered**:
- React Query mutation - Rejected: overkill for simple form submission, constitution shows existing login doesn't use it
- Formik/React Hook Form - Rejected: adds dependency, simple forms don't need it

---

## 5. Error Handling Strategy

### Decision: Custom Error Classes + User-Friendly Messages

**Rationale**:
- Different error types (validation, network, duplicate email) need different handling
- User-facing errors must be actionable (constitution Principle IV)
- Repository implementations throw typed errors

**Error Types**:
```typescript
// In dto/SignupTypes.ts
export class SignupValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'SignupValidationError';
  }
}

export class SignupAPIError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'SignupAPIError';
  }
}

export class DuplicateEmailError extends Error {
  constructor(message: string = 'Email already registered') {
    super(message);
    this.name = 'DuplicateEmailError';
  }
}
```

**Error Boundary**: `error.tsx` at `/signup` route level

**Alternatives Considered**:
- Generic Error objects - Rejected: harder to handle different error types
- HTTP status codes only - Rejected: not user-friendly

---

## 6. Dependency Injection Strategy

### Decision: React Context Provider for Repository Injection

**Rationale**:
- Follows existing `AuthRepositoryProvider` pattern in `login` feature
- Enables switching implementations without changing components
- Testable by providing mock repositories in tests
- Aligns with constitution's DI requirement

**Provider Structure**:
```typescript
// providers/SignupRepositoryProvider.tsx
const SignupRepositoryContext = createContext<ISignupRepository | null>(null);

export function SignupRepositoryProvider({ 
  children, 
  type = 'api' // or 'localStorage'
}: { 
  children: ReactNode; 
  type?: 'api' | 'localStorage' 
}) {
  const repository = SignupRepositoryRegistry.getRepository(type);
  return (
    <SignupRepositoryContext.Provider value={repository}>
      {children}
    </SignupRepositoryContext.Provider>
  );
}

export function useSignupRepository() {
  const context = useContext(SignupRepositoryContext);
  if (!context) throw new Error('Must be used within SignupRepositoryProvider');
  return context;
}
```

**Usage in App**:
```typescript
// app/signup/page.tsx or app/layout.tsx
<SignupRepositoryProvider type="api">
  <SignUpForm />
</SignupRepositoryProvider>
```

**Alternatives Considered**:
- Direct instantiation in hooks - Rejected: violates DIP, hard to test
- Service locator pattern - Rejected: React Context is more idiomatic

---

## 7. Domain Model Design

### Decision: Simple TypeScript Interfaces (Not Classes)

**Rationale**:
- User entity is simple data structure (name + email)
- No complex behavior requiring methods
- Interfaces are sufficient for type safety
- Easier serialization for localStorage and API

**Domain Models** (`models/User.ts`):
```typescript
export interface User {
  id?: string;  // Optional: assigned by API
  name: string;
  email: string;
  createdAt: Date;
}

export interface SignupSession {
  inProgress: boolean;
  user?: User;
  error?: string;
}
```

**Alternatives Considered**:
- Class-based models with methods - Rejected: YAGNI (You Aren't Gonna Need It)
- Zod schemas as models - Rejected: DTOs and models serve different purposes

---

## 8. External API Integration Approach

### Decision: Fetch API with Error Handling

**Rationale**:
- Native browser API, no extra dependencies
- Constitution doesn't require axios or other HTTP clients
- Adequate for simple POST request
- Custom error mapping in repository implementation

**API Contract**:
- **Endpoint**: `POST /api/signup` (or configurable via env)
- **Request Body**: `{ name: string, email: string }`
- **Success Response** (201): `{ id: string, name: string, email: string, createdAt: string }`
- **Error Responses**:
  - 400: Validation error
  - 409: Email already exists
  - 500: Server error

**Implementation** (in `ApiSignupRepository`):
```typescript
async signup(input: SignupInput): Promise<User> {
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (response.status === 409) {
    throw new DuplicateEmailError();
  }

  if (!response.ok) {
    throw new SignupAPIError(response.status, 'Signup failed');
  }

  const data = await response.json();
  return { ...data, createdAt: new Date(data.createdAt) };
}
```

**Alternatives Considered**:
- Axios library - Rejected: fetch is sufficient
- GraphQL - Rejected: REST is simpler for single endpoint

---

## 9. localStorage Implementation Strategy

### Decision: Backup Repository with Unique Email Check

**Rationale**:
- Constitution allows localStorage for non-sensitive data
- Useful for offline scenarios or API failure fallback
- Must implement same interface as API repository

**localStorage Structure**:
```typescript
{
  "signup_users": [
    { "id": "uuid", "name": "John Doe", "email": "john@example.com", "createdAt": "2025-10-09T..." }
  ]
}
```

**Duplicate Check**: Iterate through stored users to check email uniqueness

**Security Note**: Never store passwords or tokens in localStorage (constitution Principle IV)

**Alternatives Considered**:
- IndexedDB - Rejected: overkill for simple key-value storage
- Session storage - Rejected: data lost on tab close

---

## 10. Testing Strategy

### Decision: Layer-Specific Testing with MSW for API Mocking

**Rationale**:
- Clean Architecture enables testing at each layer independently
- Domain layer: Pure function tests (no mocking needed)
- Repository layer: Mock API with MSW
- Hook layer: Mock repository interface
- E2E layer: Full user journey

**Test Structure**:
1. **Unit Tests** (`tests/unit/`):
   - `SignupLogic.test.ts`: Test validation functions
   - `SignupTypes.test.ts`: Test Zod schemas

2. **Integration Tests** (`tests/integration/`):
   - `ApiSignupRepository.test.ts`: Test with MSW handlers
   - `UseSignup.test.ts`: Test with mock repository

3. **E2E Tests** (`tests/e2e/`):
   - `signup-flow.test.ts`: Full user journey with Playwright

**MSW Handlers Example**:
```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/signup', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'existing@example.com') {
      return HttpResponse.json({ error: 'Email exists' }, { status: 409 });
    }
    return HttpResponse.json({
      id: 'uuid',
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),
];
```

**Alternatives Considered**:
- Jest mock functions for fetch - Rejected: MSW provides more realistic API simulation
- No integration tests - Rejected: constitution requires testing at layer boundaries

---

## 11. Accessibility Implementation

### Decision: Radix UI Primitives + ARIA Labels

**Rationale**:
- Constitution requires WCAG 2.1 AA compliance (Principle V)
- Radix UI provides accessible primitives out of the box
- Custom ARIA labels for form fields
- Keyboard navigation support built-in

**Requirements**:
- Form fields must have associated `<label>` elements
- Error messages must be announced to screen readers (`aria-live="polite"`)
- Submit button must be keyboard accessible
- Focus management after submission (success/error)

**Implementation**:
- Use Radix UI Label component
- `aria-describedby` for error messages
- `aria-invalid` for failed validation
- Proper focus trap on modal dialogs (if added later)

**Alternatives Considered**:
- Custom accessibility implementation - Rejected: Radix UI is battle-tested

---

## 12. Performance Optimization

### Decision: Next.js Server Components + Code Splitting

**Rationale**:
- Constitution targets < 2.5s LCP (Principle V)
- `page.tsx` as server component reduces initial JS
- Client components only where needed (SignUpForm)
- Zod validation is synchronous (< 500ms target)

**Optimization Strategies**:
1. Server component for static page shell
2. Client component (`'use client'`) only for interactive form
3. Lazy load repository implementations if needed
4. Minimize bundle size (no heavy dependencies)

**Performance Targets**:
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Validation feedback: < 500ms

**Alternatives Considered**:
- All client-side rendering - Rejected: slower initial load
- Code splitting repositories - Deferred: not needed unless bundle size is an issue

---

## Summary of Key Decisions

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| **Architecture** | Clean Architecture + SOLID | Constitution mandate, existing pattern in `login` |
| **Data Access** | Repository pattern with DIP | Testability, flexibility, constitution requirement |
| **Validation** | Zod schemas in DTOs | Type safety, centralized rules, constitution requirement |
| **Form State** | React useState | Simple enough, no React Query needed |
| **Error Handling** | Custom error classes | Type-safe, user-friendly messages |
| **Dependency Injection** | React Context providers | Follows existing pattern, testable |
| **Domain Models** | TypeScript interfaces | Simple data structures, no complex behavior |
| **API Client** | Fetch API | Native, no extra dependencies |
| **localStorage** | Backup repository | Offline support, fallback |
| **Testing** | MSW + layer-specific tests | Clean Architecture enables independent testing |
| **Accessibility** | Radix UI + ARIA | WCAG 2.1 AA compliance requirement |
| **Performance** | Server components + minimal JS | < 2.5s LCP target |

---

## Next Steps (Phase 1)

1. ✅ Research complete - all decisions documented
2. → Create `data-model.md` with entity definitions
3. → Create API contract in `contracts/api-signup.md`
4. → Create `quickstart.md` for local development setup
5. → Update agent context files with new technology decisions
