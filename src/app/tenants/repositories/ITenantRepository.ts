/**
 * Repository Interface: ITenantRepository
 * Defines the contract for tenant data access operations
 * Follows Repository Pattern and Dependency Inversion Principle
 */
import { Tenant } from '../models/Tenant';
import { TenantInput } from '../dto/TenantTypes';

export interface ITenantRepository {
  /**
   * Retrieves all tenants
   * @returns Promise resolving to array of tenants
   */
  getTenants(): Promise<Tenant[]>;

  /**
   * Retrieves a single tenant by ID
   * @param id - Tenant UUID
   * @returns Promise resolving to tenant or null if not found
   */
  getTenantById(id: string): Promise<Tenant | null>;

  /**
   * Creates a new tenant
   * @param input - Tenant creation data
   * @returns Promise resolving to created tenant
   */
  createTenant(input: TenantInput): Promise<Tenant>;

  /**
   * Updates an existing tenant
   * @param id - Tenant UUID
   * @param input - Tenant update data
   * @returns Promise resolving to updated tenant
   */
  updateTenant(id: string, input: TenantInput): Promise<Tenant>;

  /**
   * Deletes a tenant
   * @param id - Tenant UUID
   * @returns Promise resolving when deletion is complete
   */
  deleteTenant(id: string): Promise<void>;
}
