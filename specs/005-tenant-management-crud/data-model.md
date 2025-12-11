# Data Model: Tenant Management CRUD

**Feature**: Tenant Management CRUD
**Date**: 2025-12-10
**Phase**: Phase 1 - Data Model Design

## Overview

This document defines the data entities, relationships, and validation rules for the Tenant Management feature. The model follows Clean Architecture principles with clear separation between Domain Models (business entities) and DTOs (data transfer objects).

---

## Domain Model

### Tenant Entity

**Purpose**: Represents an organization or customer in the system.

**Attributes**:

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| id | string (UUID) | Required, readonly, unique | Unique identifier for the tenant (RFC 4122 v4) |
| name | string | Required, 1-255 characters | Organization name |
| created_at | Date | Required, readonly | Timestamp when tenant was created |
| updated_at | Date | Required, readonly | Timestamp when tenant was last modified |

**TypeScript Interface**:

```typescript
/**
 * Tenant Domain Model
 *
 * Represents an organization or customer entity in the domain layer.
 * Immutable after creation except for name and updated_at.
 */
export interface Tenant {
  /**
   * Unique identifier (UUID v4)
   * Auto-generated on creation, never changes
   */
  id: string;

  /**
   * Organization name
   * Required, 1-255 characters, trimmed
   */
  name: string;

  /**
   * Creation timestamp
   * Auto-generated on creation, never changes
   */
  created_at: Date;

  /**
   * Last update timestamp
   * Auto-generated on creation, updated on every modification
   */
  updated_at: Date;
}
```

**Invariants** (Domain Rules):

1. `id` MUST be a valid UUID v4 format
2. `id` MUST be unique across all tenants
3. `id` is immutable after creation
4. `name` MUST NOT be empty or whitespace-only
5. `name` MUST be trimmed (no leading/trailing whitespace)
6. `name` length MUST be between 1 and 255 characters
7. `created_at` is immutable after creation
8. `updated_at` MUST be greater than or equal to `created_at`
9. `updated_at` MUST be updated whenever `name` changes

**Business Rules**:

- Tenants are soft-deleted (permanently removed from system)
- No tenant name uniqueness constraint (multiple tenants can have same name)
- Tenant creation auto-generates `id`, `created_at`, and `updated_at`
- Tenant update only allows changing `name`, auto-updates `updated_at`

---

## Data Transfer Objects (DTOs)

### TenantInput

**Purpose**: Validates and structures data for creating or updating a tenant.

**Zod Schema**:

```typescript
import { z } from 'zod';

/**
 * TenantInput Schema
 *
 * Validates input for creating or updating a tenant.
 * Used at the boundary between presentation and application layers.
 */
export const TenantInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tenant name is required')
    .max(255, 'Tenant name must be less than 255 characters'),
});

/**
 * Inferred TypeScript type from TenantInputSchema
 */
export type TenantInput = z.infer<typeof TenantInputSchema>;
```

**Validation Rules**:

| Field | Validation | Error Message |
|-------|------------|---------------|
| name | Required | "Tenant name is required" |
| name | Min length 1 (after trim) | "Tenant name is required" |
| name | Max length 255 | "Tenant name must be less than 255 characters" |
| name | Auto-trimmed | N/A (silent transformation) |

**Usage**:

```typescript
// Valid input
const validInput: TenantInput = {
  name: 'Acme Corporation',
};

// Parsing with validation
const parseResult = TenantInputSchema.safeParse({ name: '  Acme Corp  ' });
if (parseResult.success) {
  console.log(parseResult.data.name); // "Acme Corp" (trimmed)
}

// Invalid input (too long)
const invalidInput = {
  name: 'A'.repeat(256), // 256 characters
};
const result = TenantInputSchema.safeParse(invalidInput);
console.log(result.error); // ZodError with message
```

---

### TenantSchema (Domain Validation)

**Purpose**: Validates tenant entities at the domain layer (e.g., after repository operations).

