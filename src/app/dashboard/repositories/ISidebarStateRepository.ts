/**
 * Infrastructure Layer - Sidebar State Repository Interface
 *
 * This interface defines the contract for sidebar state persistence.
 * Following Clean Architecture's Dependency Inversion Principle (DIP),
 * the domain layer depends on this interface, not on concrete implementations.
 *
 * @module ISidebarStateRepository
 */

import { SidebarState } from '../dto/DashboardTypes';

/**
 * Repository interface for sidebar state persistence
 *
 * Implementations:
 * - LocalStorageSidebarStateRepository: Persists to browser localStorage
 * - InMemorySidebarStateRepository: In-memory storage for testing/fallback
 */
export interface ISidebarStateRepository {
  /**
   * Retrieve current sidebar state from storage
   * @returns SidebarState or null if not found or invalid
   */
  getState(): Promise<SidebarState | null>;

  /**
   * Save sidebar state to storage
   * @param state - The sidebar state to persist
   * @throws {Error} If storage operation fails (implementation-specific)
   */
  setState(state: SidebarState): Promise<void>;

  /**
   * Clear sidebar state from storage
   * Should not throw errors - fail silently if removal fails
   */
  clearState(): Promise<void>;

  /**
   * Check if storage mechanism is available
   *
   * Use this to determine if persistence will work before attempting operations.
   * For localStorage: may return false in private browsing, disabled storage, etc.
   *
   * @returns true if storage is available, false otherwise
   */
  isAvailable(): boolean;
}
