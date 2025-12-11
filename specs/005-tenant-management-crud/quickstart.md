# Quickstart Guide: Tenant Management CRUD

**Feature**: Tenant Management CRUD
**Date**: 2025-12-10
**Audience**: Developers implementing or using the Tenant Management feature

## Overview

This guide provides step-by-step instructions for setting up, running, and using the Tenant Management CRUD feature. The feature demonstrates Clean Architecture with Repository pattern using in-memory mock data.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ pnpm package manager installed
- ✅ Next.js 15.5.4 project initialized
- ✅ TypeScript 5.x configured with strict mode
- ✅ Tailwind CSS 4.x configured

---

## Installation

### 1. Install Dependencies

```bash
# Navigate to project root
cd /path/to/next-example

# Install new dependencies for this feature
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

### 2. Verify Existing Dependencies

These should already be installed (verify with `pnpm list`):

```bash
# Core framework
next@15.5.4
react@19.1.0
typescript@5.x

# Validation
zod@4.1.12

# UI (existing Radix primitives)
@radix-ui/react-label
@radix-ui/react-slot

# Styling
tailwindcss@4.x
class-variance-authority
clsx
tailwind-merge
```

---

## Project Structure

After implementation, the feature will be organized as follows:

```
src/app/tenants/                    # Tenant Management Feature
├── page.tsx                        # Route entry point
├── error.tsx                       # Error boundary
│
├── components/                     # Presentation Layer
│   ├── TenantManagementPage.tsx
│   ├── TenantTable.tsx
│   ├── TenantForm.tsx
│   └── DeleteTenantDialog.tsx
│
├── hooks/                          # Application Layer
│   └── UseTenantManagement.ts
│
├── core/                           # Domain Layer
│   └── TenantLogic.ts
│
├── repositories/                   # Infrastructure Layer
│   ├── ITenantRepository.ts
│   ├── InMemoryTenantRepository.ts
│   └── TenantRepositoryRegistry.ts
│
├── providers/                      # Dependency Injection
│   └── TenantRepositoryProvider.tsx
│
├── models/                         # Domain Models
│   └── Tenant.ts
│
├── dto/                            # Data Transfer Objects
│   └── TenantTypes.ts
│
└── index.ts                        # Public API

src/components/ui/                  # Shared UI Components
├── dialog.tsx                      # NEW: Dialog primitives
├── alert-dialog.tsx                # NEW: Alert dialog
├── table.tsx                       # NEW: Table primitives
└── sonner.tsx                      # NEW: Toast integration

src/lib/
├── uuid.ts                         # NEW: UUID utilities
└── utils.ts                        # Existing utilities
```

---

## Running the Feature

### Development Server

```bash
# Start Next.js development server
pnpm dev

# Open browser
open http://localhost:3000/tenants
```

**Expected Behavior**:
- Page loads with table showing 5 pre-seeded tenants
- "Add Tenant" button visible in header
- Each row has Edit and Delete action buttons
- Loading states visible during data fetch (100-300ms delay)

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Open browser
open http://localhost:3000/tenants
```

---

## Using the Feature

### 1. View Tenant List

**Action**: Navigate to `/tenants`

**Expected Result**:
- Table displays 5 pre-seeded tenants
- Columns: ID, Name, Created At, Updated At, Actions
- Tenants sorted by creation date (newest first)
- Loading skeleton appears briefly (100-300ms)

**Pre-Seeded Data**:
1. Digital Ventures LLC (newest)
2. Innovation Labs
3. Global Solutions Ltd
4. TechStart Inc.
5. Acme Corporation (oldest)

---

### 2. Create New Tenant

**Action**:
1. Click "Add Tenant" button
2. Modal opens with form
3. Enter tenant name (e.g., "New Corporation")
4. Click "Create" button

**Expected Result**:
- Form validates input (name required, max 255 chars)
- Loading state appears on button (100-300ms)
- Success toast: "Tenant created successfully"
- Modal closes automatically
- New tenant appears at top of table
- ID auto-generated (UUID v4)
- Created/Updated timestamps set to current time

**Validation Rules**:
- Name is required (no empty or whitespace-only)
- Name max length: 255 characters
- Name is automatically trimmed

**Error Scenarios**:
- Empty name → "Tenant name is required"
- Name > 255 chars → "Tenant name must be less than 255 characters"

---

### 3. Edit Existing Tenant

**Action**:
1. Click "Edit" button on any tenant row
2. Modal opens with pre-filled form
3. Modify tenant name
4. Click "Update" button

**Expected Result**:
- Form pre-populated with current tenant data
- ID, Created At, Updated At fields are readonly (disabled)
- Only Name field is editable
- Loading state appears on button (100-300ms)
- Success toast: "Tenant updated successfully"
- Modal closes automatically
- Updated tenant appears in table with new name
- Updated At timestamp refreshed to current time

**Validation Rules**: Same as Create

---

### 4. Delete Tenant

**Action**:
1. Click "Delete" button on any tenant row
2. Confirmation dialog appears
3. Click "Delete" to confirm (or "Cancel" to abort)

**Expected Result**:
- Alert dialog asks: "Are you sure you want to delete this tenant?"
- Confirmation required (prevents accidental deletion)
- Loading state appears on button (100-300ms)
- Success toast: "Tenant deleted successfully"
- Dialog closes automatically
- Tenant removed from table

**Safety Features**:
- Confirmation dialog prevents accidental deletion
- Cancel button is default focus (safer UX)
- ESC key closes dialog without deleting

---

## API Usage (Repository)

### Accessing the Repository

```typescript
import { useTenantRepository } from '@/app/tenants/providers/TenantRepositoryProvider';

function MyComponent() {
  const repository = useTenantRepository();

  // Use repository methods...
}
```

