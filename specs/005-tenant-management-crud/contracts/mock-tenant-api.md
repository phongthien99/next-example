# Mock Tenant Repository Contract

**Feature**: Tenant Management CRUD
**Date**: 2025-12-10
**Phase**: Phase 1 - Repository Contract Definition
**Type**: In-Memory Mock Repository

## Overview

This document defines the mock repository contract for Tenant CRUD operations. The implementation uses an in-memory Map for data storage with pre-seeded mock data and simulated network latency.

**Implementation Strategy**: Repository Pattern with In-Memory Storage
- Data stored in JavaScript `Map<string, Tenant>`
- Pre-seeded with realistic mock tenants
- Simulated latency (100-300ms) for realistic UX testing
- State persists during session, lost on refresh
- No external API calls or network dependencies

---

## Repository Interface

```typescript
interface ITenantRepository {
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | null>;
  createTenant(input: TenantInput): Promise<Tenant>;
  updateTenant(id: string, input: TenantInput): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
}
```

---

## Mock Data Storage

### In-Memory Store Structure

```typescript
class InMemoryTenantRepository implements ITenantRepository {
  // Storage: Map for O(1) lookups
  private tenants: Map<string, Tenant> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData(): void {
    const mockTenants: Tenant[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Acme Corporation',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'TechStart Inc.',
        created_at: new Date('2024-02-20T14:15:00Z'),
        updated_at: new Date('2024-03-10T09:45:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Global Solutions Ltd',
        created_at: new Date('2024-03-05T08:00:00Z'),
        updated_at: new Date('2024-03-05T08:00:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Innovation Labs',
        created_at: new Date('2024-04-12T16:20:00Z'),
        updated_at: new Date('2024-04-12T16:20:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Digital Ventures LLC',
        created_at: new Date('2024-05-08T11:00:00Z'),
        updated_at: new Date('2024-06-01T14:30:00Z'),
      },
    ];

    mockTenants.forEach((tenant) => {
      this.tenants.set(tenant.id, tenant);
    });
  }
}
```

**Mock Data Characteristics**:
- **5 pre-seeded tenants** for immediate testing
- **Realistic names**: Corporate, startup, LLC variations
- **Varied timestamps**: Different creation dates for sorting tests
- **Updated records**: Some tenants have different updated_at (e.g., TechStart Inc., Digital Ventures)
- **Valid UUIDs**: All IDs are valid RFC 4122 v4 UUIDs

---

## Repository Operations

### 1. getTenants()

**Returns**: All tenants sorted by creation date (newest first)

```typescript
async getTenants(): Promise<Tenant[]> {
  await this.simulateLatency();

  return Array.from(this.tenants.values()).sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  );
}
```

**Behavior**:
- Retrieves all tenants from Map
- Sorts by `created_at` descending (newest first)
- Returns empty array if no tenants
- Simulated latency: 100-300ms

**Example Response**:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "name": "Digital Ventures LLC",
    "created_at": "2024-05-08T11:00:00.000Z",
    "updated_at": "2024-06-01T14:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "name": "Innovation Labs",
    "created_at": "2024-04-12T16:20:00.000Z",
    "updated_at": "2024-04-12T16:20:00.000Z"
  }
  // ... 3 more tenants
]
```

---

### 2. getTenantById(id)

**Returns**: Single tenant or null if not found

```typescript
async getTenantById(id: string): Promise<Tenant | null> {
  await this.simulateLatency();

  return this.tenants.get(id) || null;
}
```

**Behavior**:
- Fast O(1) lookup in Map
- Returns null (not error) if tenant doesn't exist
- Simulated latency: 100-300ms

---

### 3. createTenant(input)

**Creates**: New tenant with auto-generated ID and timestamps

```typescript
async createTenant(input: TenantInput): Promise<Tenant> {
  await this.simulateLatency();

  // Validate input with Zod
  const validated = TenantInputSchema.parse(input);

  const tenant: Tenant = {
    id: crypto.randomUUID(), // Native browser API
    name: validated.name,
    created_at: new Date(),
    updated_at: new Date(),
  };

  this.tenants.set(tenant.id, tenant);
  return tenant;
}
```

**Behavior**:
- Validates input with Zod schema
- Generates UUID v4 using native `crypto.randomUUID()`
- Sets `created_at` and `updated_at` to current time
- Stores in Map
- Simulated latency: 100-300ms

**Example Input**:
```json
{
  "name": "New Tenant Corp"
}
```

**Example Response**:
```json
{
  "id": "a3bb189e-8bf9-3888-9912-ace4e6543002",
  "name": "New Tenant Corp",
  "created_at": "2024-12-10T15:45:30.123Z",
  "updated_at": "2024-12-10T15:45:30.123Z"
}
```

---

### 4. updateTenant(id, input)

**Updates**: Existing tenant name and refreshes updated_at

```typescript
async updateTenant(id: string, input: TenantInput): Promise<Tenant> {
  await this.simulateLatency();

  const existing = this.tenants.get(id);
  if (!existing) {
    throw new NotFoundError(id);
  }

  const validated = TenantInputSchema.parse(input);

  const updated: Tenant = {
    ...existing,
    name: validated.name,
    updated_at: new Date(),
  };

  this.tenants.set(id, updated);
  return updated;
}
```

**Behavior**:
- Validates input with Zod schema
- Throws `NotFoundError` if tenant doesn't exist
- Updates only `name` and `updated_at`
- `id` and `created_at` remain unchanged
- Simulated latency: 100-300ms

**Example Input**:
```json
{
  "name": "Updated Tenant Name"
}
```

**Example Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Updated Tenant Name",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-12-10T15:50:15.456Z"
}
```

