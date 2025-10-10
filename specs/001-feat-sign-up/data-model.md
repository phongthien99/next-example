# Data Model: User Sign-Up Feature

**Feature**: User Sign-Up  
**Branch**: `001-feat-sign-up`  
**Date**: 2025-10-09

## Overview

This document defines the data models, entities, and type structures for the user sign-up feature following Clean Architecture principles. Models are defined as TypeScript interfaces in the Domain Layer, while Data Transfer Objects (DTOs) use Zod schemas for runtime validation.

---

## Domain Models (`models/`)

### User

**Purpose**: Represents a registered user entity in the system

**Location**: `src/app/signup/models/User.ts`

```typescript
export interface User {
  /**
   * Unique identifier for the user
   * - Assigned by API on successful registration
   * - Optional during signup process
   */
  id?: string;

  /**
   * User's full name
   * - Required
   * - Length: 2-100 characters
   * - Trimmed of whitespace
   */
  name: string;

  /**
   * User's email address
   * - Required
   * - Must be unique across all users
   * - Stored in lowercase
   * - Valid email format (RFC 5322)
   */
  email: string;

  /**
   * Timestamp of account creation
   * - Assigned by system on registration
   */
  createdAt: Date;

  /**
   * Email verification status
   * - Initially false on signup
   * - Updated by separate email verification flow
   */
  emailVerified?: boolean;
}
```

**Validation Rules**:
- `name`: Non-empty, 2-100 characters, trimmed
- `email`: Valid email format, unique, lowercase normalized
- `createdAt`: ISO 8601 date string from API, converted to Date object
- `emailVerified`: Boolean, defaults to false

**Relationships**: None (signup feature is isolated, authentication is separate)

---

### SignupSession

**Purpose**: Represents the state of an ongoing signup process

**Location**: `src/app/signup/models/SignupSession.ts`

```typescript
export interface SignupSession {
  /**
   * Whether signup is currently in progress (form submitted)
   */
  inProgress: boolean;

  /**
   * User data after successful signup
   */
  user?: User;

  /**
   * Error message if signup failed
   */
  error?: string;

  /**
   * Timestamp when signup was initiated
   */
  startedAt?: Date;

  /**
   * Timestamp when signup completed (success or failure)
   */
  completedAt?: Date;
}
```

**Usage**: Managed by `UseSignup` hook in Application Layer to track form submission state

---

## Data Transfer Objects (DTOs) (`dto/`)

### SignupInput

**Purpose**: Input data for signup operation, validated before processing

**Location**: `src/app/signup/dto/SignupTypes.ts`

```typescript
import { z } from 'zod';

/**
 * Zod schema for signup input validation
 */
export const SignupInputSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),
  
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address')
    .toLowerCase()
    .trim(),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type SignupInput = z.infer<typeof SignupInputSchema>;
```

**Example Valid Input**:
```typescript
{
  name: "John Doe",
  email: "john@example.com"
}
```

**Validation Errors**:
- Name too short: `"Name must be at least 2 characters"`
- Name too long: `"Name must not exceed 100 characters"`
- Invalid email: `"Please enter a valid email address"`
- Missing fields: `"Name is required"` or `"Email is required"`

---

### SignupOutput

**Purpose**: Response data from successful signup operation

**Location**: `src/app/signup/dto/SignupTypes.ts`

```typescript
import { z } from 'zod';

/**
 * Zod schema for API response validation
 */
export const SignupOutputSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(), // ISO 8601 string from API
  emailVerified: z.boolean().optional().default(false),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type SignupOutput = z.infer<typeof SignupOutputSchema>;
```

**Example API Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-10-09T14:30:00.000Z",
  "emailVerified": false
}
```

---

## Custom Error Types

**Location**: `src/app/signup/dto/SignupTypes.ts`

### SignupValidationError

```typescript
/**
 * Thrown when input validation fails
 */
export class SignupValidationError extends Error {
  constructor(
    public field: string,
    message: string,
  ) {
    super(message);
    this.name = 'SignupValidationError';
  }
}
```

**Usage**: Thrown by `SignupLogic.validate()` when Zod validation fails

---

### DuplicateEmailError

```typescript
/**
 * Thrown when email already exists in system
 */
export class DuplicateEmailError extends Error {
  constructor(public email: string) {
    super(`Email address ${email} is already registered`);
    this.name = 'DuplicateEmailError';
  }
}
```

**Usage**: Thrown by repository implementations when duplicate email detected

---

### SignupAPIError

```typescript
/**
 * Thrown when API request fails
 */
export class SignupAPIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'SignupAPIError';
  }
}
```

**Usage**: Thrown by `ApiSignupRepository` on HTTP errors

---

## Repository Interface

**Location**: `src/app/signup/repositories/ISignupRepository.ts`

```typescript
import { SignupInput } from '../dto/SignupTypes';
import { User } from '../models/User';

