# File Organization Rules: Next.js Special Files vs Feature Components

**Constitution Version**: 3.1.0  
**Date**: 2025-10-10  
**Status**: Mandatory

---

## 🎯 TL;DR (Too Long; Didn't Read)

```
✅ CORRECT:
src/app/signup/
├── error.tsx                    # Next.js special file (thin wrapper)
├── loading.tsx                  # Next.js special file (thin wrapper)
└── components/
    ├── SignUpError.tsx          # Reusable component (full logic)
    └── SignUpLoading.tsx        # Reusable component (full logic)

❌ WRONG:
src/app/signup/
└── components/
    ├── error.tsx                # ❌ Next.js will NOT recognize this
    └── loading.tsx              # ❌ Next.js will NOT recognize this
```

---

## 📋 The Rule

### 1. Next.js Special Files (MUST be at route level)

These files **MUST** stay at the same level as `page.tsx`:

```
src/app/[feature]/
├── page.tsx          ✅ Route entry
├── layout.tsx        ✅ Layout (optional)
├── error.tsx         ✅ Error boundary
├── loading.tsx       ✅ Loading UI
├── not-found.tsx     ✅ 404 page
└── route.ts          ✅ API route handler
```

**Why?** Next.js framework requires these files at route level to function properly.

### 2. Feature Components (MUST be in components/ folder)

All other UI components go in `components/`:

```
src/app/[feature]/
└── components/
    ├── [Feature]Form.tsx       ✅ Main component
    ├── [Feature]Error.tsx      ✅ Reusable error UI
    ├── [Feature]Loading.tsx    ✅ Reusable loading UI
    └── [Feature]*.tsx          ✅ Other components
```

**Why?** Clean Architecture - components should be testable and reusable.

---

## 🎨 Naming Convention

### Special Files (Framework Convention)
- **Format**: lowercase, no prefix
- **Examples**: `error.tsx`, `loading.tsx`, `page.tsx`
- **Location**: Route level (alongside `page.tsx`)

### Feature Components (Clean Architecture Convention)
- **Format**: PascalCase with feature prefix
- **Examples**: `SignUpError.tsx`, `SignUpLoading.tsx`, `SignUpForm.tsx`
- **Location**: `components/` folder

---

## ✨ Best Practice: Thin Wrapper Pattern

### The Pattern

**Special File** (thin wrapper) → **Feature Component** (full implementation)

### Example: error.tsx

**error.tsx** (route level - thin wrapper):
```typescript
'use client';

import { SignUpError } from './components/SignUpError';

export default function SignupErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SignUpError error={error} reset={reset} />;
}
```

**components/SignUpError.tsx** (reusable component):
```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface SignUpErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function SignUpError({ error, reset }: SignUpErrorProps) {
  useEffect(() => {
    console.error('Signup error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Something went wrong
          </CardTitle>
          <CardDescription>
            We encountered an unexpected error while processing your signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please try again. If the problem persists, contact support.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-gray-500">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={reset} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### Example: loading.tsx

**loading.tsx** (route level - thin wrapper):
```typescript
import { SignUpLoading } from './components/SignUpLoading';

export default function SignupLoadingBoundary() {
  return <SignUpLoading />;
}
```

**components/SignUpLoading.tsx** (reusable component):
```typescript
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export function SignUpLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## ✅ Benefits of This Pattern

1. **Framework Compliance** ✅
   - Special files at route level work with Next.js

2. **Testability** ✅
   - Components in `components/` are easy to unit test

3. **Reusability** ✅
   - Can use `SignUpError` in multiple places (not just error boundary)

4. **Clean Architecture** ✅
   - Logic stays in Presentation Layer (`components/`)
   - Special files are just framework adapters

5. **Separation of Concerns** ✅
   - Framework requirements separate from business logic

---

## 🚫 Common Mistakes

### ❌ Mistake 1: Special files in components/

```typescript
// ❌ WRONG - Next.js will NOT recognize this
src/app/signup/components/error.tsx

// ✅ CORRECT
src/app/signup/error.tsx
```

### ❌ Mistake 2: Full logic in special files

```typescript
// ❌ WRONG - Hard to test and reuse
// error.tsx with 100 lines of UI logic

// ✅ CORRECT - Thin wrapper
// error.tsx (3 lines) → SignUpError.tsx (100 lines)
```

### ❌ Mistake 3: No feature prefix

```typescript
// ❌ WRONG - Name collision risk
components/Error.tsx
components/Loading.tsx

// ✅ CORRECT - Clear ownership
components/SignUpError.tsx
components/SignUpLoading.tsx
```

---

## 📐 Complete Feature Structure

```
src/app/signup/
├── page.tsx                          # ✅ Next.js route (server component)
├── error.tsx                         # ✅ Next.js error boundary (thin wrapper)
├── loading.tsx                       # ✅ Next.js loading UI (thin wrapper)
│
├── components/                       # PRESENTATION LAYER
│   ├── SignUpForm.tsx                # Main form component
│   ├── SignUpError.tsx               # Reusable error UI ⭐
│   └── SignUpLoading.tsx             # Reusable loading UI ⭐
│
├── hooks/                            # APPLICATION LAYER
│   └── UseSignup.ts
│
├── core/                             # DOMAIN LAYER
│   └── SignupLogic.ts
│
├── models/                           # DOMAIN MODELS
│   ├── User.ts
│   └── SignupSession.ts
│
├── dto/                              # DATA TRANSFER OBJECTS
│   └── SignupTypes.ts
│
├── repositories/                     # INFRASTRUCTURE LAYER
│   ├── ISignupRepository.ts
│   ├── ApiSignupRepository.ts
│   ├── LocalStorageSignupRepository.ts
│   └── SignupRepositoryRegistry.ts
│
├── providers/                        # DEPENDENCY INJECTION
│   └── SignupRepositoryProvider.tsx
│
└── index.ts                          # PUBLIC API
```

---

## 🔧 Implementation Checklist

When creating a new feature:

- [ ] Create `page.tsx` at route level
- [ ] Create `error.tsx` at route level (thin wrapper)
- [ ] Create `loading.tsx` at route level (thin wrapper)
- [ ] Create `components/[Feature]Form.tsx`
- [ ] Create `components/[Feature]Error.tsx` (full implementation)
- [ ] Create `components/[Feature]Loading.tsx` (full implementation)
- [ ] `error.tsx` delegates to `components/[Feature]Error.tsx`
- [ ] `loading.tsx` delegates to `components/[Feature]Loading.tsx`

---

## 📚 References

- **Constitution**: `.specify/memory/constitution.md` (v3.1.0)
- **Principle VI**: Clean Architecture with SOLID Principles
- **Section**: File Organization Rules

---

## 🎓 Summary

**Remember**:
1. **Special files** (`error.tsx`, `loading.tsx`) → **route level** (Next.js requirement)
2. **Feature components** (`SignUpError.tsx`, `SignUpLoading.tsx`) → **components/** (Clean Architecture)
3. **Pattern**: Thin wrapper (special file) delegates to full component (reusable)

**Naming**:
- Special files: lowercase, no prefix
- Components: PascalCase, feature prefix

**Benefits**: Framework compliance + testability + reusability + Clean Architecture

---

**Questions?** Check constitution v3.1.0, Principle VI, File Organization Rules section.
