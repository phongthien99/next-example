import { ISignupRepository } from './ISignupRepository';
import { ApiSignupRepository } from './ApiSignupRepository';
import { LocalStorageSignupRepository } from './LocalStorageSignupRepository';
import { SupabaseSignupRepository } from './SupabaseSignupRepository';

/**
 * Repository type enumeration
 * Defines all available signup repository implementations
 */
export type SignupRepositoryType = 'api' | 'localStorage' | 'supabase';

/**
 * SignupRepositoryRegistry
 *
 * Factory class that selects the appropriate repository implementation
 * based on the requested type.
 *
 * This implements the Registry pattern for repository selection.
 *
 * Features:
 * - Static factory method for repository creation
 * - Type-safe repository selection
 * - Extensible for future implementations (supabase, firebase, etc.)
 */
export class SignupRepositoryRegistry {
  /**
   * Get repository implementation based on type
   *
   * @param type - Type of repository ('api' | 'localStorage' | 'supabase')
   * @returns Repository instance implementing ISignupRepository
   *
   * @example
   * ```typescript
   * const repo = SignupRepositoryRegistry.getRepository('supabase');
   * await repo.signup({ name, email });
   * ```
   */
  static getRepository(type: SignupRepositoryType): ISignupRepository {
    switch (type) {
      case 'api':
        return new ApiSignupRepository();

      case 'localStorage':
        return new LocalStorageSignupRepository();

      case 'supabase':
        return new SupabaseSignupRepository();

      default:
        // Default to API repository
        return new ApiSignupRepository();
    }
  }
}
