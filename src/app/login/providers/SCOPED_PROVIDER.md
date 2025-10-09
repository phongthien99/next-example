# Scoped Provider Pattern

## Tổng quan

AuthRepositoryProvider được scope **chỉ cho login page**, không phải global app-wide provider.

## Tại sao Scoped?

### ✅ **Lợi ích:**

1. **Lightweight** - Provider chỉ load khi cần
2. **Isolated** - Không ảnh hưởng pages khác
3. **Performance** - Không re-render toàn app
4. **Clear boundaries** - Feature tự quản lý dependencies
5. **Easy cleanup** - Unmount page = cleanup provider

### ⚠️ **Trade-offs:**

1. **Limited scope** - Chỉ dùng được trong `/login` route
2. **Re-initialization** - Mỗi lần vào page tạo provider mới
3. **Cannot share** - Không dùng được ở pages khác

---

## Implementation

### **Login Page (Scoped Provider)**

```typescript
// src/app/login/page.tsx
import { AuthRepositoryProvider } from "./providers/AuthRepositoryProvider";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  return (
    <AuthRepositoryProvider>  {/* Chỉ scope cho login page */}
      <div>
        <LoginForm />
      </div>
    </AuthRepositoryProvider>
  );
}
```

### **LoginForm sử dụng repository**

```typescript
// src/app/login/components/LoginForm.tsx
import { useLogin } from "../hooks/UseLogin";

export function LoginForm() {
  const { mutate: login } = useLogin();
  
  // Hook tự động lấy repository từ provider ở page.tsx
  // ✅ Works vì LoginForm là children của AuthRepositoryProvider
}
```

---

## Khi nào dùng Scoped vs Global?

### **Scoped Provider (Current Implementation)**

✅ Dùng khi:
- Feature độc lập (login, checkout, admin panel)
- Không cần share state across pages
- Muốn lazy load dependencies
- Feature có lifecycle riêng

```typescript
// ✅ Good for: Login, Register, Forgot Password
/login/page.tsx
  <AuthRepositoryProvider>
    <LoginForm />
  </AuthRepositoryProvider>
```

### **Global Provider**

✅ Dùng khi:
- Cần dùng auth ở nhiều pages
- Session management toàn app
- User context global
- Protected routes

```typescript
// ✅ Good for: User session, Theme, i18n
app/providers.tsx
  <QueryClientProvider>
    <AuthRepositoryProvider>  {/* Global */}
      <App />
    </AuthRepositoryProvider>
  </QueryClientProvider>
```

---

## Pattern Variants

### **1. Route-based Scoping (Current)**

```typescript
// app/login/page.tsx
export default function LoginPage() {
  return (
    <AuthRepositoryProvider>
      <LoginForm />
    </AuthRepositoryProvider>
  );
}

// app/register/page.tsx
export default function RegisterPage() {
  return (
    <AuthRepositoryProvider>  {/* Riêng biệt với login */}
      <RegisterForm />
    </AuthRepositoryProvider>
  );
}
```

**Pros:** Isolated, lazy loaded  
**Cons:** Duplicate providers

### **2. Layout-based Scoping**

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <AuthRepositoryProvider>
      {children}  {/* login, register, forgot-password share provider */}
    </AuthRepositoryProvider>
  );
}
```

**Pros:** Share provider across auth routes  
**Cons:** Provider lives longer

### **3. Global with Lazy Loading**

```typescript
// app/providers.tsx
'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const AuthRepositoryProvider = dynamic(
  () => import('./login/providers/AuthRepositoryProvider'),
  { ssr: false }
);

export function Providers({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthRoute ? (
        <AuthRepositoryProvider>{children}</AuthRepositoryProvider>
      ) : (
        children
      )}
    </QueryClientProvider>
  );
}
```

**Pros:** Best of both worlds  
**Cons:** More complex

---

## Migration Scenarios

### **Scenario 1: Cần dùng auth ở nhiều pages**

```typescript
// Option A: Move to global
// app/providers.tsx
<AuthRepositoryProvider>
  <App />
</AuthRepositoryProvider>

// Remove from login/page.tsx
```

### **Scenario 2: Thêm register page**

```typescript
// Option A: Duplicate provider (isolated)
// app/register/page.tsx
<AuthRepositoryProvider>
  <RegisterForm />
</AuthRepositoryProvider>

// Option B: Shared layout
// app/(auth)/layout.tsx
<AuthRepositoryProvider>
  {children}  {/* login + register */}
</AuthRepositoryProvider>
```

### **Scenario 3: Protected routes cần session**

```typescript
// Need global provider
// app/providers.tsx
<AuthRepositoryProvider>
  <App />
    <ProtectedRoute />  {/* Cần access repository */}
    <Dashboard />       {/* Cần check session */}
</AuthRepositoryProvider>
```

---

## Testing

### **Test với scoped provider**

```typescript
import { render } from '@testing-library/react';
import LoginPage from '@/app/login/page';

test('login page with scoped provider', () => {
  // Provider đã wrap sẵn trong page component
  render(<LoginPage />);
  
  // LoginForm có access đến repository
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
```

### **Test component riêng lẻ**

```typescript
import { LoginForm } from '@/app/login/components/LoginForm';
import { AuthRepositoryProvider } from '@/app/login/providers/AuthRepositoryProvider';

test('login form component', () => {
  // Phải wrap manual vì không có page
  render(
    <AuthRepositoryProvider>
      <LoginForm />
    </AuthRepositoryProvider>
  );
});
```

---

## Best Practices

### ✅ **DO:**

1. **Scope provider gần component nhất có thể**
   ```typescript
   // ✅ Page level
   <AuthRepositoryProvider>
     <LoginForm />
   </AuthRepositoryProvider>
   ```

2. **Document scope boundary**
   ```typescript
   // ✅ Clear comment
   // AuthRepositoryProvider scoped to /login route only
   ```

3. **Consider lazy loading cho global**
   ```typescript
   // ✅ Conditional provider
   {isAuthRoute && <AuthRepositoryProvider>...</AuthRepositoryProvider>}
   ```

### ❌ **DON'T:**

1. **Đừng scope quá nhỏ**
   ```typescript
   // ❌ Overkill
   <LoginForm>
     <AuthRepositoryProvider>  {/* Quá nested */}
       <EmailField />
     </AuthRepositoryProvider>
   </LoginForm>
   ```

2. **Đừng duplicate logic**
   ```typescript
   // ❌ Repeat
   <AuthRepositoryProvider type="api">...</AuthRepositoryProvider>
   <AuthRepositoryProvider type="api">...</AuthRepositoryProvider>
   // ✅ Extract to shared layout
   ```

---

## Summary

**Current setup:** ✅ Scoped to `/login` page only

**Good for:**
- Login feature độc lập
- Không cần auth ở pages khác
- Minimal footprint

**Consider global nếu:**
- Cần protected routes
- Session management toàn app
- Multiple auth-related pages

**Current scope:** `/login` page → **Lightweight & isolated** 🎯
