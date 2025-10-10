import { SignupInput } from '../dto/SignupTypes';
import { User } from '../models/User';

/**
 * ISignupRepository Interface
 *
 * Repository interface for signup operations.
 * Implements Dependency Inversion Principle (DIP) - high-level modules
 * depend on this abstraction, not concrete implementations.
 *
 * Implementations:
 * - ApiSignupRepository: External API
 * - LocalStorageSignupRepository: Browser localStorage
 */
export interface ISignupRepository {
  /**
   * Register a new user
   *
   * @param input - Validated signup input
   * @returns Created user entity
   * @throws DuplicateEmailError if email already exists
   * @throws SignupAPIError if API request fails
   */
  signup(input: SignupInput): Promise<User>;

  /**
   * Check if email already exists in system
   *
   * @param email - Email address to check
   * @returns true if email exists, false otherwise
   */
  checkEmailExists(email: string): Promise<boolean>;
}
