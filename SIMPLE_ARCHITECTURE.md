# Simple Clean Architecture - No DI Framework

## 📋 Overview

Project sử dụng **Clean Architecture** với **simple React Context pattern** - không cần DI framework phức tạp.

---

## 🏗️ Architecture

### Layer Structure

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  ┌───────────────────────────────┐  │
│  │ Components (LoginForm, etc.)  │  │
│  └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│     Application Layer (Hooks)       │
│  ┌───────────────────────────────┐  │
│  │ useLogin(), useLogout()       │  │
│  │ useAuthRepository()           │  │
│  └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│     Domain Layer                    │
│  ┌───────────────────────────────┐  │
│  │ Pure Logic (LoginLogic)       │  │
│  │ Models (User, AuthSession)    │  │
│  │ DTOs (LoginInput, etc.)       │  │
│  └───────────────────────────────┘  │
└────────────────┬────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│     Infrastructure Layer            │
│  ┌───────────────────────────────┐  │
│  │ Repositories                  │  │
│  │  - ApiAuthRepository          │  │
│  │  - LocalStorageAuthRepository │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/app/login/
├── context/
│   └── AuthContext.tsx           # Simple React Context Provider
│
├── hooks/
│   └── UseLogin.ts               # Business logic hooks
│
├── core/
│   └── LoginLogic.ts             # Pure functions (validation, etc.)
│
├── dto/
│   └── LoginTypes.ts             # Zod schemas & types
│
├── models/
│   ├── User.ts                   # Domain model
│   └── AuthSession.ts            # Domain model
│
├── repositories/
│   ├── IAuthRepository.ts        # Interface
│   ├── ApiAuthRepository.ts      # API implementation
│   └── LocalStorageAuthRepository.ts  # Mock implementation
│
├── components/
│   └── LoginForm.tsx             # UI component
│
└── page.tsx                      # Page with Provider
```

---

## 🔧 Implementation Details

### 1. Simple Context Provider

```typescript
// src/app/login/context/AuthContext.tsx
"use client";

import { createContext, useContext, useMemo } from 'react';
import type { IAuthRepository } from '../repositories/IAuthRepository';
import { ApiAuthRepository } from '../repositories/ApiAuthRepository';
import { LocalStorageAuthRepository } from '../repositories/LocalStorageAuthRepository';

const AuthContext = createContext<IAuthRepository | null>(null);

export function AuthProvider({ children, type }) {
  const repository = useMemo(() => {
    switch (type || 'localStorage') {
      case 'api':
        return new ApiAuthRepository();
      case 'localStorage':
      default:
        return new LocalStorageAuthRepository();
    }
  }, [type]);

  return (
    <AuthContext.Provider value={repository}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthRepository(): IAuthRepository {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthRepository must be used within AuthProvider');
  }
  return context;
}
```

### 2. Simple Repositories

```typescript
// src/app/login/repositories/ApiAuthRepository.ts
export class ApiAuthRepository implements IAuthRepository {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();
    const session = AuthSession.fromResponse(data);
    session.save();

    return session;
  }

  // ... other methods
}
```

**Key Points:**
- ✅ No decorators (@injectable, @inject)
- ✅ Simple constructor
- ✅ Plain TypeScript class

### 3. Clean Hooks

```typescript
// src/app/login/hooks/UseLogin.ts
"use client";

export function useLogin() {
  const authRepository = useAuthRepository();  // From Context

  const mutation = useMutation<AuthSession, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      const validation = validateLogin(input);
      if (!validation.success) {
        throw new Error(validation.error);
      }
      
      return await authRepository.login(validation.data);
    },
  });

  return mutation;
}
```

### 4. Page Setup

```typescript
// src/app/login/page.tsx
"use client";

