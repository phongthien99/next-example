# Quickstart: Password Reset Feature

**Feature**: Password Reset  
**Branch**: 003-feat-reset-password  
**Date**: 2025-10-11

## Overview

Quick reference guide for developers implementing the password reset feature. This feature allows users to reset their password using a token received via email.

---

## Prerequisites

- Node.js 18+ installed
- pnpm package manager (required by project)
- Existing dependencies already installed (React Query, Zod, Radix UI)
- External API endpoint for password reset (see API Contract)

---

## Project Structure

```
src/app/reset-password/
├── page.tsx                              # Route entry (server component wrapper)
├── components/
│   └── ResetPasswordForm.tsx             # Client component: form UI
├── hooks/
│   └── UseResetPassword.ts               # Application layer: business orchestration
├── core/
│   └── ResetPasswordLogic.ts             # Domain layer: validation logic
├── repositories/
│   ├── IResetPasswordRepository.ts       # Interface (abstraction)
│   ├── ApiResetPasswordRepository.ts     # API implementation
│   └── ResetPasswordRepositoryRegistry.ts # Factory for implementations
├── providers/
│   └── ResetPasswordRepositoryProvider.tsx # Dependency injection
├── dto/
│   └── ResetPasswordTypes.ts             # Zod schemas + types
└── index.ts                              # Public API exports
```

---

## Quick Start Steps

### 1. Set Up Environment Variables

Create or update `.env.local`:

```bash
# Password Reset API endpoint
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**Production**:
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

---

### 2. Implement Data Models (DTO Layer)

**File**: `src/app/reset-password/dto/ResetPasswordTypes.ts`

```typescript
import { z } from 'zod';

// Form input schema
export const ResetPasswordInputSchema = z.object({
  password: z.string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must not exceed 128 characters"),
  confirmPassword: z.string()
    .min(4, "Confirmation password must be at least 4 characters")
    .max(128, "Confirmation password must not exceed 128 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

// API request schema
export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string()
    .min(4, "Password must be at least 4 characters")
    .max(128, "Password must not exceed 128 characters")
});

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

// API response schema
export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

// Error codes
export enum ResetPasswordErrorCode {
  TOKEN_INVALID = "TOKEN_INVALID",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  TOKEN_MISSING = "TOKEN_MISSING",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  SERVER_ERROR = "SERVER_ERROR"
}

// Custom error class
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

---

### 3. Implement Domain Logic (Core Layer)

**File**: `src/app/reset-password/core/ResetPasswordLogic.ts`

```typescript
import { ResetPasswordInput, ResetPasswordInputSchema } from '../dto/ResetPasswordTypes';

/**
 * Validates password reset input
 * Pure function - no side effects
 */
export function validateResetPasswordInput(input: ResetPasswordInput): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  try {
    ResetPasswordInputSchema.parse(input);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { form: "Validation failed" } };
  }
}

/**
 * Validates token format (basic check)
 */
export function validateToken(token: string | null): boolean {
  return token !== null && token.trim().length > 0;
}

/**
 * Transforms form input to API request payload
 */
export function toResetPasswordRequest(
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

### 4. Implement Repository (Infrastructure Layer)

**File**: `src/app/reset-password/repositories/IResetPasswordRepository.ts`

```typescript
import { ResetPasswordRequest, ResetPasswordResponse } from '../dto/ResetPasswordTypes';

/**
 * Repository interface for password reset operations
 * Dependency Inversion Principle: hooks depend on this interface
 */
export interface IResetPasswordRepository {
  resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}
```

**File**: `src/app/reset-password/repositories/ApiResetPasswordRepository.ts`

```typescript
import { 
  IResetPasswordRepository, 
  ResetPasswordRequest, 
  ResetPasswordResponse,
  ResetPasswordResponseSchema,
  ResetPasswordError,
  ResetPasswordErrorCode
} from '../dto/ResetPasswordTypes';

export class ApiResetPasswordRepository implements IResetPasswordRepository {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_BASE_URL!) {
    if (!baseUrl) {
      throw new Error('API base URL is not configured');
    }
    this.baseUrl = baseUrl;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new ResetPasswordError(
          this.mapStatusToErrorCode(response.status),
          errorData.message || 'Password reset failed',
          response.status
        );
      }

      const data = await response.json();
      return ResetPasswordResponseSchema.parse(data);
    } catch (error) {
      if (error instanceof ResetPasswordError) {
        throw error;
      }
      // Network error
      throw new ResetPasswordError(
        ResetPasswordErrorCode.NETWORK_ERROR,
        'Unable to connect. Please check your internet connection.',
        0
      );
    }
  }

  private mapStatusToErrorCode(status: number): ResetPasswordErrorCode {
    switch (status) {
      case 400: return ResetPasswordErrorCode.VALIDATION_ERROR;
      case 401: return ResetPasswordErrorCode.TOKEN_INVALID;
      case 409: return ResetPasswordErrorCode.TOKEN_INVALID;
      case 500: return ResetPasswordErrorCode.SERVER_ERROR;
      default: return ResetPasswordErrorCode.SERVER_ERROR;
    }
  }
}
```

**File**: `src/app/reset-password/repositories/ResetPasswordRepositoryRegistry.ts`

```typescript
import { IResetPasswordRepository } from './IResetPasswordRepository';
import { ApiResetPasswordRepository } from './ApiResetPasswordRepository';

