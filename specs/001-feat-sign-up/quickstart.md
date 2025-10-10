# Quickstart Guide: User Sign-Up Feature

**Feature**: User Sign-Up  
**Branch**: `001-feat-sign-up`  
**Date**: 2025-10-09

## Prerequisites

Before implementing this feature, ensure you have:

- [x] Node.js 18.x or higher installed
- [x] Next.js 15.5.4 project initialized
- [x] TypeScript 5.x configured with strict mode
- [x] Tailwind CSS 4.x configured
- [x] Radix UI primitives installed (`@radix-ui/react-label`, `@radix-ui/react-slot`)
- [x] Zod 4.1.12 installed
- [x] Project constitution read and understood (v3.0.0)

---

## Quick Overview

This feature implements user sign-up following **Clean Architecture with SOLID principles**:

- **Domain Layer**: Pure business logic (validation, models)
- **Application Layer**: React hooks orchestrating domain + infrastructure
- **Infrastructure Layer**: Repository pattern with multiple implementations (API + localStorage)
- **Presentation Layer**: React components consuming application layer

**Key Pattern**: Dependency Inversion Principle - hooks depend on `ISignupRepository` interface, not concrete implementations.

---

## Development Setup

### 1. Clone and Switch to Feature Branch

```bash
git checkout 001-feat-sign-up
```

### 2. Install Dependencies (if needed)

All required dependencies should already be in `package.json`:

```bash
npm install
# or
pnpm install
# or
yarn install
```

**Required packages** (already in project):
- `zod` (^4.1.12)
- `@radix-ui/react-label` (^2.1.7)
- `@radix-ui/react-slot` (^1.2.3)
- `class-variance-authority` (^0.7.1)
- `clsx` (^2.1.1)
- `tailwind-merge` (^3.3.1)

### 3. Environment Variables

Create or update `.env.local`:

```env
# External API endpoint for signup
NEXT_PUBLIC_API_URL=http://localhost:3001

# Or use mock API for development
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
```

**Options**:
- Set `NEXT_PUBLIC_API_URL` to your backend API base URL
- Set `NEXT_PUBLIC_USE_LOCAL_STORAGE=true` to use localStorage fallback (no API needed)

### 4. Start Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Navigate to: `http://localhost:3000/signup`

---

## Project Structure

```
src/app/signup/                     # Feature root (Next.js App Router)
├── page.tsx                        # Route entry (server component)
├── error.tsx                       # Error boundary
│
├── components/                     # PRESENTATION LAYER
│   └── SignUpForm.tsx              # Client component: form UI
│
├── hooks/                          # APPLICATION LAYER
│   └── UseSignup.ts                # Custom hook: orchestrates flow
│
├── core/                           # DOMAIN LAYER
│   └── SignupLogic.ts              # Pure functions: validation
│
├── repositories/                   # INFRASTRUCTURE LAYER
│   ├── ISignupRepository.ts        # Interface (abstraction)
│   ├── ApiSignupRepository.ts      # API implementation
│   ├── LocalStorageSignupRepository.ts  # localStorage implementation
│   └── SignupRepositoryRegistry.ts      # Registry (factory)
│
├── providers/                      # DEPENDENCY INJECTION
│   └── SignupRepositoryProvider.tsx     # React Context for DI
│
├── models/                         # DOMAIN MODELS
│   ├── User.ts                     # User entity
│   └── SignupSession.ts            # Session state
│
├── dto/                            # DATA TRANSFER OBJECTS
│   └── SignupTypes.ts              # Zod schemas + types + errors
│
└── index.ts                        # Public API (barrel export)
```

---

## Implementation Checklist

Follow this order to implement the feature:

### Phase 1: Domain Layer (Framework-Independent)

- [ ] **1.1**: Create `models/User.ts` - User entity interface
- [ ] **1.2**: Create `models/SignupSession.ts` - Session state interface
- [ ] **1.3**: Create `dto/SignupTypes.ts` - Zod schemas (SignupInputSchema, SignupOutputSchema)
- [ ] **1.4**: Add custom error classes to `dto/SignupTypes.ts` (SignupValidationError, DuplicateEmailError, SignupAPIError)
- [ ] **1.5**: Create `core/SignupLogic.ts` - Pure validation functions

