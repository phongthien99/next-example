/**
 * Infrastructure Layer - localStorage Sidebar State Repository
 *
 * Concrete implementation of ISidebarStateRepository using browser localStorage.
 * Handles localStorage unavailability gracefully (private browsing, quota exceeded, disabled).
 *
 * @module LocalStorageSidebarStateRepository
 */

import { ISidebarStateRepository } from "./ISidebarStateRepository";
import { SidebarState } from "../dto/DashboardTypes";
import { validateSidebarState } from "../core/ValidationFunctions";

/**
 * localStorage key for sidebar state persistence
 */
const STORAGE_KEY = "dashboard:sidebarState";

/**
 * localStorage-based sidebar state repository
 *
 * Features:
 * - Validates data using Zod before persisting
 * - Handles localStorage errors gracefully (quota, disabled, private mode)
 * - Provides isAvailable() check for storage availability
 * - Returns null on read errors instead of throwing
 */
export class LocalStorageSidebarStateRepository
  implements ISidebarStateRepository
{
  /**
   * Check if localStorage is available
   *
   * Tests localStorage accessibility by attempting a write operation.
   * Returns false if localStorage is disabled, in private mode, or unavailable.
   *
   * @returns true if localStorage is available, false otherwise
   */
  isAvailable(): boolean {
    try {
      const testKey = "__storage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      return true;
    } catch {
      // localStorage disabled, private browsing, or quota exceeded
      return false;
    }
  }

  /**
   * Retrieve sidebar state from localStorage
   *
   * @returns SidebarState or null if not found, invalid, or error occurs
   */
  async getState(): Promise<SidebarState | null> {
    try {
      if (!this.isAvailable()) {
        return null;
      }

      const rawData = localStorage.getItem(STORAGE_KEY);
      if (!rawData) {
        return null;
      }

      const parsedData = JSON.parse(rawData);
      const validatedState = validateSidebarState(parsedData);

      return validatedState;
    } catch (error) {
      // Invalid JSON, validation error, or localStorage error
      console.error("Failed to read sidebar state from localStorage:", error);
      return null;
    }
  }

  /**
   * Save sidebar state to localStorage
   *
   * Validates state before persisting. Throws error if validation fails.
   *
   * @param state - The sidebar state to persist
   * @throws {Error} If localStorage is unavailable or quota exceeded
   */
  async setState(state: SidebarState): Promise<void> {
    try {
      if (!this.isAvailable()) {
        throw new Error("localStorage is not available");
      }

      // Validate state before persisting
      const validatedState = validateSidebarState(state);
      if (!validatedState) {
        throw new Error("Invalid sidebar state: validation failed");
      }

      const serialized = JSON.stringify(validatedState);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      // Log error but don't crash the application
      console.error("Failed to save sidebar state to localStorage:", error);
      throw error;
    }
  }

  /**
   * Clear sidebar state from localStorage
   *
   * Fails silently if removal fails (non-blocking operation).
   */
  async clearState(): Promise<void> {
    try {
      if (this.isAvailable()) {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      // Silent failure - clearing state is not critical
      console.warn("Failed to clear sidebar state from localStorage:", error);
    }
  }
}
