# Data Model: Password Reset Feature

**Feature**: Password Reset  
**Branch**: 003-feat-reset-password  
**Date**: 2025-10-11

## Overview

This document defines the data models, entities, and validation schemas for the password reset feature. All models follow Clean Architecture principles with framework-independent domain models and Zod schemas for runtime validation.

## Domain Models

### 1. ResetPasswordInput

**Description**: User input for password reset form

**Properties**:
- `password`: string - The new password (minimum 4 characters)
- `confirmPassword`: string - Confirmation of the new password (must match password)

**Validation Rules**:
- `password`: required, minimum 4 characters, maximum 128 characters
- `confirmPassword`: required, must match `password` field

**TypeScript Interface**:
```typescript
interface ResetPasswordInput {
  password: string;
  confirmPassword: string;
}
```

**Zod Schema** (in `dto/ResetPasswordTypes.ts`):
```typescript
export const ResetPasswordInputSchema = z.object({
  password: z.string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must not exceed 128 characters"),
  confirmPassword: z.string()
    .min(4, "Confirmation password must be at least 4 characters")
    .max(128, "Confirmation password must not exceed 128 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"] // Error shown on confirmPassword field
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;
```

---

### 2. ResetPasswordRequest

**Description**: API request payload sent to password reset endpoint

**Properties**:
- `token`: string - The password reset token extracted from URL
- `newPassword`: string - The validated new password (not confirmPassword)

**Validation Rules**:
- `token`: required, non-empty string
- `newPassword`: required, minimum 4 characters (same rules as input password)

**TypeScript Interface**:
```typescript
interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
```

**Zod Schema** (in `dto/ResetPasswordTypes.ts`):
```typescript
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must not exceed 128 characters")
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
```

**Transformation**:
```typescript
// ResetPasswordInput → ResetPasswordRequest
function toResetPasswordRequest(
  input: ResetPasswordInput, 
  token: string
): ResetPasswordRequest {
  return {
    token,
    newPassword: input.password // Only send password, not confirmPassword
  };
}
```

---

### 3. ResetPasswordResponse

**Description**: API response from password reset endpoint

**Properties**:
- `success`: boolean - Indicates if the operation succeeded
- `message`: string - Success or error message for user display

**TypeScript Interface**:
```typescript
interface ResetPasswordResponse {
  success: boolean;
  message: string;
}
```

**Zod Schema** (in `dto/ResetPasswordTypes.ts`):
```typescript
export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
```

**Example Responses**:
```typescript
// Success
{
  success: true,
  message: "Password reset successful"
}

// Error
{
  success: false,
  message: "Invalid or expired reset token"
}
```

---

### 4. ResetPasswordError

**Description**: Custom error class for password reset failures

**Properties**:
- `code`: ResetPasswordErrorCode - Machine-readable error code
- `message`: string - User-friendly error message
- `statusCode`: number - HTTP status code (optional)

**Error Codes**:
```typescript
export enum ResetPasswordErrorCode {
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_MISSING = "TOKEN_MISSING",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR"
}
```

**TypeScript Class**:
```typescript
export class ResetPasswordError extends Error {
  constructor(
    public code: ResetPasswordErrorCode,
    public message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ResetPasswordError";
  }
}
```

**Usage Examples**:
```typescript
// Token expired (401)
throw new ResetPasswordError(
  ResetPasswordErrorCode.TOKEN_EXPIRED,
  "This reset link has expired. Please request a new one.",
  401
);

// Validation error (400)
throw new ResetPasswordError(
  ResetPasswordErrorCode.VALIDATION_ERROR,
  "Password must be at least 4 characters",
  400
);

// Network error
throw new ResetPasswordError(
  ResetPasswordErrorCode.NETWORK_ERROR,
  "Unable to connect. Please check your internet connection.",
  0
);
```

---

### 5. ValidationError

**Description**: Form validation error state for UI display

**Properties**:
- `password?`: string - Error message for password field
- `confirmPassword?`: string - Error message for confirmPassword field
- `form?`: string - General form error message (e.g., token missing)

**TypeScript Interface**:
```typescript
interface ValidationError {
  password?: string;
  confirmPassword?: string;
  form?: string;
}
```

**Example States**:
```typescript
// Password too short
{
  password: "Password must be at least 4 characters"
}

// Passwords don't match
{
  confirmPassword: "Passwords do not match"
}

// Token missing from URL
{
  form: "Reset link is invalid. Please request a new password reset."
}

// Multiple errors
{
  password: "Password must be at least 4 characters",
  confirmPassword: "Passwords do not match"
}
```

---

## Entity Relationships

```
User (external system)
  └─> receives email with reset link
        └─> ResetPasswordToken (URL query param)
              └─> ResetPasswordInput (form data)
                    └─> ResetPasswordRequest (API payload)
                          └─> ResetPasswordResponse (API result)
```

