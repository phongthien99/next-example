/**
 * Data Transfer Objects and Validation Schemas
 * Defines input/output types and Zod validation for tenant data
 */
import { z } from 'zod';

/**
 * Schema for tenant input (create/update operations)
 * Validates tenant name with trimming, min/max length constraints
 */
export const TenantInputSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name must be 255 characters or less'),
});

/**
 * TypeScript type inferred from TenantInputSchema
 */
export type TenantInput = z.infer<typeof TenantInputSchema>;

/**
 * Complete tenant validation schema including all fields
 * Used for validating full tenant objects with temporal constraints
 */
export const TenantSchema = z
  .object({
    id: z.string().uuid('Invalid tenant ID format'),
    name: z.string().min(1).max(255),
    created_at: z.date(),
    updated_at: z.date(),
  })
  .refine((data) => data.updated_at >= data.created_at, {
    message: 'Updated date must be equal to or after created date',
    path: ['updated_at'],
  });
