# Technology Research: Tenant Management CRUD

**Feature**: Tenant Management CRUD
**Date**: 2025-12-10
**Research Phase**: Phase 0 - Technology Selection & Best Practices

## Overview

This document consolidates research findings for technology decisions required to implement the Tenant Management CRUD feature. All decisions align with the project constitution (Clean Architecture, SOLID principles, frontend-only architecture).

---

## Decision 1: Toast Notification Library

### Problem Statement

The feature requires toast notifications for success/error feedback on CRUD operations. Need to select an accessible, lightweight, TypeScript-compatible toast library.

### Options Evaluated

| Library | Bundle Size | TypeScript | Accessibility | Maintenance |
|---------|-------------|------------|---------------|-------------|
| **sonner** | 13KB gzipped | ✅ Built-in | ✅ WCAG 2.1 AA | ✅ Active (Emil Kowalski) |
| react-hot-toast | 15KB gzipped | ✅ Built-in | ⚠️ Basic | ✅ Active |
| @radix-ui/react-toast | 8KB gzipped | ✅ Built-in | ✅ WCAG 2.1 AA | ✅ Active |
| react-toastify | 20KB gzipped | ✅ via @types | ⚠️ Basic | ✅ Active |

### Decision: **sonner**

**Rationale**:
- **Best UX**: Beautiful default styling, smooth animations, stacking behavior
- **Accessible**: WCAG 2.1 AA compliant with ARIA live regions
- **TypeScript**: Full TypeScript support with excellent type inference
- **Bundle Size**: 13KB gzipped (acceptable for functionality provided)
- **API**: Simple and intuitive (`toast.success()`, `toast.error()`)
- **Maintenance**: Actively maintained by Emil Kowalski (shadcn/ui creator)
- **Ecosystem Fit**: Aligns with shadcn/ui philosophy (already using Radix UI)

**Alternatives Considered**:
- **react-hot-toast**: Good alternative, but sonner has better default UX and accessibility
- **@radix-ui/react-toast**: Too low-level, requires significant custom implementation
- **react-toastify**: Heavier bundle, less modern API

**Implementation**:
```typescript
import { toast } from 'sonner';

// Success notification
toast.success('Tenant created successfully');

// Error notification
toast.error('Failed to delete tenant');

// With action button
toast.success('Tenant updated', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo'),
  },
});
```

**Installation**: `pnpm add sonner`

---

## Decision 2: Table Component Strategy

### Problem Statement

Need a data table to display tenant records with columns (id, name, created_at, updated_at) and action buttons (Edit/Delete). Evaluate custom vs library approach.

### Options Evaluated

| Approach | Complexity | Bundle Size | Flexibility | Accessibility |
|----------|------------|-------------|-------------|---------------|
| **Custom (Semantic HTML)** | Low | 0KB | ✅ Full control | ✅ Native semantic |
| TanStack Table | High | 45KB gzipped | ✅ Full control | ⚠️ Manual ARIA |
| react-table (v7) | Medium | 30KB gzipped | ⚠️ Limited | ⚠️ Manual ARIA |
| AG Grid | Very High | 150KB+ | ✅ Full control | ✅ Built-in |

### Decision: **Custom Implementation with Semantic HTML + Radix UI Patterns**

