# Mối quan hệ & Phụ thuộc - Login Feature

## 📊 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌─────────────┐          ┌──────────────┐                 │
│  │  page.tsx   │─────────▶│ LoginForm.tsx│                 │
│  └─────────────┘          └───────┬──────┘                 │
└────────────────────────────────────┼──────────────────────────┘
                                     │ uses
                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  ┌──────────────┐         ┌──────────────┐                 │
│  │ UseLogin.ts  │◀────────│ LoginLogic.ts│                 │
│  │   (Hook)     │  uses   │ (Validation) │                 │
│  └──────┬───────┘         └──────────────┘                 │
└─────────┼────────────────────────────────────────────────────┘
          │ depends on
          ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTEXT LAYER (DI)                       │
│         ┌──────────────────────────────┐                    │
│         │    AuthContext.tsx           │                    │
│         │    (Provider/Container)      │                    │
│         └────────────┬─────────────────┘                    │
└──────────────────────┼──────────────────────────────────────┘
                       │ provides
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES LAYER                          │
│  ┌──────────────────────────────────────────────┐           │
│  │          IAuthRepository (Interface)         │           │
│  └────────────────────┬─────────────────────────┘           │
└───────────────────────┼─────────────────────────────────────┘
                        │ implemented by
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  ┌──────────────────────┐    ┌────────────────────────┐    │
│  │ ApiAuthRepository    │    │LocalStorageAuthRepository│   │
│  └──────────┬───────────┘    └───────────┬────────────┘    │
└─────────────┼──────────────────────────────┼─────────────────┘
              │ uses                         │ uses
              ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   User.ts   │  │AuthSession.ts│  │LoginTypes.ts │       │
│  │  (Entity)   │  │   (Entity)   │  │    (DTO)     │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Chi tiết từng thành phần

### 1. **page.tsx** (Entry Point)
```typescript
page.tsx
├── depends on: AuthProvider (Context)
├── depends on: LoginForm (Component)
└── provides: Layout wrapper
```

**Phụ thuộc:**
- `AuthProvider` (cung cấp DI container)
- `LoginForm` (UI component)

**Được sử dụng bởi:** Next.js router

---

### 2. **LoginForm.tsx** (UI Component)
```typescript
LoginForm.tsx
├── depends on: useLogin (Hook)
├── depends on: validateLogin (Logic)
├── depends on: UI components (Button, Input, Card)
└── uses: React hooks (useState, useRouter)
```

**Phụ thuộc:**
- `useLogin()` hook → Gọi API
- `validateLogin()` → Validate input
- UI components → Render form

**Không phụ thuộc trực tiếp:**
- ❌ Repository (không biết ApiAuthRepository hay LocalStorageAuthRepository)
- ❌ AuthContext trực tiếp (đi qua hook)

---

### 3. **UseLogin.ts** (Application Hook)
```typescript
UseLogin.ts
├── depends on: useAuthRepository (Hook từ Context)
├── depends on: validateLogin (Logic)
├── depends on: useMutation (React Query)
├── depends on: LoginInput (DTO)
└── depends on: AuthSession (Model)
```

**Phụ thuộc:**
- `useAuthRepository()` → Lấy repository từ Context
- `validateLogin()` → Validate input
- `LoginInput` → Type definition
- `AuthSession` → Return type

**Không phụ thuộc:**
- ❌ Concrete repository implementation

---

### 4. **LoginLogic.ts** (Pure Logic)
```typescript
LoginLogic.ts
├── depends on: LoginInputSchema (Zod schema)
├── depends on: LoginInput (Type)
└── no side effects (pure function)
```

**Phụ thuộc:**
- `LoginInputSchema` → Zod validation
- `ZodError` → Error handling

**Không phụ thuộc:**
- ❌ React
- ❌ Repository
- ❌ Context

**Đặc điểm:** Pure function, dễ test

---