export class ResetPasswordRepositoryRegistry {
  static getRepository(type: 'api' = 'api'): IResetPasswordRepository {
    switch (type) {
      case 'api':
        return new ApiResetPasswordRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
```

---

### 5. Implement Dependency Injection (Provider)

**File**: `src/app/reset-password/providers/ResetPasswordRepositoryProvider.tsx`

```typescript
'use client';

import React, { createContext, useContext } from 'react';
import { IResetPasswordRepository } from '../repositories/IResetPasswordRepository';
import { ResetPasswordRepositoryRegistry } from '../repositories/ResetPasswordRepositoryRegistry';

const ResetPasswordRepositoryContext = createContext<IResetPasswordRepository | null>(null);

export function ResetPasswordRepositoryProvider({
  children,
  type = 'api'
}: {
  children: React.ReactNode;
  type?: 'api';
}) {
  const repository = ResetPasswordRepositoryRegistry.getRepository(type);

  return (
    <ResetPasswordRepositoryContext.Provider value={repository}>
      {children}
    </ResetPasswordRepositoryContext.Provider>
  );
}

export function useResetPasswordRepository(): IResetPasswordRepository {
  const context = useContext(ResetPasswordRepositoryContext);
  if (!context) {
    throw new Error('useResetPasswordRepository must be used within ResetPasswordRepositoryProvider');
  }
  return context;
}
```

---

### 6. Implement Business Logic Hook (Application Layer)

**File**: `src/app/reset-password/hooks/UseResetPassword.ts`

```typescript
'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useResetPasswordRepository } from '../providers/ResetPasswordRepositoryProvider';
import { 
  ResetPasswordInput, 
  ResetPasswordError,
  ResetPasswordErrorCode 
} from '../dto/ResetPasswordTypes';
import { 
  validateResetPasswordInput, 
  toResetPasswordRequest 
} from '../core/ResetPasswordLogic';

export function useResetPassword(token: string | null) {
  const router = useRouter();
  const repository = useResetPasswordRepository();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      // Validate input
      const validation = validateResetPasswordInput(input);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error('Validation failed');
      }

      // Check token
      if (!token) {
        throw new ResetPasswordError(
          ResetPasswordErrorCode.TOKEN_MISSING,
          'Reset token is missing',
          0
        );
      }

      // Transform and submit
      const request = toResetPasswordRequest(input, token);
      return repository.resetPassword(request);
    },
    onSuccess: (response) => {
      setValidationErrors({});
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (error) => {
      if (error instanceof ResetPasswordError) {
        // Handle specific error codes
        if (error.code === ResetPasswordErrorCode.TOKEN_EXPIRED ||
            error.code === ResetPasswordErrorCode.TOKEN_INVALID) {
          // Can redirect to forgot-password or show error
        }
      }
    }
  });

