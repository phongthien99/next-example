# Research: Password Reset Feature

**Feature**: Password Reset  
**Branch**: 003-feat-reset-password  
**Date**: 2025-10-11

## Purpose

Document technical decisions, research findings, and rationale for implementation choices for the password reset feature.

## Key Technical Decisions

### 1. URL Token Extraction Strategy

**Decision**: Extract reset token from URL query parameter using Next.js `useSearchParams()` hook

**Rationale**:
- Next.js 15 App Router provides `useSearchParams()` for client components
- Query parameter approach (`/reset-password?token=abc123`) is standard for password reset flows
- Easy to construct URLs in email templates
- Supports sharing/forwarding links without breaking functionality
- Client-side extraction aligns with frontend-only architecture

**Alternatives Considered**:
- Path parameter (`/reset-password/abc123`): Requires dynamic routing setup, less flexible for email templates
- Hash fragment (`/reset-password#token=abc123`): Not sent to server, harder to track in analytics
- localStorage: Not suitable - users click links from different devices/browsers

**Implementation Notes**:
- Use `'use client'` directive in component accessing `useSearchParams()`
- Handle missing token gracefully with error message
- Validate token format before API submission

### 2. Password Validation Strategy

**Decision**: Client-side validation with Zod schemas, minimum 4 characters (as specified)

**Rationale**:
- Immediate feedback improves user experience (< 100ms response)
- Zod provides type-safe validation with TypeScript inference
- Minimum 4 characters is intentionally low (likely for testing/demo purposes)
- Client-side validation reduces unnecessary API calls
- Server-side validation still required for security (handled by backend API)

**Validation Rules**:
- Password minimum length: 4 characters
- Confirm password must match new password
- Both fields required (no empty submission)
- Optional: Maximum length validation (e.g., 128 characters) to prevent DoS

**Alternatives Considered**:
- Server-side only validation: Poor UX, slow feedback
- Complex password requirements: Not specified by user, keep it simple
- Password strength meter: Out of scope for MVP

### 3. Show/Hide Password Toggle Implementation

**Decision**: Use Lucide React icons (`Eye` and `EyeOff`) with button toggle for both password fields

**Rationale**:
- Lucide React already in project dependencies (0.545.0)
- Consistent with existing UI icon system
- Accessible pattern with proper ARIA labels
- Independent toggles for each field (better UX)

**Implementation Pattern**:
```typescript
// State for each field
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// Input type switches between "password" and "text"
<input type={showPassword ? "text" : "password"} />

// Toggle button with icon
<button 
  type="button" 
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

**Accessibility Notes**:
- Button type="button" prevents form submission
- ARIA labels describe current state
- Icon change provides visual feedback

### 4. API Integration Pattern

**Decision**: Use React Query's `useMutation` with Repository pattern (ApiResetPasswordRepository)

**Rationale**:
- React Query already configured in project (@tanstack/react-query 5.90.2)
- `useMutation` designed for POST/PUT/DELETE operations
- Handles loading states, error handling, and retry logic
- Repository pattern maintains Clean Architecture (DIP)
- Easy to mock for testing (inject mock repository)

**API Contract** (to be documented in contracts/):
```typescript
// POST /api/auth/reset-password
// Request:
{
  token: string;
  newPassword: string;
}

// Response (success):
{
  success: true;
  message: "Password reset successful";
}

// Response (error):
{
  success: false;
  error: {
    code: "TOKEN_EXPIRED" | "TOKEN_INVALID" | "VALIDATION_ERROR";
    message: string;
  }
}
```

**Error Handling Strategy**:
- Network errors: Show retry option, "Check your connection"
- 400 Bad Request: Show validation error from server
- 401 Unauthorized: Token expired/invalid, redirect to forgot-password
- 500 Server Error: Generic error message, log details

### 5. Form State Management

**Decision**: React `useState` for local form state, React Query for API mutation state

**Rationale**:
- Simple form with 2 fields doesn't need complex state management
- React Query handles submission loading/error states
- No need for React Hook Form or Formik for this use case
- Keeps bundle size small

**State Structure**:
```typescript
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [validationErrors, setValidationErrors] = useState<{
  password?: string;
  confirmPassword?: string;
}>({});