---

### 5. deleteTenant(id)

**Deletes**: Tenant permanently from storage

```typescript
async deleteTenant(id: string): Promise<void> {
  await this.simulateLatency();

  if (!this.tenants.has(id)) {
    throw new NotFoundError(id);
  }

  this.tenants.delete(id);
}
```

**Behavior**:
- Throws `NotFoundError` if tenant doesn't exist
- Permanently removes from Map
- Returns void (no response body)
- Simulated latency: 100-300ms

---

## Simulated Network Latency

```typescript
private async simulateLatency(): Promise<void> {
  const delay = Math.random() * 200 + 100; // 100-300ms
  return new Promise((resolve) => setTimeout(resolve, delay));
}
```

**Purpose**:
- Test loading states and spinners
- Realistic user experience
- Prevent UI race conditions
- Validate optimistic updates

---

## Error Handling

### Error Classes

```typescript
export class NotFoundError extends Error {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`);
    this.name = 'NotFoundError';
  }
}
```

### Error Scenarios

| Operation | Error Type | Condition | Message |
|-----------|-----------|-----------|---------|
| `createTenant` | ValidationError | Empty name | "Tenant name is required" |
| `createTenant` | ValidationError | Name > 255 chars | "Tenant name must be less than 255 characters" |
| `updateTenant` | NotFoundError | Tenant doesn't exist | "Tenant not found: {id}" |
| `updateTenant` | ValidationError | Invalid input | Zod validation message |
| `deleteTenant` | NotFoundError | Tenant doesn't exist | "Tenant not found: {id}" |

---

## Testing with Mock Data

### Initial State

After instantiation, repository contains 5 pre-seeded tenants:

```typescript
await repository.getTenants();
// Returns 5 tenants sorted by created_at desc
```

### CRUD Flow Test

```typescript
// 1. List initial tenants
const initial = await repository.getTenants();
console.log(initial.length); // 5

// 2. Create new tenant
const created = await repository.createTenant({ name: 'Test Corp' });
console.log(created.id); // Generated UUID

// 3. Verify creation
const all = await repository.getTenants();
console.log(all.length); // 6

// 4. Update tenant
const updated = await repository.updateTenant(created.id, {
  name: 'Updated Test Corp',
});
console.log(updated.name); // "Updated Test Corp"
console.log(updated.updated_at > updated.created_at); // true

// 5. Delete tenant
await repository.deleteTenant(created.id);

// 6. Verify deletion
const final = await repository.getTenants();
console.log(final.length); // 5 (back to initial)
```

---

## Complete Implementation

```typescript
import { ITenantRepository } from './ITenantRepository';
import { Tenant } from '../models/Tenant';
import { TenantInput, TenantInputSchema } from '../dto/TenantTypes';

export class InMemoryTenantRepository implements ITenantRepository {
  private tenants: Map<string, Tenant> = new Map();

  constructor() {
    this.seedMockData();
  }

  private seedMockData(): void {
    const mockTenants: Tenant[] = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Acme Corporation',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'TechStart Inc.',
        created_at: new Date('2024-02-20T14:15:00Z'),
        updated_at: new Date('2024-03-10T09:45:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Global Solutions Ltd',
        created_at: new Date('2024-03-05T08:00:00Z'),
        updated_at: new Date('2024-03-05T08:00:00Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Innovation Labs',
        created_at: new Date('2024-04-12T16:20:00Z'),
        updated_at: new Date('2024-04-12T16:20:00.000Z'),
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Digital Ventures LLC',
        created_at: new Date('2024-05-08T11:00:00Z'),
        updated_at: new Date('2024-06-01T14:30:00Z'),
      },
    ];

    mockTenants.forEach((tenant) => {
      this.tenants.set(tenant.id, tenant);
    });
  }

  private async simulateLatency(): Promise<void> {
    const delay = Math.random() * 200 + 100;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  async getTenants(): Promise<Tenant[]> {
    await this.simulateLatency();
    return Array.from(this.tenants.values()).sort(
      (a, b) => b.created_at.getTime() - a.created_at.getTime()
    );
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    await this.simulateLatency();
    return this.tenants.get(id) || null;
  }

  async createTenant(input: TenantInput): Promise<Tenant> {
    await this.simulateLatency();

    const validated = TenantInputSchema.parse(input);

    const tenant: Tenant = {
      id: crypto.randomUUID(),
      name: validated.name,
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

    const validated = TenantInputSchema.parse(input);

    const updated: Tenant = {
      ...existing,
      name: validated.name,
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

---

## Next Steps

1. ✅ Repository contract defined with mock data
2. ⏭️ Create quickstart guide (quickstart.md)
3. ⏭️ Update agent context (CLAUDE.md)
4. ⏭️ Generate implementation tasks (/speckit.tasks)
