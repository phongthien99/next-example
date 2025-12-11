# Research: Forgot Password Feature

**Feature**: 002-feat-forgot-password  
**Date**: 2025-10-10  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Overview

This document consolidates research findings for implementing a forgot password form following Clean Architecture with SOLID principles. Since this feature follows the same architectural pattern as the existing signup feature, most technical decisions have already been validated.

## Technical Decisions

### Decision 1: Form State Management

**Decision**: Use React `useState` hooks for form state management

**Rationale**: 
- Simple form with minimal state (email input, validation errors, submission state)
- Existing signup feature uses useState successfully
- No need for complex state management (Redux, Zustand) for single-form feature
- useState is performant for form inputs with controlled components
- Aligns with React best practices for form handling

**Alternatives Considered**:
- **React Hook Form**: Overkill for single email field, adds unnecessary dependency
- **Formik**: Similar to React Hook Form, too heavy for this use case
- **useReducer**: More complex than needed for this simple state

**Implementation Pattern**:
```typescript
const [email, setEmail] = useState('');
const [fieldError, setFieldError] = useState<string | undefined>();
const [isLoading, setIsLoading] = useState(false);
const [apiError, setApiError] = useState<string | undefined>();
const [isSuccess, setIsSuccess] = useState(false);
```

### Decision 2: Email Validation Strategy

**Decision**: Use Zod schema with real-time validation on blur