### Get All Tenants

```typescript
const tenants = await repository.getTenants();
// Returns: Tenant[] sorted by created_at desc

console.log(tenants.length); // 5 (initially)
console.log(tenants[0].name); // "Digital Ventures LLC" (newest)
```

### Get Single Tenant

```typescript
const tenant = await repository.getTenantById('550e8400-e29b-41d4-a716-446655440001');

if (tenant) {
  console.log(tenant.name); // "Acme Corporation"
} else {
  console.log('Tenant not found');
}
```

### Create Tenant

```typescript
const newTenant = await repository.createTenant({
  name: 'New Corporation',
});

console.log(newTenant.id); // Auto-generated UUID
console.log(newTenant.created_at); // Current timestamp
console.log(newTenant.updated_at); // Same as created_at
```

### Update Tenant

```typescript
const updated = await repository.updateTenant(
  '550e8400-e29b-41d4-a716-446655440001',
  { name: 'Updated Name' }
);

console.log(updated.name); // "Updated Name"
console.log(updated.updated_at > updated.created_at); // true
```

### Delete Tenant

```typescript
await repository.deleteTenant('550e8400-e29b-41d4-a716-446655440001');

// Tenant no longer exists
const deleted = await repository.getTenantById('550e8400-e29b-41d4-a716-446655440001');
console.log(deleted); // null
```

---

## Hook Usage (Application Layer)

### Using UseTenantManagement Hook

```typescript
import { useTenantManagement } from '@/app/tenants/hooks/UseTenantManagement';

function MyComponent() {
  const {
    tenants,
    isLoading,
    error,
    createTenant,
    updateTenant,
    deleteTenant,
  } = useTenantManagement();

  // Display tenants
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Tenants ({tenants.length})</h1>
      <button onClick={() => createTenant({ name: 'New Tenant' })}>
        Add Tenant
      </button>
      {/* Render tenants... */}
    </div>
  );
}
```

### Hook API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| `createTenant` | `input: TenantInput` | `Promise<void>` | Creates new tenant, shows toast, refreshes list |
| `updateTenant` | `id: string, input: TenantInput` | `Promise<void>` | Updates tenant, shows toast, refreshes list |
| `deleteTenant` | `id: string` | `Promise<void>` | Deletes tenant, shows toast, refreshes list |

| Property | Type | Description |
|----------|------|-------------|
| `tenants` | `Tenant[]` | Current list of tenants (sorted) |
| `isLoading` | `boolean` | True during data fetch |
| `error` | `Error \| null` | Error state if operation fails |

---

## Testing

### Unit Tests

```bash
# Run unit tests for domain logic
pnpm test src/app/tenants/core/TenantLogic.test.ts

# Run repository tests
pnpm test src/app/tenants/repositories/InMemoryTenantRepository.test.ts
```

### Integration Tests

```bash
# Run hook integration tests
pnpm test src/app/tenants/hooks/UseTenantManagement.test.ts
```

### E2E Tests

```bash
# Run end-to-end tests for full CRUD flow
pnpm test:e2e tests/e2e/tenant-management.spec.ts
```

**Test Coverage Goals**:
- Unit tests: 100% coverage for core logic
- Integration tests: All repository operations
- E2E tests: Complete CRUD user flow

---

## Troubleshooting

### Issue: Blank Page or Errors

**Solution**:
1. Check browser console for errors
2. Verify all dependencies installed: `pnpm install`
3. Clear Next.js cache: `rm -rf .next && pnpm dev`
4. Check TypeScript errors: `pnpm tsc --noEmit`

### Issue: Toast Notifications Not Appearing

**Solution**:
1. Verify sonner is installed: `pnpm list sonner`
2. Check `<Toaster />` component is in layout
3. Import toast correctly: `import { toast } from 'sonner'`

### Issue: Mock Data Not Appearing

**Solution**:
1. Check repository is instantiated with seed data
2. Verify `InMemoryTenantRepository.seedMockData()` is called in constructor
3. Check browser console for repository errors

### Issue: Form Validation Not Working

**Solution**:
1. Verify Zod schemas are imported correctly
2. Check `TenantInputSchema.parse()` is called before submission
3. Ensure error messages are displayed in UI

---

## Environment Variables

**Not Required** - This feature uses in-memory mock data with no external API calls.

For future production API integration, add:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

---

## Performance Optimization

### Bundle Size

The feature adds ~33KB gzipped to the bundle:
- sonner: 13KB
- @radix-ui/react-dialog: 12KB
- @radix-ui/react-alert-dialog: 8KB

**Total Impact**: Minimal (< 1% of typical Next.js app)

### Loading Performance

- Table render: < 200ms for 100 items
- Modal open/close: < 100ms
- Form validation: < 50ms (instant)
- Toast display: < 100ms

### Accessibility Performance

- WCAG 2.1 AA compliant
- Keyboard navigation: Full support
- Screen reader: Semantic HTML + ARIA labels

---

## Next Steps

After completing the quickstart:

1. ✅ Feature is running successfully
2. ⏭️ Customize UI styling with Tailwind classes
3. ⏭️ Add additional validation rules (if needed)
4. ⏭️ Integrate with real API (replace InMemoryRepository with ApiRepository)
5. ⏭️ Add advanced features (search, filter, pagination)

---

## Support & Documentation

- **Feature Specification**: `specs/005-tenant-management-crud/spec.md`
- **Implementation Plan**: `specs/005-tenant-management-crud/plan.md`
- **Data Model**: `specs/005-tenant-management-crud/data-model.md`
- **API Contract**: `specs/005-tenant-management-crud/contracts/mock-tenant-api.md`

For questions or issues, refer to the feature specification or implementation plan.
