import { ISignupRepository } from './ISignupRepository';
import { ApiSignupRepository } from './ApiSignupRepository';
import { LocalStorageSignupRepository } from './LocalStorageSignupRepository';

/**
 * SignupRepositoryRegistry
 *
 * Factory class that selects the appropriate repository implementation
 * based on the requested type.
 *
 * This implements the Registry pattern for repository selection.
 */
export class SignupRepositoryRegistry {
  /**
   * Get repository implementation based on type
   *
   * @param type - Type of repository ('api' or 'localStorage')
   * @returns Repository instance implementing ISignupRepository
   */
  static getRepository(type: 'api' | 'localStorage'): ISignupRepository {
    switch (type) {
      case 'api':
        return new ApiSignupRepository();
      case 'localStorage':
        return new LocalStorageSignupRepository();
      default:
        // Default to API repository
        return new ApiSignupRepository();
    }
  }
}
