import { IAuthRepository } from '../interfaces/IAuthRepository';
import { ApiAuthRepository } from './ApiAuthRepository';
import { LocalStorageAuthRepository } from './LocalStorageAuthRepository';
import { SupabaseAuthRepository } from './SupabaseAuthRepository';

/**
 * Repository type enumeration
 * Defines all available authentication repository implementations
 */
export type AuthRepositoryType = 'api' | 'localStorage' | 'supabase';

/**
 * AuthRepositoryRegistry - Factory Pattern
 *
 * Registry pattern for repository selection.
 * Allows switching between API, localStorage, and Supabase implementations.
 *
 * Features:
 * - Static factory method for repository creation
 * - Type-safe repository selection
 * - Environment-based default selection
 * - Extensible for future implementations
 */
export class AuthRepositoryRegistry {
  /**
   * Get repository implementation based on type
   *
   * @param type - Type of repository ('api' | 'localStorage' | 'supabase')
   * @returns Repository instance implementing IAuthRepository
   *
   * @example
   * ```typescript
   * const repo = AuthRepositoryRegistry.getRepository('supabase');
   * await repo.login({ email, password });
   * ```
   */
  static getRepository(type?: AuthRepositoryType): IAuthRepository {
    const repoType = type || this.getDefaultType();

    switch (repoType) {
      case 'api':
        return new ApiAuthRepository();

      case 'localStorage':
        return new LocalStorageAuthRepository();

      case 'supabase':
        return new SupabaseAuthRepository();

      default:
        // Fallback to API in production, localStorage in development
        return process.env.NODE_ENV === 'production'
          ? new ApiAuthRepository()
          : new LocalStorageAuthRepository();
    }
  }

  /**
   * Get default repository type from environment
   * Priority: NEXT_PUBLIC_AUTH_REPO_TYPE > localStorage > NODE_ENV
   */
  private static getDefaultType(): AuthRepositoryType {
    // 1. Check environment variable
    const envType = process.env.NEXT_PUBLIC_AUTH_REPO_TYPE as AuthRepositoryType;
    if (envType && this.isValidType(envType)) {
      return envType;
    }

    // 2. Check localStorage (runtime switching - client-side only)
    if (typeof window !== 'undefined') {
      const storedType = localStorage.getItem('auth_repository_type') as AuthRepositoryType;
      if (storedType && this.isValidType(storedType)) {
        return storedType;
      }
    }

    // 3. Default based on environment
    return process.env.NODE_ENV === 'production' ? 'api' : 'localStorage';
  }

  /**
   * Validate repository type
   */
  private static isValidType(type: string): type is AuthRepositoryType {
    return ['api', 'localStorage', 'supabase'].includes(type);
  }
}
