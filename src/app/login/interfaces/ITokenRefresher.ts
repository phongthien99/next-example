import { AuthSession } from '../entities/AuthSession';

/**
 * Interface for Token Refresh Operations
 * Handles token refresh logic
 */
export interface ITokenRefresher {
  /**
   * Refresh authentication token
   * @param token - The refresh token
   * @returns New session with fresh tokens
   */
  refreshToken(token: string): Promise<AuthSession>;
}