**Rationale**:
- Zod already used in project (signup feature, constitution requirement)
- Provides runtime validation + TypeScript type inference
- Consistent with project's "Type Safety First" principle
- Email validation regex built into Zod (`.email()`)
- Validation on blur provides good UX (doesn't interrupt typing)

**Alternatives Considered**:
- **Manual regex validation**: Duplicate logic, harder to maintain
- **HTML5 `type="email"` only**: Insufficient for production quality
- **Validation on change**: Too aggressive, poor UX

**Implementation Pattern**:
```typescript
// dto/ForgotPasswordTypes.ts
export const ForgotPasswordInputSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;
```

### Decision 3: API Integration Pattern

**Decision**: Repository pattern with interface abstraction (Clean Architecture)

**Rationale**:
- **Constitutional requirement**: All features must use Repository pattern
- **Testability**: Easy to mock at interface boundary
- **Flexibility**: Can swap API implementation without changing business logic
- **Consistency**: Same pattern as signup feature
- **Dependency Inversion**: Hook depends on interface, not concrete implementation

**Alternatives Considered**:
- **Direct fetch in component**: Violates Clean Architecture, poor separation of concerns
- **Custom hook without repository**: Tight coupling to API implementation

**Implementation Pattern**:
```typescript
// repositories/IForgotPasswordRepository.ts
export interface IForgotPasswordRepository {
  requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResponse>;
}

// repositories/ApiForgotPasswordRepository.ts
export class ApiForgotPasswordRepository implements IForgotPasswordRepository {
  async requestPasswordReset(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    // Handle response...
  }
}
```

### Decision 4: Error Handling Strategy

**Decision**: Three-tier error handling (validation, API, boundary)

**Rationale**:
- **Validation errors**: Zod schema catches client-side issues before submission
- **API errors**: Repository throws custom error classes for network/API failures
- **Error boundaries**: React error.tsx catches unexpected errors
- Provides comprehensive coverage for all error scenarios
- User-friendly messages at each level

**Error Types**:
1. **ForgotPasswordValidationError**: Client-side validation failures
2. **ForgotPasswordAPIError**: API request/response failures
3. **Unhandled errors**: Caught by error.tsx boundary

**Implementation Pattern**:
```typescript
// dto/ForgotPasswordTypes.ts
export class ForgotPasswordValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ForgotPasswordValidationError';
  }
}

export class ForgotPasswordAPIError extends Error {
  constructor(public statusCode: number, message: string, public details?: unknown) {
    super(message);
    this.name = 'ForgotPasswordAPIError';
  }
}
```

### Decision 5: Loading State Pattern

**Decision**: Button disable + loading indicator during submission

**Rationale**:
- Prevents duplicate form submissions
- Provides immediate visual feedback
- Meets SC-009 requirement (loading state visible within 100ms)
- Simple to implement with useState
- Accessible (button disabled state announced by screen readers)

**Implementation Pattern**:
```typescript
<Button 
  type="submit" 
  disabled={isLoading || !!fieldError}
  className="w-full"
>
  {isLoading ? 'Sending...' : 'Send Reset Link'}
</Button>
```

### Decision 6: Accessibility Implementation

**Decision**: Semantic HTML + ARIA labels + keyboard navigation

**Rationale**:
- **WCAG 2.1 AA requirement** from constitution
- Radix UI primitives provide accessible base
- Explicit ARIA labels for screen readers
- Keyboard navigation built into HTML5 form elements
- Error messages connected to inputs via `aria-describedby`

**Key Accessibility Features**:
- `<label>` for form fields with `htmlFor` attribute
- `aria-invalid` on inputs with validation errors
- `aria-describedby` linking errors to inputs
- `role="alert"` for error messages
- Keyboard navigation (tab order, enter to submit)
- Focus management (focus first input on page load)

### Decision 7: Success Message Strategy

**Decision**: Replace form with success message after submission

**Rationale**:
- Clear visual indication of success
- Prevents accidental resubmission
- Provides next-step instructions to user
- Follows security best practice (same message for all emails)
- Reduces confusion about what happens next

**Implementation Pattern**:
```typescript
{isSuccess ? (
  <Card>
    <CardContent>
      <p>Check your email for password reset instructions.</p>
      <Link href="/login">Return to login</Link>
    </CardContent>
  </Card>
) : (
  <ForgotPasswordForm />
)}
```

### Decision 8: API Endpoint Contract

**Decision**: POST /api/forgot-password with email in body

**Rationale**:
- RESTful convention for resource creation
- JSON body allows for future expansion (CAPTCHA, locale)
- Standard HTTP status codes for success/error
- Same message returned regardless of email existence (security)

**API Contract**:
```
Request:
POST /api/forgot-password
Content-Type: application/json
{ "email": "user@example.com" }

Success Response (200):
{ "success": true, "message": "If an account exists, a reset link has been sent." }

Error Response (400):
{ "success": false, "error": "Invalid email format" }

Error Response (500):
{ "success": false, "error": "Something went wrong. Please try again." }
```

## Best Practices

### Form Validation Best Practices

1. **Validate on blur, not on change**: Better UX, doesn't interrupt typing
2. **Clear errors when user corrects input**: Immediate positive feedback
3. **Disable submit when validation errors exist**: Prevent invalid submissions
4. **Show specific error messages**: "Email is required" vs "Invalid input"
5. **Use Zod's built-in validators**: Don't reinvent email regex

### Repository Pattern Best Practices

1. **Define interface first**: `IForgotPasswordRepository` before implementations
2. **Multiple implementations**: API + localStorage (even if localStorage is a no-op)
3. **Registry pattern**: Factory to select implementation
4. **Dependency injection**: React Context to provide repository to hook
5. **Error handling in repository**: Throw custom errors, don't return error objects

### Accessibility Best Practices

1. **Semantic HTML first**: Use `<form>`, `<label>`, `<input>` correctly
2. **ARIA when semantic HTML insufficient**: aria-describedby for error messages
3. **Keyboard navigation**: Ensure tab order is logical
4. **Focus management**: Focus first input on mount, focus errors on validation
5. **Screen reader testing**: Test with NVDA or VoiceOver

### Security Best Practices

1. **No email enumeration**: Same message for existing and non-existing emails
2. **Client-side validation**: Prevent malformed requests
3. **Server-side validation**: Never trust client (backend responsibility)
4. **Rate limiting**: Backend responsibility (not frontend concern)
5. **HTTPS only**: External API must use HTTPS

## Implementation Checklist

### Phase 1: Core Setup
- [ ] Create feature directory structure
- [ ] Define Zod schemas (ForgotPasswordTypes.ts)
- [ ] Create domain models (ForgotPasswordSession.ts)
- [ ] Implement validation logic (ForgotPasswordLogic.ts)

### Phase 2: Repository Layer
- [ ] Define repository interface (IForgotPasswordRepository.ts)
- [ ] Implement API repository (ApiForgotPasswordRepository.ts)
- [ ] Implement localStorage repository (LocalStorageForgotPasswordRepository.ts)
- [ ] Create registry (ForgotPasswordRepositoryRegistry.ts)
- [ ] Create provider (ForgotPasswordRepositoryProvider.tsx)

### Phase 3: Application Layer
- [ ] Implement hook (UseForgotPassword.ts)
- [ ] Handle form submission flow
- [ ] Implement error handling
- [ ] Implement loading states

### Phase 4: Presentation Layer
- [ ] Create form component (ForgotPasswordForm.tsx)
- [ ] Create page wrapper (page.tsx)
- [ ] Create error boundary (error.tsx, ForgotPasswordError.tsx)
- [ ] Create loading UI (loading.tsx, ForgotPasswordLoading.tsx)
- [ ] Add "Forgot Password" link to login page

### Phase 5: Testing & Polish
- [ ] TypeScript compilation check
- [ ] Accessibility audit (axe DevTools)
- [ ] Keyboard navigation test
- [ ] Screen reader test
- [ ] Mobile responsive test
- [ ] Loading state test (network throttling)
- [ ] Error handling test (disconnect network)

## References

- **Existing signup feature**: `/src/app/signup/` (architectural reference)
- **Constitution**: `/.specify/memory/constitution.md` (v3.2.0)
- **Zod documentation**: https://zod.dev
- **Radix UI accessibility**: https://www.radix-ui.com/primitives/docs/overview/accessibility
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Next.js App Router**: https://nextjs.org/docs/app

## Risk Mitigation

### Risk 1: External API Unavailable

**Mitigation**: 
- LocalStorage repository as fallback
- Clear error messages to user
- Retry logic in repository (3 attempts)
- Graceful degradation

### Risk 2: Email Delivery Failure

**Mitigation**:
- User sees same success message (backend responsibility)
- Clear next-step instructions
- Support contact info in success message

### Risk 3: Accessibility Violations

**Mitigation**:
- Use Radix UI primitives (accessible by default)
- Automated testing with axe DevTools
- Manual screen reader testing before merge
- Follow existing signup feature patterns

### Risk 4: Browser Compatibility

**Mitigation**:
- Use standard HTML5 form elements
- Polyfills handled by Next.js/Turbopack
- Test on iOS Safari, Chrome Android
- Progressive enhancement approach

## Conclusion

All technical decisions align with the project's constitutional principles:
- ✅ Type Safety First (Zod + TypeScript)
- ✅ Component-Driven Architecture (reusable form component)
- ✅ Frontend-Only (external API + localStorage)
- ✅ Clean Architecture with SOLID (Repository pattern + DIP)
- ✅ Accessibility (WCAG 2.1 AA compliance)

The feature reuses the proven architectural pattern from the signup feature, requiring no new dependencies and maintaining full consistency with existing code.

**Ready for Phase 1**: Data modeling and contract design.