**Rationale**:
- **Zero Dependencies**: No additional bundle size for simple CRUD table
- **Accessibility**: Native semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`, `<th>`) provides best accessibility
- **Flexibility**: Full control over styling, responsive behavior, and interactions
- **Simplicity**: Feature requirements don't need advanced features (sorting, filtering, pagination, virtualization)
- **Consistency**: Matches existing shadcn/ui component patterns
- **Performance**: No overhead from library abstractions for simple use case

**Alternatives Considered**:
- **TanStack Table**: Overkill for simple CRUD, 45KB for features we don't need (sorting, filtering, pagination)
- **AG Grid**: Enterprise-grade solution, massive bundle size, unnecessary complexity
- **react-table v7**: Older API, maintenance concerns, still too heavy

**Implementation Approach**:

Create reusable table primitives in `src/components/ui/table.tsx`:
```typescript
// Table primitives following shadcn/ui patterns
export const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(...)
export const TableHeader = React.forwardRef<HTMLTableSectionElement, ...>(...)
export const TableBody = React.forwardRef<HTMLTableSectionElement, ...>(...)
export const TableRow = React.forwardRef<HTMLTableRowElement, ...>(...)
export const TableHead = React.forwardRef<HTMLTableCellElement, ...>(...)
export const TableCell = React.forwardRef<HTMLTableCellElement, ...>(...)
```

Use in feature:
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>ID</TableHead>
      <TableHead>Name</TableHead>
      <TableHead>Created</TableHead>
      <TableHead>Updated</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {tenants.map((tenant) => (
      <TableRow key={tenant.id}>
        <TableCell>{tenant.id}</TableCell>
        <TableCell>{tenant.name}</TableCell>
        <TableCell>{formatDate(tenant.created_at)}</TableCell>
        <TableCell>{formatDate(tenant.updated_at)}</TableCell>
        <TableCell className="text-right">
          <Button onClick={() => handleEdit(tenant)}>Edit</Button>
          <Button onClick={() => handleDelete(tenant)}>Delete</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

**WCAG 2.1 AA Compliance**:
- Semantic `<table>` element with proper `<thead>`, `<tbody>` structure
- `<th>` elements with `scope` attribute for column headers
- ARIA labels for action buttons
- Keyboard navigation support (Tab through rows, Enter to trigger actions)
- Sufficient color contrast (4.5:1 minimum)

**Installation**: None (custom implementation)

---

## Decision 3: Modal/Dialog Component

### Problem Statement

Need modal dialogs for Create and Edit tenant forms. Requires accessible, keyboard-navigable, focus-trap implementation.

### Options Evaluated

| Library | Bundle Size | Accessibility | TypeScript | Ecosystem Fit |
|---------|-------------|---------------|------------|---------------|
| **@radix-ui/react-dialog** | 12KB gzipped | ✅ WCAG 2.1 AA | ✅ Built-in | ✅ Already using Radix |
| headlessui/react | 15KB gzipped | ✅ WCAG 2.1 AA | ✅ Built-in | ⚠️ Tailwind Labs ecosystem |
| react-modal | 10KB gzipped | ⚠️ Basic | ✅ via @types | ❌ Older patterns |

### Decision: **@radix-ui/react-dialog**

**Rationale**:
- **Ecosystem Alignment**: Already using Radix UI primitives throughout project (shadcn/ui philosophy)
- **Accessibility**: WCAG 2.1 AA compliant with focus trap, ESC to close, ARIA attributes
- **TypeScript**: Excellent TypeScript support with full type inference
- **Bundle Size**: 12KB gzipped (reasonable for accessibility features)
- **Composition**: Flexible composition model matches React patterns
- **Keyboard Navigation**: Built-in support for Tab, Shift+Tab, ESC
- **Constitution Compliance**: Listed in approved technology stack (Radix UI primitives)

**Alternatives Considered**:
- **headlessui**: Good alternative but different ecosystem (Tailwind Labs vs Radix)
- **react-modal**: Outdated patterns, less accessible out of the box

**Implementation**:
```tsx
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger asChild>
    <Button>Add Tenant</Button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50" />
    <Dialog.Content className="fixed left-1/2 top-1/2 ...">
      <Dialog.Title>Create Tenant</Dialog.Title>
      <Dialog.Description>Add a new tenant to the system</Dialog.Description>
      {/* Form content */}
      <Dialog.Close asChild>
        <Button>Cancel</Button>
      </Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

**Installation**: `pnpm add @radix-ui/react-dialog`

---

## Decision 4: Delete Confirmation Dialog

### Problem Statement

Delete operation requires confirmation dialog to prevent accidental deletion. Need purpose-built confirmation dialog vs reusing generic dialog.

### Options Evaluated

| Approach | Semantics | UX | Accessibility |
|----------|-----------|-----|---------------|
| **@radix-ui/react-alert-dialog** | ✅ Purpose-built | ✅ Optimized for confirmations | ✅ WCAG 2.1 AA |
| Reuse @radix-ui/react-dialog | ⚠️ Generic | ⚠️ Same as modal | ✅ WCAG 2.1 AA |
| window.confirm() | ❌ No control | ❌ Native, ugly | ⚠️ Basic |

### Decision: **@radix-ui/react-alert-dialog**

**Rationale**:
- **Semantic Purpose**: Specifically designed for destructive action confirmations
- **Better UX**: Alert dialogs have different UX patterns than generic modals (focus on action, not content)
- **Accessibility**: ARIA role="alertdialog" is more semantic than role="dialog" for confirmations
- **Cancel Focus**: Alert dialogs default focus to cancel button (safer for destructive actions)
- **Constitution Compliance**: Radix UI primitive, aligns with approved stack

**Alternatives Considered**:
- **Reuse Dialog**: Could work, but less semantic and requires manual focus management
- **window.confirm()**: No styling control, poor UX, not customizable