/**
 * Repository interface for signup operations
 * Implementations: ApiSignupRepository, LocalStorageSignupRepository
 */
export interface ISignupRepository {
  /**
   * Register a new user
   * @param input - Validated signup input
   * @returns Created user entity
   * @throws DuplicateEmailError if email already exists
   * @throws SignupAPIError if API request fails
   */
  signup(input: SignupInput): Promise<User>;

  /**
   * Check if email already exists in system
   * @param email - Email address to check
   * @returns true if email exists, false otherwise
   */
  checkEmailExists(email: string): Promise<boolean>;
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (SignUpForm)                             │
│ - User enters name and email                                │
│ - Form state: { name: string, email: string }              │
└────────────────────┬────────────────────────────────────────┘
                     │ (on submit)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER (UseSignup hook)                          │
│ - Calls SignupLogic.validate(input) → SignupInput          │
│ - Calls repository.checkEmailExists(email)                  │
│ - Calls repository.signup(input) → Promise<User>           │
└────────────────────┬────────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
            ▼                 ▼
┌──────────────────────┐  ┌──────────────────────────┐
│ DOMAIN LAYER         │  │ INFRASTRUCTURE LAYER     │
│ (SignupLogic)        │  │ (Repository)             │
│                      │  │                          │
│ validate(data)       │  │ ISignupRepository        │
│ - Zod schema check   │  │ ├─ ApiSignupRepository   │
│ - Returns            │  │ └─ LocalStorageSignup... │
│   SignupInput or     │  │                          │
│   throws error       │  │ signup(input)            │
└──────────────────────┘  │ - POST /api/signup       │
                          │ - Returns User           │
                          └──────────┬───────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │ EXTERNAL SYSTEM      │
                          │ - API Server         │
                          │ - localStorage       │
                          └──────────────────────┘
```

---

## State Transitions

### Signup Session States

```
┌─────────┐
│ Initial │ inProgress: false, user: null, error: null
└────┬────┘
     │ (user clicks "Sign Up")
     ▼
┌─────────────┐
│ In Progress │ inProgress: true, user: null, error: null
└────┬────────┘
     │
     ├─── (validation fails) ──────────────┐
     │                                      │
     │ (validation passes, API call)       │
     │                                      ▼
     ├─── (API success) ───────────┐  ┌─────────┐
     │                              │  │  Error  │ inProgress: false, error: "message"
     │                              │  └─────────┘
     ▼                              │
┌─────────┐                         │
│ Success │ inProgress: false, user: User, error: null
└─────────┘                         │
                                    │
                                    ▼
                          ┌──────────────────┐
                          │ Duplicate Email  │ inProgress: false, error: "Email exists"
                          └──────────────────┘
```

---

## Validation Rules Summary

| Field | Type | Required | Min | Max | Format | Unique |
|-------|------|----------|-----|-----|--------|--------|
| `name` | string | ✅ | 2 chars | 100 chars | Trimmed | ❌ |
| `email` | string | ✅ | N/A | N/A | RFC 5322 email | ✅ |

**Additional Rules**:
- Email is case-insensitive (normalized to lowercase)
- Whitespace is trimmed from both fields
- Empty strings after trimming are rejected
- Email uniqueness checked before allowing signup

---

## localStorage Structure (LocalStorageSignupRepository)

**Key**: `signup_users`

**Structure**:
```typescript
{
  "signup_users": [
    {
      "id": "uuid-v4",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-10-09T14:30:00.000Z",
      "emailVerified": false
    },
    // ... more users
  ]
}
```

**Operations**:
- **Create**: Append to array, check for duplicate email first
- **Read**: Parse JSON, find by email
- **Duplicate Check**: Iterate array, compare emails (case-insensitive)

**Security Note**: No sensitive data (passwords, tokens) stored in localStorage per constitution

---

## Type Exports

**Public API** (`src/app/signup/index.ts`):
```typescript
// Domain Models
export type { User, SignupSession } from './models/User';

// DTOs
export type { SignupInput, SignupOutput } from './dto/SignupTypes';
export { SignupInputSchema, SignupOutputSchema } from './dto/SignupTypes';

// Errors
export {
  SignupValidationError,
  DuplicateEmailError,
  SignupAPIError,
} from './dto/SignupTypes';

// Repository Interface
export type { ISignupRepository } from './repositories/ISignupRepository';
```

---

## Next Steps

1. ✅ Data model complete
2. → Create API contract (`contracts/api-signup.md`)
3. → Create quickstart guide (`quickstart.md`)
4. → Implement repository interfaces and DTOs in code