  return {
    submitReset: mutation.mutate,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    validationErrors,
    clearValidationErrors: () => setValidationErrors({})
  };
}
```

---

### 7. Implement UI Component (Presentation Layer)

**File**: `src/app/reset-password/components/ResetPasswordForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '../hooks/UseResetPassword';
import { ResetPasswordError, ResetPasswordErrorCode } from '../dto/ResetPasswordTypes';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    submitReset,
    isLoading,
    isSuccess,
    error,
    validationErrors
  } = useResetPassword(token);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReset({ password, confirmPassword });
  };

  if (!token) {
    return (
      <div className="error">
        <p>Reset link is invalid. Please request a new password reset.</p>
        <a href="/forgot-password">Request New Reset Link</a>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="success">
        <p>Password reset successful! Redirecting to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="password">New Password</label>
        <div className="password-input">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!validationErrors.password}
            aria-describedby={validationErrors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {validationErrors.password && (
          <span id="password-error" role="alert">
            {validationErrors.password}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="confirm-password">Confirm Password</label>
        <div className="password-input">
          <input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!validationErrors.confirmPassword}
            aria-describedby={validationErrors.confirmPassword ? 'confirm-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <span id="confirm-error" role="alert">
            {validationErrors.confirmPassword}
          </span>
        )}
      </div>

      {error && error instanceof ResetPasswordError && (
        <div role="alert">
          {error.message}
          {(error.code === ResetPasswordErrorCode.TOKEN_EXPIRED ||
            error.code === ResetPasswordErrorCode.TOKEN_INVALID) && (
            <a href="/forgot-password">Request New Reset Link</a>
          )}
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}
```

---

### 8. Create Page Entry Point

**File**: `src/app/reset-password/page.tsx`

```typescript
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import { ResetPasswordRepositoryProvider } from './providers/ResetPasswordRepositoryProvider';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <ResetPasswordRepositoryProvider>
      <div>
        <h1>Reset Your Password</h1>
        <ResetPasswordForm token={token} />
      </div>
    </ResetPasswordRepositoryProvider>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
```

---

## Testing

### Unit Tests (Domain Layer)

```typescript
// src/app/reset-password/core/ResetPasswordLogic.test.ts
import { describe, it, expect } from 'vitest';
import { validateResetPasswordInput, validateToken } from './ResetPasswordLogic';

describe('ResetPasswordLogic', () => {
  describe('validateResetPasswordInput', () => {
    it('should validate correct input', () => {
      const result = validateResetPasswordInput({
        password: 'test1234',
        confirmPassword: 'test1234'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject password under 4 characters', () => {
      const result = validateResetPasswordInput({
        password: 'abc',
        confirmPassword: 'abc'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toBeDefined();
    });

    it('should reject mismatched passwords', () => {
      const result = validateResetPasswordInput({
        password: 'test1234',
        confirmPassword: 'different'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.confirmPassword).toBeDefined();
    });
  });
});
```

### Integration Tests (Hook + Repository with MSW)

```typescript
// src/app/reset-password/hooks/UseResetPassword.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { useResetPassword } from './UseResetPassword';

const server = setupServer(
  rest.post('/api/auth/reset-password', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, message: 'Password reset successful' })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('useResetPassword', () => {
  it('should successfully reset password', async () => {
    const { result } = renderHook(() => useResetPassword('valid-token'));

    result.current.submitReset({
      password: 'newPassword123',
      confirmPassword: 'newPassword123'
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
```

---

## Common Issues & Solutions

### Issue 1: "API base URL is not configured"

**Solution**: Add `NEXT_PUBLIC_API_BASE_URL` to `.env.local`

### Issue 2: CORS errors

**Solution**: Configure backend API to allow frontend origin

### Issue 3: Token not extracted from URL

**Solution**: Ensure page component uses `'use client'` and `useSearchParams()` wrapped in `<Suspense>`

### Issue 4: Validation not working

**Solution**: Check Zod schema definitions in `dto/ResetPasswordTypes.ts`

---

## Next Steps

1. Style components with Tailwind CSS
2. Add loading animations
3. Implement E2E tests with Playwright
4. Configure production API endpoint
5. Add analytics tracking

---

## Related Documentation

- [Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contract](./contracts/reset-password-api.md)
- [Research Notes](./research.md)

---

## Summary

This quickstart provides complete code examples for implementing the password reset feature following Clean Architecture principles. All layers are clearly separated with proper dependency inversion, making the code testable and maintainable.