**Implementation**:
```tsx
import * as AlertDialog from '@radix-ui/react-alert-dialog';

<AlertDialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
  <AlertDialog.Trigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialog.Trigger>
  <AlertDialog.Portal>
    <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
    <AlertDialog.Content>
      <AlertDialog.Title>Delete Tenant</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete this tenant? This action cannot be undone.
      </AlertDialog.Description>
      <div className="flex gap-2">
        <AlertDialog.Cancel asChild>
          <Button variant="outline">Cancel</Button>
        </AlertDialog.Cancel>
        <AlertDialog.Action asChild>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </AlertDialog.Action>
      </div>
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
```

**Installation**: `pnpm add @radix-ui/react-alert-dialog`

---

## Decision 5: UUID Generation

### Problem Statement

Need to generate UUIDs for tenant IDs when creating new records. Evaluate native vs library approach.

### Options Evaluated

| Approach | Bundle Size | Browser Support | Standard Compliance |
|----------|-------------|-----------------|---------------------|
| **crypto.randomUUID()** | 0KB (native) | ✅ All modern browsers | ✅ RFC 4122 |
| uuid package | 4.5KB gzipped | ✅ All browsers | ✅ RFC 4122 |
| nanoid | 2KB gzipped | ✅ All browsers | ❌ Custom format |

### Decision: **crypto.randomUUID()**

**Rationale**:
- **Zero Dependencies**: Native Web API, no external package needed
- **Browser Support**: Supported in all modern browsers (Chrome 92+, Firefox 95+, Safari 15.4+, Edge 92+)
- **Standard Compliance**: Generates RFC 4122 version 4 UUIDs
- **Performance**: Native implementation is faster than JavaScript libraries
- **Security**: Uses secure random number generator (cryptographically strong)
- **Constitution Alignment**: Avoids unnecessary dependencies

**Alternatives Considered**:
- **uuid package**: Unnecessary dependency when native API is available
- **nanoid**: Different format, not UUID standard

**Implementation**:
```typescript
// src/lib/uuid.ts
export function generateUUID(): string {
  return crypto.randomUUID();
}

// Usage in repository
const tenant: Tenant = {
  id: generateUUID(),
  name: input.name,
  created_at: new Date(),
  updated_at: new Date(),
};
```

**Browser Compatibility Fallback** (if needed for older browsers):
```typescript
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older browsers (development only)
  console.warn('crypto.randomUUID() not available, using fallback');
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

**Installation**: None (native API)

---

## Decision 6: Date Formatting

### Problem Statement

Need to format ISO date strings to human-readable format (e.g., "Jan 15, 2024 10:30 AM"). Evaluate native vs library approach.

### Options Evaluated

| Approach | Bundle Size | Locale Support | TypeScript |
|----------|-------------|----------------|------------|
| **Intl.DateTimeFormat** | 0KB (native) | ✅ Built-in | ✅ Native types |
| date-fns | 23KB gzipped | ✅ Manual | ✅ Built-in |
| dayjs | 7KB gzipped | ✅ Via plugins | ✅ Built-in |
| moment.js | 67KB gzipped | ✅ Built-in | ✅ via @types |

### Decision: **Intl.DateTimeFormat**

**Rationale**:
- **Zero Dependencies**: Native JavaScript Internationalization API
- **Bundle Size**: No additional bundle weight
- **Locale Support**: Automatic locale detection and formatting
- **Browser Support**: All modern browsers (IE11+ with polyfill)
- **Flexibility**: Customizable format options
- **Constitution Alignment**: Avoids unnecessary dependencies

**Alternatives Considered**:
- **date-fns**: Excellent library, but 23KB for simple formatting is unnecessary
- **dayjs**: Lighter than date-fns (7KB), but still unnecessary for basic formatting
- **moment.js**: Legacy library, huge bundle size, not recommended

**Implementation**:
```typescript
// src/lib/date-formatter.ts
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(dateObj);
}

