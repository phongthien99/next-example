/**
 * Tenant Business Logic
 * Pure functions for tenant validation and entity creation
 */
import { TenantInputSchema, TenantInput } from '../dto/TenantTypes';
import { Tenant } from '../models/Tenant';
import { generateUUID } from '@/lib/uuid';

/**
 * Validates tenant input data using Zod schema
 * @param input - Unknown input to validate
 * @returns Validated TenantInput
 * @throws ZodError if validation fails
 */
export function validateTenantInput(input: unknown): TenantInput {
  return TenantInputSchema.parse(input);
}

/**
 * Creates a new Tenant entity with auto-generated ID and timestamps
 * @param input - Validated tenant input data
 * @returns New Tenant entity
 */
export function createTenantEntity(input: TenantInput): Tenant {
  const now = new Date();
  return {
    id: generateUUID(),
    name: input.name,
    created_at: now,
    updated_at: now,
  };
}
