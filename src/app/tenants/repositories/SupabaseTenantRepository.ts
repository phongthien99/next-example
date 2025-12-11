/**
 * Supabase Tenant Repository Implementation
 * Infrastructure Layer: Data access using Supabase
 */
import { supabase } from '@/lib/supabase/client';
import { ITenantRepository } from './ITenantRepository';
import { Tenant } from '../models/Tenant';
import { TenantInput } from '../dto/TenantTypes';
import { generateUUID } from '@/lib/uuid';

/**
 * SupabaseTenantRepository
 *
 * Implements ITenantRepository using Supabase as the data source.
 * Provides real database operations with CRUD functionality.
 *
 * Database Table Schema:
 * - id: UUID (primary key, auto-generated)
 * - name: TEXT (not null)
 * - created_at: TIMESTAMPTZ (auto-generated)
 * - updated_at: TIMESTAMPTZ (auto-updated via trigger)
 */
export class SupabaseTenantRepository implements ITenantRepository {
  private readonly tableName = 'tenants';

  /**
   * Retrieve all tenants from Supabase
   * @returns Array of all tenants, sorted by created_at (newest first)
   * @throws Error if database query fails
   */
  async getTenants(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch tenants: ${error.message}`);
    }

    // Convert Supabase rows to Tenant domain models
    return (data || []).map(this.mapRowToTenant);
  }

  /**
   * Retrieve a single tenant by ID from Supabase
   * @param id - Tenant UUID
   * @returns Tenant if found, null if not found
   * @throws Error if database query fails
   */
  async getTenantById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found error
        return null;
      }
      throw new Error(`Failed to fetch tenant: ${error.message}`);
    }

    return this.mapRowToTenant(data);
  }

  /**
   * Create a new tenant in Supabase
   * @param input - Validated tenant input (name only)
   * @returns Created tenant with auto-generated id and timestamps
   * @throws Error if database insert fails
   */
  async createTenant(input: TenantInput): Promise<Tenant> {
    const now = new Date().toISOString();
    const newTenant = {
      id: generateUUID(),
      name: input.name.trim(),
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(newTenant)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create tenant: ${error.message}`);
    }

    return this.mapRowToTenant(data);
  }

  /**
   * Update an existing tenant in Supabase
   * @param id - Tenant UUID to update
   * @param input - Validated tenant input (name only)
   * @returns Updated tenant with refreshed updated_at timestamp
   * @throws Error if tenant doesn't exist or database update fails
   */
  async updateTenant(id: string, input: TenantInput): Promise<Tenant> {
    const updateData = {
      name: input.name.trim(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error(`Tenant not found: ${id}`);
      }
      throw new Error(`Failed to update tenant: ${error.message}`);
    }

    return this.mapRowToTenant(data);
  }

  /**
   * Delete a tenant from Supabase
   * @param id - Tenant UUID to delete
   * @returns void on success
   * @throws Error if tenant doesn't exist or database delete fails
   */
  async deleteTenant(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete tenant: ${error.message}`);
    }
  }

  /**
   * Map Supabase row to Tenant domain model
   * Converts ISO date strings to Date objects
   */
  private mapRowToTenant(row: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  }): Tenant {
    return {
      id: row.id,
      name: row.name,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