// Usage
formatDateTime(tenant.created_at); // "Jan 15, 2024, 10:30 AM"
```

**Advanced Formatting** (if needed):
```typescript
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(dateObj);
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short' }).format(dateObj);
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
}
```

**Installation**: None (native API)

---

## Decision 7: Mock Repository Strategy

### Problem Statement

Feature requires mock API services for CRUD operations. Need to simulate realistic API behavior including latency, errors, and state management.

### Options Evaluated

| Approach | Complexity | Realism | Testability |
|----------|------------|---------|-------------|
| **In-Memory + Simulated Latency** | Low | ✅ High | ✅ Easy to mock |
| MSW (Mock Service Worker) | Medium | ✅ Very high | ✅ Excellent |
| JSON Server | High | ✅ High | ⚠️ External process |
| Direct in-memory (no latency) | Very Low | ❌ Unrealistic | ✅ Easy |

### Decision: **In-Memory Repository with Simulated Latency**

**Rationale**:
- **Simplicity**: No external processes, no service worker setup
- **Realistic UX**: Simulated latency (100-300ms) allows testing loading states
- **Clean Architecture**: Implements ITenantRepository interface, easily swappable
- **State Management**: In-memory Map for fast lookups and updates
- **Error Simulation**: Can simulate API errors for testing
- **Development Speed**: Fast iteration, no network calls
- **Constitution Compliance**: Follows Repository pattern with DIP

**Alternatives Considered**:
- **MSW**: Excellent for API mocking, but overkill for simple in-memory mock
- **JSON Server**: External process, unnecessary complexity for mock data
- **Direct in-memory**: Too fast, doesn't test loading states

**Implementation Architecture**:

```typescript
// Infrastructure Layer: Repository Implementation
class InMemoryTenantRepository implements ITenantRepository {
  private tenants: Map<string, Tenant> = new Map();

  private async simulateLatency(): Promise<void> {
    const delay = Math.random() * 200 + 100; // 100-300ms
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async getTenants(): Promise<Tenant[]> {
    await this.simulateLatency();
    return Array.from(this.tenants.values()).sort((a, b) =>
      b.created_at.getTime() - a.created_at.getTime()
    );
  }

  async createTenant(input: TenantInput): Promise<Tenant> {
    await this.simulateLatency();

    const tenant: Tenant = {
      id: generateUUID(),
      name: input.name.trim(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  async updateTenant(id: string, input: TenantInput): Promise<Tenant> {
    await this.simulateLatency();

    const existing = this.tenants.get(id);
    if (!existing) {
      throw new Error(`Tenant not found: ${id}`);
    }

    const updated: Tenant = {
      ...existing,
      name: input.name.trim(),
      updated_at: new Date(),
    };

    this.tenants.set(id, updated);
    return updated;
  }

  async deleteTenant(id: string): Promise<void> {
    await this.simulateLatency();

    if (!this.tenants.has(id)) {
      throw new Error(`Tenant not found: ${id}`);
    }

    this.tenants.delete(id);
  }
}
```

**Error Simulation** (optional for testing):
```typescript
class MockApiTenantRepository implements ITenantRepository {
  private shouldSimulateError = false;

  async createTenant(input: TenantInput): Promise<Tenant> {
    await this.simulateLatency();

    if (this.shouldSimulateError) {
      throw new Error('API Error: Failed to create tenant');
    }

    // Normal creation logic...
  }
}
```

**Installation**: None (custom implementation)

---

## Summary of Technology Decisions

| Category | Decision | Bundle Impact | Rationale |
|----------|----------|---------------|-----------|
| Toast Notifications | sonner | +13KB | Best UX, accessible, TypeScript, maintained |
| Table Component | Custom (semantic HTML) | 0KB | Zero deps, accessible, full control |
| Modal/Dialog | @radix-ui/react-dialog | +12KB | Ecosystem fit, accessible, TypeScript |
| Delete Confirmation | @radix-ui/react-alert-dialog | +8KB | Semantic, purpose-built, accessible |
| UUID Generation | crypto.randomUUID() | 0KB | Native API, standard-compliant |
| Date Formatting | Intl.DateTimeFormat | 0KB | Native API, locale-aware |
| Mock Repository | In-memory + latency | 0KB | Simple, realistic, testable |

**Total Bundle Impact**: ~33KB gzipped (all new dependencies)

**Constitution Compliance**: ✅ All decisions align with:
- Type Safety First (TypeScript support in all libraries)
- Component-Driven Architecture (reusable primitives)
- Frontend-Only Rendering (no backend dependencies)
- Performance & Accessibility (WCAG 2.1 AA, minimal bundle size)
- Clean Architecture (Repository pattern, DIP)
- Technology Stack Standards (Radix UI ecosystem, no unnecessary deps)

---

## Installation Commands

```bash
# Install all new dependencies
pnpm add sonner @radix-ui/react-dialog @radix-ui/react-alert-dialog

# Verify installation
pnpm list sonner @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

**Expected Output**:
```
sonner@1.x.x
@radix-ui/react-dialog@1.x.x
@radix-ui/react-alert-dialog@1.x.x
```

---

## Next Steps

1. ✅ Technology decisions finalized
2. ⏭️ Create data model (data-model.md)
3. ⏭️ Define API contracts (contracts/mock-tenant-api.md)
4. ⏭️ Write quickstart guide (quickstart.md)
5. ⏭️ Update agent context (CLAUDE.md)
6. ⏭️ Generate implementation tasks (/speckit.tasks)
