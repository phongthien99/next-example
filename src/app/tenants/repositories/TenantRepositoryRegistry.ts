/**
 * Repository Registry: Factory for obtaining repository instances
 * Centralizes repository instantiation logic
 */
import { ITenantRepository } from './ITenantRepository';
import { InMemoryTenantRepository } from './InMemoryTenantRepository';
import { SupabaseTenantRepository } from './SupabaseTenantRepository';

export type RepositoryType = 'memory' | 'supabase';

export class TenantRepositoryRegistry {
  /**
   * Factory method to get repository instance by type
   * @param type - Repository type ('memory' for in-memory, 'supabase' for Supabase)
   * @returns ITenantRepository instance
   */
  static getRepository(type: RepositoryType = 'memory'): ITenantRepository {
    switch (type) {
      case 'memory':
        return new InMemoryTenantRepository();
      case 'supabase':
        return new SupabaseTenantRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
