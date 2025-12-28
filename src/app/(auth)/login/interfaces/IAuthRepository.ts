import { LoginInput } from "../dto/LoginTypes";
import { AuthSession } from "../entities/AuthSession";

/**
 * Interface for Authentication Repository
 * Defines the contract for authentication data sources
 */
export interface IAuthRepository {
  /**
   * Login user and return session
   */
  login(input: LoginInput): Promise<AuthSession>;

  /**
   * Logout user
   */
  logout(): Promise<void>;

  /**
   * Get current session (if exists)
   */
  getCurrentSession(): AuthSession | null;

  /**
   * Refresh authentication token
   */
  refreshToken?(token: string): Promise<AuthSession>;
}
