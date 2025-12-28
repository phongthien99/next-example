# Auth Repository Pattern

## Overview

The Repository Pattern allows switching between different data sources (API, LocalStorage, Supabase) without changing business logic. This implementation uses the Registry Pattern with static factory methods for repository selection.

## Available Repository Types

### 1. ApiAuthRepository
- Calls real API endpoints
- Stores session in localStorage
- Production mode
- Endpoint: `/api/auth`

### 2. LocalStorageAuthRepository
- No backend required
- Mock data in localStorage
- Development/Testing mode
- Simulates network delay (500ms login, 300ms logout)

**Mock users:**
```
Email: admin@example.com / Password: 123456
Email: test@example.com / Password: password
```

### 3. SupabaseAuthRepository (NEW)
- Supabase Authentication integration
- Real authentication backend
- Automatic token refresh
- Session persistence via Supabase + localStorage
- Requires Supabase credentials

## Usage

### 1. Basic Usage (Automatic)

The simplest way to use authentication is through the hooks. The repository is selected automatically based on your configuration:

```typescript
import { useLogin } from '@/app/login';

function LoginPage() {
  const { mutate: login } = useLogin();

  // Automatically uses configured repository
  login({ email: 'user@example.com', password: '123456' });
}
```

### 2. Selecting Repository Type

#### Option A: Environment Variable (Recommended)

```bash
# .env.local
NEXT_PUBLIC_AUTH_REPO_TYPE=supabase  # or 'api' | 'localStorage'
```

**Priority order:**
1. Environment variable: `NEXT_PUBLIC_AUTH_REPO_TYPE`
2. Browser localStorage: `auth_repository_type`
3. Default: `localStorage` (development) or `api` (production)

#### Option B: Via AuthProvider Props

```typescript
import { AuthProvider } from '@/app/login';

function App() {
  return (
    <AuthProvider type="supabase">
      <LoginForm />
    </AuthProvider>
  );
}
```

#### Option C: Runtime Switching (Browser Console)

```javascript
// In browser console or code
localStorage.setItem('auth_repository_type', 'supabase');
// Refresh page to apply
```

### 3. Using Repository Directly

```typescript
import { AuthRepositoryRegistry } from '@/app/login';

// Get repository instance
const authRepo = AuthRepositoryRegistry.getRepository('supabase');

// Login
const session = await authRepo.login({ email, password });

// Logout
await authRepo.logout();

// Get current session
const currentSession = authRepo.getCurrentSession();

// Refresh token (if repository supports)
if (authRepo.refreshToken) {
  const newSession = await authRepo.refreshToken(refreshToken);
}
```

### 4. Using Hooks (Recommended)

```typescript
import { useLogin, useLogout, useCurrentSession } from '@/app/login';

function MyComponent() {
  // Login mutation
  const { mutate: login, isPending, error } = useLogin();

  // Logout mutation
  const { mutate: logout } = useLogout();

  // Get current session
  const { data: session } = useCurrentSession();

  const handleLogin = () => {
    login(
      { email: 'user@example.com', password: 'password' },
      {
        onSuccess: (session) => {
          console.log('Logged in:', session.user.email);
        },
        onError: (error) => {
          console.error('Login failed:', error.message);
        }
      }
    );
  };

  return (
    <div>
      {session ? (
        <button onClick={() => logout()}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## Supabase Setup

### Prerequisites

1. **Create a Supabase project:**
   - Go to https://app.supabase.com
   - Create a new project
   - Wait for database to be ready

2. **Get your credentials:**
   - Go to Project Settings > API
   - Copy your `Project URL`
   - Copy your `anon/public` key

3. **Configure environment variables:**

```bash
# .env.local
NEXT_PUBLIC_AUTH_REPO_TYPE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Supabase Configuration

By default, Supabase email authentication is enabled. You can configure it in the Supabase dashboard:

1. **Email Confirmation (Optional):**
   - Go to Authentication > Settings
   - Toggle "Enable email confirmations"
   - If enabled, users must verify email before login

2. **Password Requirements:**
   - Default minimum: 6 characters
   - Configurable in Authentication > Settings

3. **Rate Limiting:**
   - Default: 30 requests per hour per IP
   - Configurable in Authentication > Rate Limits

### Supabase Features

- ✅ Email/password authentication
- ✅ Automatic token refresh
- ✅ Session persistence across page reloads
- ✅ Built-in email verification (configurable)
- ✅ Password reset flow
- ✅ User metadata storage (name, avatar, etc.)
- ✅ Row Level Security (RLS) for data access

## Custom Repository Implementation

You can create your own repository implementation (e.g., Firebase, Auth0):