**Test**: Unit tests for SignupLogic validation and Zod schemas

### Phase 2: Infrastructure Layer (Data Access)

- [ ] **2.1**: Create `repositories/ISignupRepository.ts` - Repository interface
- [ ] **2.2**: Create `repositories/ApiSignupRepository.ts` - API implementation
- [ ] **2.3**: Create `repositories/LocalStorageSignupRepository.ts` - localStorage implementation
- [ ] **2.4**: Create `repositories/SignupRepositoryRegistry.ts` - Factory to select implementation

**Test**: Integration tests with MSW for API repository

### Phase 3: Dependency Injection

- [ ] **3.1**: Create `providers/SignupRepositoryProvider.tsx` - React Context provider
- [ ] **3.2**: Add `useSignupRepository()` hook to provider file

**Test**: Verify context provides correct repository implementation

### Phase 4: Application Layer (Orchestration)

- [ ] **4.1**: Create `hooks/UseSignup.ts` - Custom hook using ISignupRepository interface
- [ ] **4.2**: Implement signup flow: validate → checkEmailExists → signup → handle errors

**Test**: Unit tests with mock repository interface

### Phase 5: Presentation Layer (UI)

- [ ] **5.1**: Create `components/SignUpForm.tsx` - Client component with form
- [ ] **5.2**: Integrate `useSignup()` hook
- [ ] **5.3**: Add form validation with Zod
- [ ] **5.4**: Add loading/error/success states
- [ ] **5.5**: Add ARIA labels and accessibility attributes
- [ ] **5.6**: Style with Tailwind + Radix UI components

**Test**: Component tests with React Testing Library

### Phase 6: Route Setup

- [ ] **6.1**: Create `app/signup/page.tsx` - Server component wrapping SignUpForm
- [ ] **6.2**: Create `app/signup/error.tsx` - Error boundary
- [ ] **6.3**: Wrap page with SignupRepositoryProvider

**Test**: E2E test for full signup flow

### Phase 7: Testing & Validation

- [ ] **7.1**: Setup MSW handlers in `tests/mocks/handlers.ts`
- [ ] **7.2**: Write unit tests for domain layer
- [ ] **7.3**: Write integration tests for repositories
- [ ] **7.4**: Write component tests for SignUpForm
- [ ] **7.5**: Write E2E test for complete signup journey
- [ ] **7.6**: Run all tests: `npm test`
- [ ] **7.7**: Verify accessibility with axe DevTools
- [ ] **7.8**: Check performance with Lighthouse (LCP < 2.5s)

---

## Running Tests

### Unit Tests (Domain Layer)

```bash
npm test src/app/signup/core/SignupLogic.test.ts
npm test src/app/signup/dto/SignupTypes.test.ts
```

### Integration Tests (Repositories)

```bash
npm test src/app/signup/repositories/ApiSignupRepository.test.ts
```

### Component Tests

```bash
npm test src/app/signup/components/SignUpForm.test.tsx
```

### E2E Tests

```bash
npm run test:e2e tests/e2e/signup-flow.test.ts
```

### All Tests

```bash
npm test
```

---

## Mock API Setup (for Development)

### Option 1: Use localStorage Implementation

Set environment variable:
```env
NEXT_PUBLIC_USE_LOCAL_STORAGE=true
```

No backend needed - data saved to browser localStorage.

### Option 2: Use MSW for Browser Mocking

Install MSW:
```bash
npm install msw --save-dev
```

Create `src/mocks/browser.ts`:
```typescript
import { setupWorker } from 'msw/browser';
import { signupHandlers } from './handlers';

export const worker = setupWorker(...signupHandlers);
```

Start MSW in development:
```typescript
// src/app/layout.tsx
if (process.env.NODE_ENV === 'development') {
  import('../mocks/browser').then(({ worker }) => worker.start());
}
```

### Option 3: Run Local Backend

Start your backend API server:
```bash
# In separate terminal
cd backend
npm run dev
```

