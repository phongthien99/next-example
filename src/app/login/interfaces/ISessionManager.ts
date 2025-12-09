import { AuthSession } from '../entities/AuthSession';

/**
 * Interface for Session Management
 * Handles session retrieval and validation
 */
export interface ISessionManager {
  /**
   * Get current session if exists
   */
  getCurrentSession(): AuthSession | null;

  /**
   * Check if session is valid
   */
  isSessionValid?(): boolean;
}
