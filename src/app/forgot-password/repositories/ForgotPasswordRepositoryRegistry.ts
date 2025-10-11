import { IForgotPasswordRepository } from './IForgotPasswordRepository';
import { ApiForgotPasswordRepository } from './ApiForgotPasswordRepository';
import { LocalStorageForgotPasswordRepository } from './LocalStorageForgotPasswordRepository';

type RepositoryType = 'api' | 'localStorage';

/**
 * ForgotPasswordRepositoryRegistry - Factory Pattern
 *
 * Registry pattern for repository selection.
 * Allows switching between API and localStorage implementations.
 */
export class ForgotPasswordRepositoryRegistry {
  static getRepository(type: RepositoryType = 'api'): IForgotPasswordRepository {
    switch (type) {
      case 'api':
        return new ApiForgotPasswordRepository();
      case 'localStorage':
        return new LocalStorageForgotPasswordRepository();
      default:
        return new ApiForgotPasswordRepository();
    }
  }
}