export default function LoginPage() {
  return (
    <AuthProvider type="localStorage">  {/* Simple Provider */}
      <LoginForm />
    </AuthProvider>
  );
}
```

---

## 🎯 Benefits

| Aspect | Simple Context | DI Framework (TSyringe) |
|--------|----------------|-------------------------|
| **Complexity** | ✅ Low | ❌ High |
| **Learning Curve** | ✅ Easy | ⚠️ Steep |
| **Dependencies** | ✅ Zero extra | ❌ +2 packages |
| **Setup Time** | ✅ Fast | ⚠️ Slow |
| **Flexibility** | ✅ Good enough | ✅ Excellent |
| **Testability** | ✅ Easy | ✅ Easy |
| **Type Safety** | ✅ Full | ✅ Full |
| **Build Size** | ✅ Small | ⚠️ Larger |

---

## 💡 When to Use Each

### Use Simple Context When:
- ✅ Small to medium projects
- ✅ Limited team (1-5 developers)
- ✅ Want fast iteration
- ✅ Don't need advanced features
- ✅ Prefer simplicity over sophistication

### Use DI Framework When:
- ⚠️ Large enterprise projects
- ⚠️ Many shared services
- ⚠️ Complex dependency graphs
- ⚠️ Need advanced lifecycles
- ⚠️ Have DI framework expertise

---

## 📖 Usage Examples

### Example 1: Basic Usage

```typescript
// Page
<AuthProvider type="localStorage">
  <LoginForm />
</AuthProvider>

// Component
function LoginForm() {
  const { mutate: login } = useLogin();
  
  const handleSubmit = () => {
    login({ email, password });
  };
}
```

### Example 2: Testing

```typescript
describe('LoginForm', () => {
  it('should login successfully', () => {
    const mockRepository = {
      login: jest.fn().mockResolvedValue(mockSession),
    };

    render(
      <AuthProvider repository={mockRepository}>
        <LoginForm />
      </AuthProvider>
    );

    // Test...
  });
});
```

### Example 3: Multiple Features

```typescript
// Each feature has own Provider
<SignupProvider type="localStorage">
  <SignupForm />
</SignupProvider>

<PasswordResetProvider type="api">
  <ResetForm />
</PasswordResetProvider>
```

---

## 🚀 Migration Pattern (Other Features)

### Step 1: Create Context

```typescript
// src/app/{feature}/context/{Feature}Context.tsx
const {Feature}Context = createContext<I{Feature}Repository | null>(null);

export function {Feature}Provider({ children, type }) {
  const repository = useMemo(() => {
    switch (type) {
      case 'api': return new Api{Feature}Repository();
      default: return new LocalStorage{Feature}Repository();
    }
  }, [type]);

  return (
    <{Feature}Context.Provider value={repository}>
      {children}
    </{Feature}Context.Provider>
  );
}

export function use{Feature}Repository() {
  const context = useContext({Feature}Context);
  if (!context) throw new Error('Must use within Provider');
  return context;
}
```

### Step 2: Create Hooks

```typescript
// src/app/{feature}/hooks/Use{Feature}.ts
export function use{Feature}() {
  const repository = use{Feature}Repository();
  
  return useMutation({
    mutationFn: async (input) => {
      return await repository.doSomething(input);
    }
  });
}
```

### Step 3: Use in Page

```typescript
// src/app/{feature}/page.tsx
export default function {Feature}Page() {
  return (
    <{Feature}Provider type="localStorage">
      <{Feature}Form />
    </{Feature}Provider>
  );
}
```

---

## ✅ Checklist

- [x] Remove TSyringe dependencies
- [x] Remove decorators from repositories
- [x] Create simple Context Provider
- [x] Update hooks to use Context
- [x] Update page to use Provider
- [x] Test functionality

---

## 🎉 Result

Simple, clean architecture với:
- ✅ Zero DI framework complexity
- ✅ Easy to understand
- ✅ Fast to implement
- ✅ Maintainable
- ✅ Testable

**Dev server:** `pnpm dev`  
**Login page:** http://localhost:3000/login  
**Test credentials:** test@example.com / password
