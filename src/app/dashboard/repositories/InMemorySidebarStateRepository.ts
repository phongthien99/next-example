/**
 * Infrastructure Layer - In-Memory Sidebar State Repository
 *
 * Concrete implementation of ISidebarStateRepository using in-memory storage.
 * Used as fallback when localStorage is unavailable or for testing purposes.
 *
 * @module InMemorySidebarStateRepository
 */

import { ISidebarStateRepository } from './ISidebarStateRepository';
import { SidebarState } from '../dto/DashboardTypes';

/**
 * In-memory sidebar state repository
 *
 * Features:
 * - Always available (no storage constraints)
 * - Non-persistent (state lost on page reload)
 * - Useful for testing and localStorage fallback
 * - Thread-safe for single-threaded JavaScript environment
 */
export class InMemorySidebarStateRepository implements ISidebarStateRepository {
  /**
   * Private in-memory storage for sidebar state
   */
  private state: SidebarState | null = null;

  /**
   * Check if storage is available
   *
   * In-memory storage is always available.
   *
   * @returns Always returns true
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Retrieve sidebar state from memory
   *
   * @returns SidebarState or null if not set
   */
  async getState(): Promise<SidebarState | null> {
    return this.state;
  }

  /**
   * Save sidebar state to memory
   *
   * @param state - The sidebar state to store
   */
  async setState(state: SidebarState): Promise<void> {
    this.state = state;
  }

  /**
   * Clear sidebar state from memory
   *
   * Sets internal state to null.
   */
  async clearState(): Promise<void> {
    this.state = null;
  }
}
