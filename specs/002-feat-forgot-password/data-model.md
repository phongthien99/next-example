# Data Model: Forgot Password Feature

**Feature**: 002-feat-forgot-password  
**Date**: 2025-10-10  
**Purpose**: Define domain entities, DTOs, and validation rules

## Overview

This document defines the data structures for the forgot password feature. Since this is a frontend-only feature, the data model focuses on:
1. **Form state** (client-side)
2. **API request/response contracts** (external API integration)
3. **Validation rules** (Zod schemas)

## Domain Models

### 1. ForgotPasswordSession

**Purpose**: Represents the UI state for the forgot password form

**Location**: `src/app/forgot-password/models/ForgotPasswordSession.ts`

**Definition**:
```typescript
export interface ForgotPasswordSession {
  // Form input
  email: string;
  
  // Validation state
  fieldError?: string; // Email validation error message
  
  // Submission state
  isLoading: boolean;
  isSuccess: boolean;
  apiError?: string; // API error message (if request fails)
  
  // Metadata
  submittedAt?: Date; // Timestamp of last submission attempt
  lastAttemptEmail?: string; // Email from last attempt (for duplicate detection)
}
```

**State Transitions**:
```
Initial → Editing → Validating → Submitting → Success/Error

Initial:
  - email: ""
  - isLoading: false
  - isSuccess: false
  - no errors

Editing (user typing):
  - email: "user input"
  - fieldError: undefined (errors cleared on change)
  - isLoading: false

Validating (on blur):
  - email: "user@example.com"
  - fieldError: "Email is required" | "Please enter a valid email" | undefined
  - isLoading: false

Submitting:
  - email: "user@example.com"
  - fieldError: undefined
  - isLoading: true
  - isSuccess: false
  - apiError: undefined

Success:
  - email: "user@example.com" (or cleared)
  - isLoading: false
  - isSuccess: true
  - apiError: undefined
  - submittedAt: Date

Error:
  - email: "user@example.com"
  - isLoading: false
  - isSuccess: false
  - apiError: "Something went wrong. Please try again."
```

**Validation Rules**:
- Email required (non-empty after trim)
- Email must be valid format (Zod `.email()` validator)
- Email converted to lowercase
- Email trimmed of whitespace

## Data Transfer Objects (DTOs)

### 2. ForgotPasswordInput

**Purpose**: Validated input data for password reset request

**Location**: `src/app/forgot-password/dto/ForgotPasswordTypes.ts`

**Definition**:
```typescript
import { z } from 'zod';

export const ForgotPasswordInputSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;
```

**Example**:
```json
{
  "email": "user@example.com"
}
```

**Validation Rules**:
- `email` (required): Valid email format, trimmed, lowercase
- Min length: 1 (after trim)
- Max length: 254 (email standard RFC 5321)
- Format: `local@domain.tld`

**Error Messages**:
- Empty string: "Email is required"
- Invalid format: "Please enter a valid email address"
- Missing field: "Email is required"

### 3. ForgotPasswordResponse

**Purpose**: API response for password reset request

**Location**: `src/app/forgot-password/dto/ForgotPasswordTypes.ts`

**Definition**:
```typescript
export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;
```

**Success Example**:
```json
{
  "success": true,
  "message": "If an account exists with this email, a reset link has been sent."
}
```

**Error Example** (API validation failure):
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

**Note**: Same message returned for both registered and unregistered emails (security best practice - no email enumeration).

## Error Classes

### 4. ForgotPasswordValidationError

**Purpose**: Client-side validation errors

**Location**: `src/app/forgot-password/dto/ForgotPasswordTypes.ts`

**Definition**:
```typescript
export class ForgotPasswordValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = 'ForgotPasswordValidationError';
  }
}
```

**Usage**:
```typescript
// Thrown by ForgotPasswordLogic.validate()
throw new ForgotPasswordValidationError('email', 'Email is required');
```

**Properties**:
- `field`: Field name that failed validation ("email")
- `message`: User-friendly error message

### 5. ForgotPasswordAPIError

**Purpose**: API request/response errors

**Location**: `src/app/forgot-password/dto/ForgotPasswordTypes.ts`

**Definition**:
```typescript
export class ForgotPasswordAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ForgotPasswordAPIError';
  }
}
```