### 5. **AuthContext.tsx** (Provider/Container/Injector)
```typescript
AuthContext.tsx
├── creates: IAuthRepository instances
├── provides: Repository to component tree
├── depends on: ApiAuthRepository (Implementation)
├── depends on: LocalStorageAuthRepository (Implementation)
└── exports: useAuthRepository hook
```

**Nhiệm vụ:**
- Tạo repository instances
- Inject vào component tree
- Quản lý lifecycle của dependencies

**Phụ thuộc:**
- `IAuthRepository` (Interface)
- `ApiAuthRepository` (Concrete class)
- `LocalStorageAuthRepository` (Concrete class)

---

### 6. **IAuthRepository** (Interface)
```typescript
IAuthRepository (Interface)
├── defines contract
├── no dependencies (pure interface)
└── implemented by repositories
```

**Phụ thuộc:**
- `LoginInput` (DTO type)
- `AuthSession` (Model type)

**Được implement bởi:**
- `ApiAuthRepository`
- `LocalStorageAuthRepository`

---

### 7. **ApiAuthRepository** (Infrastructure)
```typescript
ApiAuthRepository
├── implements: IAuthRepository
├── depends on: LoginInput (DTO)
├── depends on: LoginResponse (DTO)
├── depends on: AuthSession (Model)
├── depends on: fetch API (External)
└── side effects: HTTP calls
```

**Phụ thuộc:**
- `IAuthRepository` (Interface)
- `AuthSession` → Domain model
- `LoginInput/LoginResponse` → DTOs
- Browser `fetch` API

---

### 8. **LocalStorageAuthRepository** (Infrastructure)
```typescript
LocalStorageAuthRepository
├── implements: IAuthRepository
├── depends on: LoginInput (DTO)
├── depends on: AuthSession (Model)
├── depends on: User (Model)
├── depends on: localStorage API (External)
└── side effects: localStorage operations
```

**Phụ thuộc:**
- `IAuthRepository` (Interface)
- `AuthSession` → Domain model
- `User` → Domain model
- Browser `localStorage` API

---

### 9. **AuthSession** (Domain Model)
```typescript
AuthSession
├── depends on: User (Model)
├── depends on: localStorage (⚠️ SRP violation)
└── business logic: isExpired(), save(), load()
```

**Phụ thuộc:**
- `User` model
- `localStorage` (⚠️ nên tách ra)

**Được sử dụng bởi:**
- Repositories
- Hooks
- Components

---

### 10. **User** (Domain Model)
```typescript
User
├── no dependencies (pure domain model)
└── business logic: displayName, isEmailVerified()
```

**Phụ thuộc:** KHÔNG có

**Được sử dụng bởi:**
- `AuthSession`
- Repositories

---

### 11. **LoginTypes (DTOs)**
```typescript
LoginTypes
├── LoginInputSchema (Zod)
├── LoginInput (Type)
└── LoginResponse (Type)
```

**Phụ thuộc:**
- `zod` library

**Được sử dụng bởi:**
- Validation logic
- Repositories
- Hooks

---

## 🔄 Dependency Flow (Luồng phụ thuộc)

### High-level → Low-level
```
UI Component (LoginForm)
    ↓ depends on
Hook (useLogin)
    ↓ depends on
Context (AuthContext)
    ↓ provides
Interface (IAuthRepository)
    ↑ implemented by
Infrastructure (ApiAuthRepository, LocalStorageAuthRepository)
    ↓ uses
Domain Models (AuthSession, User)
```

---

## 📋 Ma trận phụ thuộc

