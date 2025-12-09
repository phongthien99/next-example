# Clean Architecture - Simple Context Pattern

## 📋 Overview

Project sử dụng **Clean Architecture** với **simple React Context pattern**.

**Philosophy:** Keep it simple. No DI framework needed.

---

## 🏗️ Architecture Layers

```
┌──────────────────────────────────────────┐
│         Presentation Layer               │
│  • Components (UI)                       │
│  • Pages (routing)                       │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│       Application Layer (Hooks)          │
│  • useLogin(), useLogout()               │
│  • useAuthRepository() (from Context)    │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│          Domain Layer                    │
│  • Pure Logic (LoginLogic.ts)            │
│  • Models (User, AuthSession)            │
│  • DTOs (LoginInput, LoginResponse)      │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│      Infrastructure Layer                │
│  • Repositories (API, LocalStorage)      │
│  • External services integration         │
└──────────────────────────────────────────┘
```

---

## 📁 Feature Structure (Example: Login)

```
src/app/login/
├── context/
│   └── AuthContext.tsx           ← React Context Provider
│
├── hooks/
│   └── UseLogin.ts               ← Business logic hooks
│
├── core/
│   └── LoginLogic.ts             ← Pure functions
│
├── dto/
│   └── LoginTypes.ts             ← Zod schemas
│
├── models/
│   ├── User.ts                   ← Domain models
│   └── AuthSession.ts
│
├── repositories/
│   ├── IAuthRepository.ts        ← Interface
│   ├── ApiAuthRepository.ts      ← Implementation
│   └── LocalStorageAuthRepository.ts
│
├── components/
│   └── LoginForm.tsx             ← UI
│
├── page.tsx                      ← Page with Provider
└── index.ts                      ← Public exports
```

---

## 🔧 Implementation Pattern

### 1. Context Provider (Infrastructure)

```typescript
// context/AuthContext.tsx
"use client";

const AuthContext = createContext<IAuthRepository | null>(null);

export function AuthProvider({ children, type = 'localStorage' }) {
  const repository = useMemo(() => {
    return type === 'api' 
      ? new ApiAuthRepository() 
      : new LocalStorageAuthRepository();
  }, [type]);

  return (
    <AuthContext.Provider value={repository}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthRepository() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('Must use within AuthProvider');
  return context;
}
```

### 2. Repository (Infrastructure)

```typescript
// repositories/ApiAuthRepository.ts
export class ApiAuthRepository implements IAuthRepository {
  constructor(private baseUrl = '/api/auth') {}

  async login(input: LoginInput): Promise<AuthSession> {
    const res = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    
    if (!res.ok) throw new Error('Invalid credentials');
    
    const data = await res.json();
    return AuthSession.fromResponse(data);
  }
}
```

### 3. Hooks (Application Layer)

```typescript
// hooks/UseLogin.ts
export function useLogin() {
  const authRepository = useAuthRepository();

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      // Validate with pure function
      const validation = validateLogin(input);
      if (!validation.success) throw new Error(validation.error);
      
      // Use repository
      return await authRepository.login(validation.data);
    },
  });
}
```

### 4. Pure Logic (Domain Layer)

```typescript
// core/LoginLogic.ts
export function validateLogin(input: unknown) {
  try {
    const data = LoginInputSchema.parse(input);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 5. Page Setup (Presentation)

```typescript
// page.tsx
export default function LoginPage() {
  return (
    <AuthProvider type="localStorage">
      <LoginForm />
    </AuthProvider>
  );
}
```

---

## 🎯 Key Principles

### ✅ Dependency Rule
**Inner layers don't depend on outer layers**

```
Domain (core, models, dto)
  ↑ no imports from outer layers
Application (hooks)
  ↑ can import from Domain
Infrastructure (repositories)
  ↑ can import from Domain
Presentation (components, pages)
  ↑ can import from all layers
```

### ✅ Interface Segregation

```typescript
// Define interface (Domain)
export interface IAuthRepository {
  login(input: LoginInput): Promise<AuthSession>;
  logout(): Promise<void>;
}

// Multiple implementations (Infrastructure)
class ApiAuthRepository implements IAuthRepository { }
class LocalStorageAuthRepository implements IAuthRepository { }
```

### ✅ Dependency Injection

```typescript
// Via React Context - simple & effective
<AuthProvider type="api">
  <App />
</AuthProvider>
```

---

## 🧪 Testing Strategy

### Unit Tests (Pure Logic)

```typescript
describe('validateLogin', () => {
  it('should validate correct input', () => {
    const result = validateLogin({
      email: 'test@example.com',
      password: '123456'
    });
    
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests (Hooks)

```typescript
describe('useLogin', () => {
  it('should login successfully', async () => {
    const mockRepo = {
      login: jest.fn().mockResolvedValue(mockSession),
    };

    const wrapper = ({ children }) => (
      <AuthProvider repository={mockRepo}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => useLogin(), { wrapper });
    
    // Test...
  });
});
```

---

## 🚀 Benefits

| Aspect | Benefit |
|--------|---------|
| **Simplicity** | No DI framework complexity |
| **Testability** | Easy to mock via Context |
| **Maintainability** | Clear separation of concerns |
| **Scalability** | Add features without conflicts |
| **Type Safety** | Full TypeScript support |
| **Performance** | No extra dependencies |

---

## 📦 Feature Isolation

Mỗi feature tự contained:

```
src/app/
├── login/          ← Isolated feature
│   ├── context/
│   ├── hooks/
│   ├── repositories/
│   └── ...
│
├── signup/         ← Independent feature
│   ├── context/
│   ├── hooks/
│   └── ...
│
└── forgot-password/
    └── ...
```

**No cross-feature dependencies!**

---

## 🎓 Adding New Features

### Template:

1. **Create Context Provider**
   ```typescript
   // context/{Feature}Context.tsx
   export function {Feature}Provider({ children })
   export function use{Feature}Repository()
   ```

2. **Create Repository**
   ```typescript
   // repositories/I{Feature}Repository.ts
   export interface I{Feature}Repository { }
   
   // repositories/Api{Feature}Repository.ts
   export class Api{Feature}Repository implements I{Feature}Repository { }
   ```

3. **Create Hooks**
   ```typescript
   // hooks/Use{Feature}.ts
   export function use{Feature}() {
     const repo = use{Feature}Repository();
     // business logic
   }
   ```

4. **Wrap Page**
   ```typescript
   // page.tsx
   <{Feature}Provider>
     <{Feature}Form />
   </{Feature}Provider>
   ```

---

## ✅ Current Status

- ✅ Login feature implemented
- ✅ Clean Architecture maintained
- ✅ Simple Context pattern
- ✅ Zero DI framework dependencies
- ✅ Fully testable
- ✅ Type-safe

---

## 📚 Resources

- **File:** `SIMPLE_ARCHITECTURE.md` - Detailed guide
- **Example:** `src/app/login/` - Reference implementation
- **Dev server:** `pnpm dev`
- **Login page:** http://localhost:3000/login

**Test credentials:** test@example.com / password
