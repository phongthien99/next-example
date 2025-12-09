import { AuthSession } from "../entities/AuthSession";

/**
 * Interface for Session Storage Operations
 * Abstracts session persistence logic
 *
 * This separates storage concerns from domain logic,
 * following Single Responsibility Principle
 */
export interface ISessionStorage {
  /**
   * Save session to storage
   */
  save(session: AuthSession): void;

  /**
   * Load session from storage
   */
  load(): AuthSession | null;

  /**
   * Clear session from storage
   */
  clear(): void;

  /**
   * Check if session exists in storage
   */
  exists(): boolean;
}
