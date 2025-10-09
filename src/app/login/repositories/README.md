# Auth Repository Pattern

## Tổng quan

Repository Pattern cho phép switch giữa các nguồn dữ liệu khác nhau (API, LocalStorage, Mock) mà không cần thay đổi business logic.

## Cách sử dụng

### 1. Sử dụng mặc định (tự động)

```typescript
import { useLogin } from '@/app/login';

function LoginPage() {
  const { mutate: login } = useLogin();
  
  // Tự động sử dụng repository được config
  login({ email: 'user@example.com', password: '123456' });
}
```

### 2. Switch repository type

#### Option A: Environment Variable

```bash
# .env.local
NEXT_PUBLIC_AUTH_MODE=localStorage  # or 'api'
```

#### Option B: Runtime switching

```typescript
import { AuthRepositoryRegistry, AuthRepositoryType } from '@/app/login';

// Switch sang LocalStorage mode (useful cho development/testing)
AuthRepositoryRegistry.getInstance().setActiveType(AuthRepositoryType.LOCAL_STORAGE);

// Switch về API mode
AuthRepositoryRegistry.getInstance().setActiveType(AuthRepositoryType.API);
```

#### Option C: LocalStorage config

```javascript
// Trong browser console hoặc code
localStorage.setItem('auth_repository_type', 'localStorage');
// Refresh page để apply
```

### 3. Sử dụng repository trực tiếp

```typescript
import { getAuthRepository } from '@/app/login';

const authRepo = getAuthRepository();

// Login
const session = await authRepo.login({ email, password });

// Logout
await authRepo.logout();

// Get current session
const currentSession = authRepo.getCurrentSession();

// Refresh token (nếu repository hỗ trợ)
if (authRepo.refreshToken) {
  const newSession = await authRepo.refreshToken(refreshToken);
}
```

### 4. Custom Repository

```typescript
import { IAuthRepository, AuthRepositoryRegistry, AuthRepositoryType } from '@/app/login';

// 1. Implement interface
class CustomAuthRepository implements IAuthRepository {
  async login(input: LoginInput): Promise<AuthSession> {
    // Custom implementation
  }
  
  async logout(): Promise<void> {
    // Custom implementation
  }
  
  getCurrentSession(): AuthSession | null {
    // Custom implementation
  }
}

// 2. Register custom repository
const registry = AuthRepositoryRegistry.getInstance();
registry.register('custom' as AuthRepositoryType, new CustomAuthRepository());
registry.setActiveType('custom' as AuthRepositoryType);
```

## Repository Types

### 1. ApiAuthRepository

- Gọi API endpoints thật
- Lưu session vào localStorage
- Production mode

**Mock users:**
```
Email: admin@example.com / Password: 123456
Email: test@example.com / Password: password
```

### 2. LocalStorageAuthRepository

- Không cần backend
- Mock data trong localStorage
- Development/Testing mode
- Simulate network delay

## Ví dụ thực tế

### Development với Mock Data

```typescript
// src/app/layout.tsx hoặc providers
'use client';

import { useEffect } from 'react';
import { AuthRepositoryRegistry, AuthRepositoryType } from '@/app/login';

export function Providers({ children }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Switch sang localStorage mode cho dev
      AuthRepositoryRegistry.getInstance()
        .setActiveType(AuthRepositoryType.LOCAL_STORAGE);
    }
  }, []);
  
  return <>{children}</>;
}
```

### Testing

```typescript
// tests/login.test.ts
import { AuthRepositoryRegistry, AuthRepositoryType } from '@/app/login';

beforeEach(() => {
  // Use mock repository for tests
  AuthRepositoryRegistry.getInstance()
    .setActiveType(AuthRepositoryType.LOCAL_STORAGE);
});

test('should login successfully', async () => {
  const { result } = renderHook(() => useLogin());
  
  await act(async () => {
    result.current.mutate({
      email: 'admin@example.com',
      password: '123456'
    });
  });
  
  expect(result.current.isSuccess).toBe(true);
});
```

### Debug Panel

```typescript
'use client';

import { AuthRepositoryRegistry, AuthRepositoryType } from '@/app/login';

export function DebugPanel() {
  const registry = AuthRepositoryRegistry.getInstance();
  const [currentType, setCurrentType] = useState(registry.getActiveType());
  
  const handleSwitch = (type: AuthRepositoryType) => {
    registry.setActiveType(type);
    setCurrentType(type);
    window.location.reload(); // Reload để apply
  };
  
  return (
    <div>
      <h3>Auth Mode: {currentType}</h3>
      <button onClick={() => handleSwitch(AuthRepositoryType.API)}>
        API Mode
      </button>
      <button onClick={() => handleSwitch(AuthRepositoryType.LOCAL_STORAGE)}>
        Mock Mode
      </button>
    </div>
  );
}
```

## Best Practices

1. **Production:** Luôn dùng `AuthRepositoryType.API`
2. **Development:** Dùng `AuthRepositoryType.LOCAL_STORAGE` khi backend chưa ready
3. **Testing:** Luôn dùng mock repository
4. **Environment Variables:** Set default qua `.env` files
5. **Type Safety:** Luôn implement `IAuthRepository` interface

## Lợi ích

✅ **Flexible:** Switch data source dễ dàng  
✅ **Testable:** Mock data cho unit tests  
✅ **Maintainable:** Thay đổi implementation không ảnh hưởng business logic  
✅ **Scalable:** Dễ thêm repository mới (Firebase, Supabase, etc.)  
✅ **Type-safe:** TypeScript interface đảm bảo contract