**Zod Schema**:

```typescript
import { z } from 'zod';

/**
 * UUID v4 validation pattern
 */
const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * TenantSchema
 *
 * Validates complete tenant entities including all fields.
 * Used for validating data from repositories or external sources.
 */
export const TenantSchema = z.object({
  id: z.string().uuid().regex(uuidV4Regex, 'Invalid UUID v4 format'),
  name: z.string().min(1).max(255),
  created_at: z.date(),
  updated_at: z.date(),
}).refine(
  (data) => data.updated_at >= data.created_at,
  {
    message: 'updated_at must be greater than or equal to created_at',
    path: ['updated_at'],
  }
);

/**
 * Inferred TypeScript type from TenantSchema
 */
export type TenantData = z.infer<typeof TenantSchema>;
```

**Validation Rules**:

| Field | Validation | Error Message |
|-------|------------|---------------|
| id | UUID format | "Invalid uuid" |
| id | UUID v4 specific | "Invalid UUID v4 format" |
| name | Min length 1 | "String must contain at least 1 character(s)" |
| name | Max length 255 | "String must contain at most 255 character(s)" |
| created_at | Date type | "Expected date, received ..." |
| updated_at | Date type | "Expected date, received ..." |
| updated_at | >= created_at | "updated_at must be greater than or equal to created_at" |

---

## Repository Interface

### ITenantRepository

**Purpose**: Defines the contract for tenant data access operations (Dependency Inversion Principle).

**Interface Definition**:

```typescript
import { Tenant } from '../models/Tenant';
import { TenantInput } from '../dto/TenantTypes';

/**
 * ITenantRepository Interface
 *
 * Repository interface for tenant CRUD operations.
 * Implements Dependency Inversion Principle (DIP) - high-level modules
 * depend on this abstraction, not concrete implementations.
 *
 * Implementations:
 * - InMemoryTenantRepository: In-memory mock with simulated latency
 * - MockApiTenantRepository: Simulated API with error scenarios
 */
export interface ITenantRepository {
  /**
   * Retrieve all tenants
   *
   * @returns Array of all tenants, sorted by created_at (newest first)
   * @throws RepositoryError if data access fails
   */
  getTenants(): Promise<Tenant[]>;

  /**
   * Retrieve a single tenant by ID
   *
   * @param id - Tenant UUID
   * @returns Tenant if found, null if not found
   * @throws RepositoryError if data access fails
   */
  getTenantById(id: string): Promise<Tenant | null>;

  /**
   * Create a new tenant
   *
   * @param input - Validated tenant input (name only)
   * @returns Created tenant with auto-generated id and timestamps
   * @throws ValidationError if input is invalid
   * @throws RepositoryError if creation fails
   */
  createTenant(input: TenantInput): Promise<Tenant>;

  /**
   * Update an existing tenant
   *
   * @param id - Tenant UUID to update
   * @param input - Validated tenant input (name only)
   * @returns Updated tenant with refreshed updated_at timestamp
   * @throws NotFoundError if tenant doesn't exist
   * @throws ValidationError if input is invalid
   * @throws RepositoryError if update fails
   */
  updateTenant(id: string, input: TenantInput): Promise<Tenant>;

  /**
   * Delete a tenant permanently
   *
   * @param id - Tenant UUID to delete
   * @returns void on success
   * @throws NotFoundError if tenant doesn't exist
   * @throws RepositoryError if deletion fails
   */
  deleteTenant(id: string): Promise<void>;
}
```

**Error Types**:

```typescript
/**
 * Base repository error
 */
export class RepositoryError extends Error {
  constructor(message: string, public code: string = 'REPOSITORY_ERROR') {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Tenant not found error
 */
export class NotFoundError extends RepositoryError {
  constructor(tenantId: string) {
    super(`Tenant not found: ${tenantId}`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends RepositoryError {
  constructor(message: string, public errors: Record<string, string[]> = {}) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

---

## Entity Relationships

**Tenant Management Feature** (isolated, no relationships):

```
┌─────────────────┐
│     Tenant      │
│─────────────────│
│ id (PK)         │
│ name            │
│ created_at      │
│ updated_at      │
└─────────────────┘