const resetPasswordMutation = useMutation({
  mutationFn: (data) => repository.resetPassword(data),
  onSuccess: () => { /* redirect to login */ },
  onError: (error) => { /* show error message */ }
});
```

**Alternatives Considered**:
- React Hook Form: Overkill for 2 fields, adds 24KB to bundle
- Formik: Similar to RHF, unnecessary complexity
- Redux/Zustand: No need for global state in this feature

### 6. Success Flow & Redirect

**Decision**: Show success message for 2 seconds, then redirect to login page

**Rationale**:
- Immediate feedback confirms action success
- Auto-redirect reduces friction (user wants to log in next)
- 2-second delay allows user to read success message
- Redirect to `/login` is logical next step

**Implementation**:
```typescript
onSuccess: () => {
  setSuccessMessage("Password reset successful! Redirecting to login...");
  setTimeout(() => {
    router.push('/login');
  }, 2000);
}
```

**Alternatives Considered**:
- Manual redirect button: Extra click, worse UX
- No redirect: User left on reset page with no next action
- Instant redirect: User doesn't see success confirmation

### 7. Expired Token Handling

**Decision**: Detect expired tokens via API error response, show error message with link to forgot-password page

**Rationale**:
- Token expiration validation happens server-side (secure)
- Client receives error code "TOKEN_EXPIRED" from API
- Clear error message guides user to solution
- Direct link to forgot-password page (one click to recover)

**User Flow**:
1. User clicks expired reset link
2. User enters passwords and submits
3. API returns 401 with "TOKEN_EXPIRED" code
4. UI shows: "This reset link has expired. Please request a new one."
5. UI shows button: "Request New Reset Link" → redirects to `/forgot-password`

**Alternatives Considered**:
- Pre-validate token on page load: Extra API call, degrades performance
- Show generic error: Poor UX, user doesn't know what to do
- Email new link automatically: Can't do from frontend-only app

### 8. Accessibility (WCAG 2.1 AA Compliance)

**Decision**: Implement comprehensive accessibility features

**Requirements**:
- Semantic HTML: `<form>`, `<label>`, `<input>`, `<button>`
- ARIA labels: `aria-label`, `aria-describedby`, `aria-invalid`
- Error association: Link errors to inputs with `aria-describedby`
- Focus management: Auto-focus first field on page load, focus errors on validation
- Keyboard navigation: All interactions accessible via keyboard (Tab, Enter, Escape)
- Screen reader announcements: Live regions for dynamic errors (`aria-live="polite"`)

**Example Implementation**:
```typescript
<label htmlFor="new-password">New Password</label>
<input
  id="new-password"
  type={showPassword ? "text" : "password"}
  aria-invalid={!!validationErrors.password}
  aria-describedby={validationErrors.password ? "password-error" : undefined}
/>
{validationErrors.password && (
  <span id="password-error" role="alert" aria-live="polite">
    {validationErrors.password}
  </span>
)}
```

### 9. Testing Strategy

**Decision**: Multi-layer testing approach

**Test Coverage**:

1. **Unit Tests** (Domain Layer - ResetPasswordLogic.ts):
   - `validatePassword()`: minimum length, empty string, whitespace
   - `validatePasswordMatch()`: matching passwords, mismatched passwords
   - `validateToken()`: valid token format, empty token, malformed token

2. **Integration Tests** (Hook + Repository with MSW):
   - Successful password reset flow
   - Token expired error handling
   - Network error handling
   - Validation error handling

3. **Component Tests** (ResetPasswordForm with React Testing Library):
   - Form renders with both password fields
   - Show/hide password toggles work
   - Validation errors display correctly
   - Submit button disabled when validation fails
   - Success message displays after successful reset

4. **E2E Tests** (Playwright):
   - User enters valid passwords and resets successfully
   - User sees error when passwords don't match
   - User sees error when password is too short
   - User is redirected to login after success
   - User sees expired token message and can request new link

**Mock Strategy**:
- MSW for API mocking in integration tests
- Mock repository implementation for isolated hook testing
- Mock `useSearchParams()` for token extraction testing

### 10. Performance Optimization

**Decision**: Debounce validation, optimize re-renders, lazy load icons

**Optimizations**:
- **Debounced validation**: Wait 300ms after user stops typing before validating (reduces unnecessary validation calls)
- **Memoization**: `useMemo` for computed validation state
- **Controlled inputs**: Only re-render on state change, not on every keystroke
- **Lazy icon loading**: Icons loaded on-demand (Lucide React supports tree-shaking)

**Performance Targets**:
- Client-side validation: < 100ms
- Token extraction: < 50ms
- Form render: < 16ms (60 FPS)
- API request timeout: 10 seconds
- Page LCP: < 2.5s

**Bundle Size Impact**:
- No new dependencies added
- Estimated feature size: ~15-20KB gzipped (components + logic)
- Lucide icons: ~2KB per icon (Eye, EyeOff) with tree-shaking

## Research Summary

All technical unknowns resolved. The feature uses existing project dependencies (React Query, Zod, Radix UI, Lucide React) with standard patterns for password reset flows. Implementation follows Clean Architecture with Repository pattern for API access, ensuring testability and maintainability.

**Key Takeaways**:
- No new dependencies required (bundle size impact: minimal)
- Standard Next.js 15 App Router patterns (useSearchParams, client components)
- Accessibility built-in from the start (WCAG 2.1 AA)
- Comprehensive testing strategy across all layers
- Performance optimized for Core Web Vitals

**Ready for Phase 1**: Design (data models, contracts, quickstart)