**Data Flow**:
1. User clicks reset link with `token` in URL query parameter
2. Component extracts `token` using `useSearchParams()`
3. User fills form → `ResetPasswordInput` (password + confirmPassword)
4. Validation: `ResetPasswordInputSchema.parse(input)`
5. Transform: `ResetPasswordInput` + `token` → `ResetPasswordRequest`
6. API Call: Repository sends `ResetPasswordRequest` to backend
7. Response: Backend returns `ResetPasswordResponse`
8. Success: Redirect to `/login`
9. Error: Display `ResetPasswordError` message in UI

---

## State Transitions

### Form State Machine

```
Initial State: IDLE
  ├─> User types password → VALIDATING
  │     ├─> Valid → IDLE (no errors)
  │     └─> Invalid → ERROR (show validation message)
  │
  ├─> User submits form → SUBMITTING (loading state)
  │     ├─> API Success → SUCCESS (show message, redirect)
  │     └─> API Failure → ERROR (show error message)
  │
  └─> Token missing → ERROR (show token error)

State Definitions:
- IDLE: Form ready for input, no errors
- VALIDATING: Client-side validation in progress
- ERROR: Validation or API error displayed
- SUBMITTING: API request in progress (loading spinner)
- SUCCESS: Password reset successful (success message)
```

**State Implementation**:
```typescript
type FormState = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

const [formState, setFormState] = useState<FormState>('idle');
const [validationErrors, setValidationErrors] = useState<ValidationError>({});
const [successMessage, setSuccessMessage] = useState<string | null>(null);
const [errorMessage, setErrorMessage] = useState<string | null>(null);
```

---

## Validation Rules Summary

### Password Validation
- **Minimum length**: 4 characters (as specified)
- **Maximum length**: 128 characters (prevent DoS)
- **Required**: Cannot be empty
- **Trimming**: NOT trimmed (preserve user input including spaces)

### Confirm Password Validation
- **Must match**: Must exactly match `password` field
- **Same rules**: Same min/max length as password
- **Required**: Cannot be empty

### Token Validation
- **Required**: Cannot be empty or missing from URL
- **Format**: String (no format validation client-side - backend validates)
- **Source**: Extracted from URL query parameter

### API Response Validation
- **Structure**: Must match `ResetPasswordResponseSchema`
- **Success field**: Must be boolean
- **Message field**: Must be string

---

## Error Handling Strategy

### Client-Side Errors (Form Validation)
- **Display location**: Inline below each field
- **Timing**: On blur (lost focus) or on submit attempt
- **Clear condition**: When user corrects the error
- **Accessibility**: Associated with input via `aria-describedby`

### API Errors
- **Token Expired/Invalid**: Show error message with link to `/forgot-password`
- **Validation Error**: Display server validation message (fallback to client validation)
- **Network Error**: Show retry button with error message
- **Server Error**: Show generic error, log details for debugging

### Error Message Mapping
```typescript
function mapApiErrorToUserMessage(error: ResetPasswordError): string {
  switch (error.code) {
    case ResetPasswordErrorCode.TOKEN_EXPIRED:
      return "This reset link has expired. Please request a new one.";
    case ResetPasswordErrorCode.TOKEN_INVALID:
      return "This reset link is invalid. Please request a new password reset.";
    case ResetPasswordErrorCode.VALIDATION_ERROR:
      return error.message; // Use specific validation message
    case ResetPasswordErrorCode.NETWORK_ERROR:
      return "Unable to connect. Please check your internet connection and try again.";
    case ResetPasswordErrorCode.SERVER_ERROR:
      return "Something went wrong. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}
```

---

## Data Storage

### No Persistent Storage Required

This feature does **NOT** use localStorage or any client-side persistence because:
- Password reset token is transient (one-time use, expires quickly)
- Password data is sensitive (NEVER stored client-side)
- Form state is session-only (reset on page refresh is acceptable)
- No need to cache API responses (single-use operation)

### Token Source
- **Location**: URL query parameter (e.g., `?token=abc123xyz`)
- **Lifetime**: Single page session
- **Security**: HTTPS only (production), validated by backend

---

## Type Safety Checklist

- [x] All domain models have TypeScript interfaces
- [x] All external inputs validated with Zod schemas
- [x] Zod schemas provide type inference (`z.infer<typeof Schema>`)
- [x] No `any` types used
- [x] Custom error classes extend `Error`
- [x] Enum for error codes (type-safe, exhaustive)
- [x] API request/response validated at runtime
- [x] Transform functions preserve type safety

---

## Summary

The data model for password reset follows Clean Architecture principles:
- **Domain models**: Framework-independent TypeScript interfaces
- **Validation**: Zod schemas with runtime checking
- **Error handling**: Custom error classes with type-safe error codes
- **State management**: Explicit state machine with clear transitions
- **Type safety**: Full TypeScript coverage with no `any` types

All data flows through well-defined boundaries with validation at each layer, ensuring type safety and runtime correctness.