**Usage**:
```typescript
// Thrown by ApiForgotPasswordRepository
throw new ForgotPasswordAPIError(500, 'Something went wrong. Please try again.', { originalError });
```

**Properties**:
- `statusCode`: HTTP status code (400, 500, etc.)
- `message`: User-friendly error message
- `details` (optional): Additional error context (for logging)

**Status Codes**:
- `400`: Client error (invalid input - shouldn't happen if client validation works)
- `500`: Server error (API down, network failure)
- `0`: Network error (no response, offline)

## Data Flow

### Form Submission Flow

```
1. User enters email → ForgotPasswordSession.email updated

2. User blurs field → Validation triggered
   - ForgotPasswordLogic.validate(email)
   - If invalid: ForgotPasswordSession.fieldError set
   - If valid: ForgotPasswordSession.fieldError cleared

3. User submits form → Validation + API call
   - ForgotPasswordLogic.validate(email) → ForgotPasswordInput
   - ForgotPasswordSession.isLoading = true
   - Repository.requestPasswordReset(ForgotPasswordInput) → API call
   
4a. Success path:
    - ForgotPasswordResponse received
    - ForgotPasswordSession.isSuccess = true
    - ForgotPasswordSession.isLoading = false
    - Show success message
    
4b. Error path:
    - ForgotPasswordAPIError thrown
    - ForgotPasswordSession.apiError set
    - ForgotPasswordSession.isLoading = false
    - Show error message
```

### Repository Layer Data Transform

```
Input (form):              { email: "User@Example.com " }
                                    ↓ validate()
DTO (validated):           { email: "user@example.com" }
                                    ↓ repository.requestPasswordReset()
API Request Body:          { "email": "user@example.com" }
                                    ↓ POST /api/forgot-password
API Response:              { "success": true, "message": "..." }
                                    ↓ validate response
DTO (response):            { success: true, message: "..." }
                                    ↓ hook processes
UI State:                  ForgotPasswordSession.isSuccess = true
```

## Validation Rules Summary

| Field | Required | Type | Min | Max | Transform | Validation |
|-------|----------|------|-----|-----|-----------|------------|
| email | Yes | string | 1 | 254 | trim, lowercase | Zod `.email()` |

**Additional Validation**:
- Email format: `local-part@domain.tld`
- Local part: Alphanumeric + special chars (.-_+)
- Domain: Valid domain with TLD
- No leading/trailing whitespace (trimmed)
- Case-insensitive (converted to lowercase)

## Testing Data

### Valid Inputs

```typescript
const validEmails = [
  "user@example.com",
  "john.doe@company.co.uk",
  "test+tag@subdomain.example.com",
  "123@numeric.domain",
  "user@localhost.local",
];
```

### Invalid Inputs

```typescript
const invalidEmails = [
  "", // Empty
  "   ", // Whitespace only
  "notanemail", // Missing @
  "@example.com", // Missing local part
  "user@", // Missing domain
  "user @example.com", // Space in email
  "user@domain", // Missing TLD (backend may accept, Zod won't)
  "user@.com", // Missing domain name
];
```

### Edge Cases

```typescript
const edgeCases = [
  "a@b.co", // Minimal valid email
  "very.long.email.address.with.many.dots@subdomain.example.com", // Long email
  "user+tag+multiple@example.com", // Multiple + symbols
  "User@Example.COM", // Mixed case (should normalize to lowercase)
  "  user@example.com  ", // Leading/trailing spaces (should trim)
];
```

## Schema Evolution

### Future Considerations

If additional fields are needed (e.g., CAPTCHA, locale), extend the schema:

```typescript
export const ForgotPasswordInputSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  // Future fields:
  // captchaToken: z.string().optional(),
  // locale: z.enum(['en', 'vi']).optional(),
});
```

**Migration Strategy**:
- Add new fields as optional initially
- Update API contract in parallel
- Make required after backend deployment

## Conclusion

The data model is intentionally simple:
- **1 domain model**: ForgotPasswordSession (UI state)
- **2 DTOs**: ForgotPasswordInput, ForgotPasswordResponse
- **2 error classes**: ForgotPasswordValidationError, ForgotPasswordAPIError

This simplicity aligns with the feature scope: a single email input form with validation and API integration. The model provides full type safety through Zod schemas and TypeScript inference.

**Next Steps**: Define API contracts in `/contracts/forgot-password-api.md`
