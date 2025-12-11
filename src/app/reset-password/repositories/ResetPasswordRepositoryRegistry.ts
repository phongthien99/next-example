import { IResetPasswordRepository } from './IResetPasswordRepository';
import { ApiResetPasswordRepository } from './ApiResetPasswordRepository';

/**
 * Registry for password reset repository implementations
 * Factory pattern for creating repository instances
 */
export class ResetPasswordRepositoryRegistry {
  /**
   * Gets a repository implementation based on type
   * @param type - Repository type ('api' for production)
   * @returns Repository instance
   */
  static getRepository(type: 'api' = 'api'): IResetPasswordRepository {
    switch (type) {
      case 'api':
        return new ApiResetPasswordRepository();
      default:
        throw new Error(`Unknown repository type: ${type}`);
    }
  }
}