Legend:
  PK = Primary Key
  No foreign keys (isolated entity)
```

**Future Considerations** (not in current scope):

- Tenant ↔ User relationship (many-to-many)
- Tenant ↔ Subscription relationship (one-to-many)
- Tenant ↔ Resource relationship (one-to-many)

---

## State Transitions

### Tenant Lifecycle

```
┌─────────┐
│ [START] │
└────┬────┘
     │
     │ createTenant(input)
     │ → Auto-generate: id, created_at, updated_at
     ▼
┌─────────────┐
│   CREATED   │ ◄──────┐
│ (Active)    │        │
└──┬──────┬───┘        │
   │      │            │
   │      │ updateTenant(id, input)
   │      │ → Refresh: updated_at
   │      │            │
   │      └────────────┘
   │
   │ deleteTenant(id)
   │ → Permanent removal
   ▼
┌─────────┐
│ DELETED │
│ (Final) │
└─────────┘
```

**State Invariants**:

- **CREATED**: Tenant exists with valid id, name, created_at, updated_at
- **DELETED**: Tenant no longer exists, all references removed
- No intermediate states (no draft, pending, archived, etc.)

---

## Data Persistence Strategy

### In-Memory Repository (Development/Testing)

**Storage**: JavaScript `Map<string, Tenant>`

**Characteristics**:
- Fast lookups by ID: O(1)
- Data lost on page refresh (ephemeral)
- Simulated latency: 100-300ms
- No pagination (all data loaded at once)
- Sorted by created_at (newest first) on retrieval

**Implementation Notes**:

```typescript
class InMemoryTenantRepository implements ITenantRepository {
  private tenants: Map<string, Tenant> = new Map();

  constructor() {
    // Seed with sample data for development
    this.seedData();
  }

  private seedData(): void {
    const sampleTenants: Tenant[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Acme Corporation',
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'TechStart Inc.',
        created_at: new Date('2024-02-20T14:15:00Z'),
        updated_at: new Date('2024-03-10T09:45:00Z'),
      },
    ];

    sampleTenants.forEach((tenant) => {
      this.tenants.set(tenant.id, tenant);
    });
  }
}
```

### Future: API Repository (Production)

**Storage**: External REST API

**Characteristics**:
- Real network latency
- Persistent across sessions
- Server-side validation
- Error handling for network issues
- Possible pagination support

---

## Validation Summary

### Client-Side Validation (Presentation Layer)

```typescript
// Form validation with Zod
const result = TenantInputSchema.safeParse(formData);
if (!result.success) {
  // Display field-level errors
  const errors = result.error.flatten().fieldErrors;
  console.log(errors.name); // ["Tenant name is required"]
}
```

### Domain Layer Validation (Business Logic)

```typescript
// Domain entity validation
export function validateTenant(tenant: unknown): Tenant {
  const result = TenantSchema.parse(tenant);
  return result; // Throws ZodError if invalid
}
```

### Repository Layer Validation (Data Access)

```typescript
// Validate before persistence
async createTenant(input: TenantInput): Promise<Tenant> {
  // Input already validated by Zod schema at boundary
  const tenant: Tenant = {
    id: generateUUID(),
    name: input.name.trim(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  // Validate domain entity before storing
  const validatedTenant = validateTenant(tenant);

  this.tenants.set(validatedTenant.id, validatedTenant);
  return validatedTenant;
}
```

---

## Next Steps

1. ✅ Data model defined
2. ⏭️ Define API contracts (contracts/mock-tenant-api.md)
3. ⏭️ Create quickstart guide (quickstart.md)
4. ⏭️ Update agent context (CLAUDE.md)
5. ⏭️ Generate implementation tasks (/speckit.tasks)