| Component | Phụ thuộc vào | Được sử dụng bởi |
|-----------|---------------|------------------|
| **page.tsx** | AuthProvider, LoginForm | Next.js Router |
| **LoginForm** | useLogin, validateLogin, UI | page.tsx |
| **useLogin** | useAuthRepository, validateLogin | LoginForm |
| **validateLogin** | Zod, LoginInput | LoginForm, useLogin |
| **AuthContext** | IAuthRepository, Implementations | useLogin |
| **IAuthRepository** | LoginInput, AuthSession | Implementations, Context |
| **ApiAuthRepository** | IAuthRepository, Models, fetch | AuthContext |
| **LocalStorageRepo** | IAuthRepository, Models, localStorage | AuthContext |
| **AuthSession** | User, localStorage | Repositories, Hooks |
| **User** | NOTHING | AuthSession |
| **LoginTypes** | Zod | Logic, Repositories |

---

## 🎯 Nguyên tắc được áp dụng

### ✅ Dependency Inversion Principle (DIP)
```
HIGH-level (LoginForm)
    ↓ depends on ↓
ABSTRACTION (IAuthRepository)
    ↑ implemented by ↑
LOW-level (ApiAuthRepository)
```

### ✅ Dependency Injection (DI)
```
AuthContext (Container)
    → creates → ApiAuthRepository
    → injects → IAuthRepository
    → into → useLogin hook
    → used by → LoginForm
```

### ✅ Single Responsibility
- LoginForm → UI only
- useLogin → React integration only
- validateLogin → Validation only
- ApiAuthRepository → API calls only

---

## ⚠️ Issues hiện tại

### 1. AuthSession có 2 responsibilities
```typescript
// ❌ Vi phạm SRP
class AuthSession {
  isExpired() { ... }          // ✅ Domain logic
  save() { localStorage... }   // ❌ Persistence logic
  load() { localStorage... }   // ❌ Persistence logic
}
```

**Nên tách:**
```typescript
// ✅ Tách riêng
class AuthSession {
  isExpired() { ... }  // Domain only
}

class SessionStorage {
  save(session) { ... }   // Persistence only
  load() { ... }          // Persistence only
}
```

### 2. Double validation
- LoginForm validates
- useLogin validates again
→ Nên validate 1 lần ở hook

---

## 🏗️ Kiến trúc tổng kết

```
┌────────────────────────────────────────────────┐
│         Presentation (UI Components)           │
│              Không biết implementation         │
└───────────────────┬────────────────────────────┘
                    │ uses
                    ▼
┌────────────────────────────────────────────────┐
│      Application (Hooks + Pure Logic)          │
│           Không biết implementation            │
└───────────────────┬────────────────────────────┘
                    │ injects from
                    ▼
┌────────────────────────────────────────────────┐
│         Context (DI Container)                 │
│     Quyết định implementation nào              │
└─────────┬──────────────────────────────────────┘
          │ provides
          ▼
┌────────────────────────────────────────────────┐
│       Interfaces (Contracts)                   │
│         Định nghĩa what, không how             │
└─────────┬──────────────────────────────────────┘
          │ implemented by
          ▼
┌────────────────────────────────────────────────┐
│   Infrastructure (API, Storage, External)      │
│         Chi tiết implementation                │
└─────────┬──────────────────────────────────────┘
          │ uses
          ▼
┌────────────────────────────────────────────────┐
│      Domain (Models, Entities, DTOs)           │
│         Không phụ thuộc gì cả                  │
└────────────────────────────────────────────────┘
```

**Dependency Direction:** Top → Bottom (High-level → Low-level)  
**Control Flow:** Top → Context → Interface ← Implementation → Domain

---

## 💡 Key Takeaways

1. **Component KHÔNG biết repository implementation**
   - LoginForm chỉ biết `useLogin()` hook
   - useLogin chỉ biết `IAuthRepository` interface

2. **Context là DI Container**
   - Tạo dependencies
   - Inject vào component tree
   - Quản lý lifecycle

3. **Interface là abstraction layer**
   - Tách high-level khỏi low-level
   - Cho phép swap implementation

4. **Domain models độc lập**
   - User không phụ thuộc gì
   - AuthSession nên tách persistence logic

5. **Clean Architecture achieved**
   - Dependencies point inward
   - Core không phụ thuộc infrastructure
   - Easy to test, easy to change