Ensure API exposes `POST /api/signup` endpoint (see `contracts/api-signup.md` for spec).

---

## Testing the Feature Manually

### 1. Navigate to Signup Page

```
http://localhost:3000/signup
```

### 2. Test Cases

**Valid Signup**:
- Name: "John Doe"
- Email: "john@example.com"
- Expected: Success message, user created

**Validation Errors**:
- Name: "A" (too short)
- Expected: "Name must be at least 2 characters"

**Duplicate Email**:
- Email: "existing@example.com" (if already registered)
- Expected: "Email already registered" error

**Network Error**:
- Disconnect API or set invalid API URL
- Expected: Fallback to localStorage or error message

### 3. Accessibility Testing

- **Keyboard Navigation**: Tab through form, submit with Enter
- **Screen Reader**: Use NVDA/JAWS to verify labels and error announcements
- **axe DevTools**: Run accessibility audit in browser DevTools

### 4. Performance Testing

- **Lighthouse**: Run audit in Chrome DevTools
- **Target Metrics**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - Validation response < 500ms

---

## Common Issues & Troubleshooting

### Issue: "Cannot find module 'ISignupRepository'"

**Cause**: Missing repository interface file  
**Solution**: Ensure `repositories/ISignupRepository.ts` exists and is exported in `index.ts`

### Issue: "useSignupRepository must be used within SignupRepositoryProvider"

**Cause**: Component not wrapped in provider  
**Solution**: Wrap `<SignUpForm />` in `<SignupRepositoryProvider>` in `page.tsx`

### Issue: API request returns CORS error

**Cause**: Backend not configured for CORS  
**Solution**: Add CORS headers to backend or use proxy in `next.config.js`:
```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};
```

### Issue: localStorage quota exceeded

**Cause**: Too many users stored in localStorage  
**Solution**: Implement cleanup logic or limit stored users to last 100

### Issue: TypeScript errors in strict mode

**Cause**: Missing type annotations  
**Solution**: Ensure all functions have return types and all variables have explicit types

---

## API Integration

### Production API Endpoint

Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.production.example.com
NEXT_PUBLIC_USE_LOCAL_STORAGE=false
```

### API Contract Summary

See full contract in `contracts/api-signup.md`.

**Endpoint**: `POST /api/signup`

**Request**:
```json
{
  "name": "string (2-100 chars)",
  "email": "string (valid email)"
}
```

**Success Response (201)**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "createdAt": "ISO 8601 date",
  "emailVerified": false
}
```

**Error Responses**:
- `400`: Validation error
- `409`: Duplicate email
- `500`: Server error

---

## Next Steps After Implementation

1. **Code Review**: Request review from team member
2. **Constitution Compliance**: Verify all 7 principles satisfied
3. **Testing**: Ensure all tests pass (unit, integration, E2E)
4. **Documentation**: Update README with signup feature description
5. **Deployment**: Merge to main after approval
6. **Monitoring**: Set up error tracking (Sentry, LogRocket)

---

## Resources

- **Project Constitution**: `.specify/memory/constitution.md` (v3.0.0)
- **Feature Spec**: `specs/001-feat-sign-up/spec.md`
- **Implementation Plan**: `specs/001-feat-sign-up/plan.md`
- **Research Decisions**: `specs/001-feat-sign-up/research.md`
- **Data Model**: `specs/001-feat-sign-up/data-model.md`
- **API Contract**: `specs/001-feat-sign-up/contracts/api-signup.md`

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Testing
npm test                       # Run all tests
npm run test:watch             # Run tests in watch mode
npm run test:e2e               # Run E2E tests
npm run test:coverage          # Generate coverage report

# Linting & Formatting
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint errors
npm run format                 # Run Prettier

# Type Checking
npm run type-check             # Run TypeScript compiler check
```

---

## Contact & Support

For questions or issues during implementation:
- Review constitution: `.specify/memory/constitution.md`
- Check research decisions: `specs/001-feat-sign-up/research.md`
- Refer to API contract: `specs/001-feat-sign-up/contracts/api-signup.md`
- Ask in team Slack channel: `#frontend-dev`

---

**Good luck with the implementation! 🚀**
