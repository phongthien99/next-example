import { LoginInput } from "../dto/LoginTypes";
import { AuthSession } from "../entities/AuthSession";

/**
 * Interface for Authentication Operations
 * Handles login and logout operations
 */
export interface IAuthenticator {
  /**
   * Login user with credentials
   */
  login(input: LoginInput): Promise<AuthSession>;

  /**
   * Logout current user
   */
  logout(): Promise<void>;
}