```typescript
import { IAuthRepository, LoginInput, AuthSession } from '@/app/login';

// 1. Implement the interface
class FirebaseAuthRepository implements IAuthRepository {
  async login(input: LoginInput): Promise<AuthSession> {
    // Your Firebase implementation
    const credential = await signInWithEmailAndPassword(
      auth,
      input.email,
      input.password
    );

    // Map Firebase user to AuthSession
    return new AuthSession(
      await credential.user.getIdToken(),
      new User(credential.user.uid, credential.user.email!),
      // ... other fields
    );
  }

  async logout(): Promise<void> {
    await signOut(auth);
    AuthSession.clear();
  }

  getCurrentSession(): AuthSession | null {
    // Your implementation
    return AuthSession.load();
  }

  async refreshToken(token: string): Promise<AuthSession> {
    // Your implementation
  }
}

// 2. Update AuthRepositoryRegistry to include your repository
// Edit: src/app/login/repositories/AuthRepositoryRegistry.ts
```

## Examples

### Development with Mock Data

```typescript
// src/app/login/page.tsx
import { AuthProvider } from '@/app/login';

export default function LoginPage() {
  return (
    <AuthProvider type="localStorage">
      <LoginForm />
    </AuthProvider>
  );
}
```

### Production with Supabase

```typescript
// src/app/login/page.tsx
import { AuthProvider } from '@/app/login';

export default function LoginPage() {
  // Type will be read from NEXT_PUBLIC_AUTH_REPO_TYPE env var
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
```

### Testing

```typescript
// tests/login.test.ts
import { AuthProvider } from '@/app/login';
import { render, screen } from '@testing-library/react';

test('should login successfully', async () => {
  // Use localStorage repository for testing
  render(
    <AuthProvider type="localStorage">
      <LoginForm />
    </AuthProvider>
  );

  // ... test implementation
});
```

### Debug Panel for Switching Repositories

```typescript
'use client';

import { useState } from 'react';
import { AuthRepositoryType } from '@/app/login';

export function DebugPanel() {
  const [currentType, setCurrentType] = useState<AuthRepositoryType>('localStorage');

  const handleSwitch = (type: AuthRepositoryType) => {
    localStorage.setItem('auth_repository_type', type);
    setCurrentType(type);
    window.location.reload(); // Reload to apply
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold">Auth Mode: {currentType}</h3>
      <div className="space-x-2 mt-2">
        <button onClick={() => handleSwitch('api')}>API Mode</button>
        <button onClick={() => handleSwitch('localStorage')}>Mock Mode</button>
        <button onClick={() => handleSwitch('supabase')}>Supabase Mode</button>
      </div>
    </div>
  );
}
```

## Error Handling

### Supabase Errors

The SupabaseAuthRepository maps Supabase errors to user-friendly messages:

| Supabase Status | User Message |
|-----------------|--------------|
| 400 | "Invalid email or password" |
| 401 | "Invalid credentials" |
| 422 | "Email or password is missing" |
| 429 | "Too many login attempts. Please try again later." |
| Other | Original error message |

### Error Handling in Components

```typescript
import { useLogin } from '@/app/login';

function LoginForm() {
  const { mutate: login, error, isPending } = useLogin();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    login({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-500">
          {error.message}
        </div>
      )}
      {/* ... form fields */}
    </form>
  );
}
```

## Best Practices

1. **Production:** Use `NEXT_PUBLIC_AUTH_REPO_TYPE=supabase` or `api`
2. **Development:** Use `localStorage` when backend isn't ready
3. **Testing:** Always use `localStorage` repository for unit tests
4. **Environment Variables:** Configure defaults via `.env` files
5. **Type Safety:** Always implement the `IAuthRepository` interface
6. **Error Handling:** Always handle errors in UI components
7. **Security:** Never commit `.env.local` with real credentials

## Architecture Benefits

✅ **Flexible:** Switch data sources easily via configuration
✅ **Testable:** Mock data for unit tests without API
✅ **Maintainable:** Change implementation without affecting business logic
✅ **Scalable:** Easy to add new repositories (Firebase, Auth0, etc.)
✅ **Type-safe:** TypeScript interface ensures contract compliance
✅ **Clean Architecture:** High-level modules depend on abstractions, not implementations

## Migration from Old Pattern

If you were using the old getInstance/setActiveType pattern:

**Old:**
```typescript
AuthRepositoryRegistry.getInstance().setActiveType('api');
```

**New:**
```typescript
// Use environment variable instead
NEXT_PUBLIC_AUTH_REPO_TYPE=api

// Or use AuthProvider with type prop
<AuthProvider type="api">
  <YourComponent />
</AuthProvider>

// Or use registry directly
const repo = AuthRepositoryRegistry.getRepository('api');
```

## Troubleshooting

### "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"

**Solution:** Add Supabase credentials to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### "Invalid credentials" with Supabase

**Possible causes:**
1. Wrong email/password
2. Email confirmation required (check Supabase dashboard)
3. User not registered yet (use signup feature first)

### Repository type not changing

**Solution:** Clear browser cache and localStorage:
```javascript
localStorage.clear();
window.location.reload();
```

## Related Documentation

- [Signup Repository Pattern](../../signup/repositories/README.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Clean Architecture Principles](../../../docs/ARCHITECTURE.md)
