# Auth Repository Provider

## Dependency Injection với React Context

Thay vì sử dụng singleton `getAuthRepository()`, giờ inject repository qua React Context Provider.

## Cách sử dụng

### 1. Setup Provider (Đã setup sẵn)

```typescript
// src/app/providers.tsx
import { AuthRepositoryProvider } from './login/providers/AuthRepositoryProvider';

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthRepositoryProvider>
        {children}
      </AuthRepositoryProvider>
    </QueryClientProvider>
  );
}
```

### 2. Sử dụng trong Components/Hooks

```typescript
import { useAuthRepository } from '@/app/login';

function MyComponent() {
  const authRepo = useAuthRepository();

  const handleLogin = async () => {
    const session = await authRepo.login({ email, password });
  };
}
```

### 3. Hook wrappers (Recommended)

```typescript
import { useLogin, useLogout, useCurrentSession } from '@/app/login';

function LoginPage() {
  const { mutate: login, isPending } = useLogin();
  const { mutate: logout } = useLogout();
  const currentSession = useCurrentSession();

  // Hooks tự động inject repository từ Provider
}
```

---

## Cấu hình Repository Type

### Option 1: Environment Variable (Recommended)

```bash
# .env.local
NEXT_PUBLIC_AUTH_MODE=api          # Production
NEXT_PUBLIC_AUTH_MODE=localStorage # Development/Mock
```

Provider sẽ tự động detect và sử dụng repository phù hợp.

### Option 2: Explicit Props

```typescript
import { AuthRepositoryProvider, AuthRepositoryType } from '@/app/login';

<AuthRepositoryProvider type={AuthRepositoryType.LOCAL_STORAGE}>
  <App />
</AuthRepositoryProvider>
```

### Option 3: Custom Repository Instance

```typescript
import { AuthRepositoryProvider, ApiAuthRepository } from '@/app/login';

const customRepo = new ApiAuthRepository('https://custom-api.com');

<AuthRepositoryProvider repository={customRepo}>
  <App />
</AuthRepositoryProvider>
```

### Option 4: Runtime Switch (LocalStorage)

```typescript
// Trong browser console hoặc settings page
localStorage.setItem('auth_repository_type', 'localStorage');
window.location.reload();
```

---

## Testing

### Mock Repository cho Tests

```typescript
import { render } from '@testing-library/react';
import { AuthRepositoryProvider } from '@/app/login';

// Create mock repository
const mockAuthRepo = {
  login: jest.fn().mockResolvedValue(mockSession),
  logout: jest.fn().mockResolvedValue(undefined),
  getCurrentSession: jest.fn().mockReturnValue(null),
};

// Wrap component với mock provider
function renderWithMockAuth(component) {
  return render(
    <AuthRepositoryProvider repository={mockAuthRepo}>
      {component}
    </AuthRepositoryProvider>
  );
}

test('login flow', async () => {
  renderWithMockAuth(<LoginPage />);
  // Test với mock repository
});
```

---

## Development Setup Examples

### Example 1: Per-environment config

```typescript
// src/app/providers.tsx
'use client';

import { AuthRepositoryProvider, AuthRepositoryType } from '@/app/login';

export function Providers({ children }) {
  // Auto switch based on NODE_ENV
  const repoType = process.env.NODE_ENV === 'development'
    ? AuthRepositoryType.LOCAL_STORAGE
    : AuthRepositoryType.API;

  return (
    <AuthRepositoryProvider type={repoType}>
      {children}
    </AuthRepositoryProvider>
  );
}
```

### Example 2: Feature flag

```typescript
// src/app/providers.tsx
'use client';

const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export function Providers({ children }) {
  return (
    <AuthRepositoryProvider
      type={useMockAuth ? AuthRepositoryType.LOCAL_STORAGE : AuthRepositoryType.API}
    >
      {children}
    </AuthRepositoryProvider>
  );
}
```

### Example 3: Developer Tools Panel

```typescript
'use client';

import { useState } from 'react';
import { AuthRepositoryProvider, AuthRepositoryType } from '@/app/login';

export function Providers({ children }) {
  const [repoType, setRepoType] = useState(AuthRepositoryType.API);

  return (
    <>
      {process.env.NODE_ENV === 'development' && (
        <DevToolbar onRepoChange={setRepoType} currentType={repoType} />
      )}
      <AuthRepositoryProvider type={repoType}>
        {children}
      </AuthRepositoryProvider>
    </>
  );
}
```

---

## So sánh với Registry Pattern

### ❌ Registry Pattern (Old - Singleton)

```typescript
// Tight coupling với global singleton
const authRepo = getAuthRepository();

// Khó test - phải mock global state
// Khó control lifecycle
```

### ✅ Provider Pattern (New - Dependency Injection)

```typescript
// Loose coupling - inject qua context
const authRepo = useAuthRepository();

// Dễ test - inject mock repository
// Component không biết implementation
// Follow React best practices
```

---

## Best Practices

### ✅ DO:

1. **Luôn wrap app với `<AuthRepositoryProvider>`**
   ```typescript
   <AuthRepositoryProvider>
     <App />
   </AuthRepositoryProvider>
   ```

2. **Dùng hooks thay vì direct repository access**
   ```typescript
   const { mutate: login } = useLogin();  // ✅ Good
   const repo = useAuthRepository();      // ⚠️ Only khi cần custom logic
   ```

3. **Set type qua environment variables**
   ```bash
   NEXT_PUBLIC_AUTH_MODE=api
   ```

4. **Mock repository cho testing**
   ```typescript
   <AuthRepositoryProvider repository={mockRepo}>
   ```

### ❌ DON'T:

1. **Đừng dùng `getAuthRepository()` nữa**
   ```typescript
   const repo = getAuthRepository(); // ❌ Old way
   ```

2. **Đừng tạo repository instance manually trong component**
   ```typescript
   const repo = new ApiAuthRepository(); // ❌ Bypass DI
   ```

3. **Đừng quên wrap với Provider**
   ```typescript
   useLogin(); // ❌ Error: must be used within AuthRepositoryProvider
   ```

---

## Lợi ích

✅ **Dependency Injection** - Follow SOLID principles
✅ **Testability** - Dễ mock dependencies
✅ **Flexibility** - Switch implementation runtime
✅ **Type Safety** - TypeScript interface contract
✅ **React Idiomatic** - Follow React patterns
✅ **No Singleton** - Tránh global state issues
✅ **Scoped** - Repository lifecycle theo component tree

---

## Migration từ Registry

Nếu đang dùng `getAuthRepository()`:

```typescript
// Before ❌
import { getAuthRepository } from '@/app/login';
const repo = getAuthRepository();

// After ✅
import { useAuthRepository } from '@/app/login';
const repo = useAuthRepository();
```

**Note:** Registry pattern vẫn available để backward compatibility, nhưng Provider pattern được khuyến nghị.
