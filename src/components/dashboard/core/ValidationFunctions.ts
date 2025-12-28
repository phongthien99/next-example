/**
 * Domain Layer - Validation Functions
 *
 * This file contains pure business logic functions for validating
 * and processing dashboard domain entities.
 *
 * @module ValidationFunctions
 */

import {
  DashboardConfig,
  DashboardConfigSchema,
  SidebarState,
  SidebarStateSchema,
  NavigationItem,
} from '../dto/DashboardTypes';

/**
 * Validate dashboard configuration
 * @param data - Raw dashboard configuration data
 * @returns Validated DashboardConfig or throws ZodError
 * @throws {ZodError} If validation fails
 */
export function validateDashboardConfig(data: unknown): DashboardConfig {
  return DashboardConfigSchema.parse(data);
}

/**
 * Validate sidebar state with safe parsing
 * @param data - Raw sidebar state data
 * @returns Validated SidebarState or null if invalid
 */
export function validateSidebarState(data: unknown): SidebarState | null {
  const result = SidebarStateSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Get default sidebar state
 * @returns Default SidebarState (expanded, mobile closed, no active item)
 */
export function getDefaultSidebarState(): SidebarState {
  return {
    isCollapsed: false,
    isMobileOpen: false,
    activeNavItemId: null,
  };
}

/**
 * Derive active navigation item ID from current pathname
 *
 * Matches the current pathname against navigation items and their sub-items
 * to determine which navigation item should be marked as active.
 *
 * @param pathname - Current route pathname (e.g., '/dashboard/playground/history')
 * @param navItems - Array of navigation items to search
 * @returns Active navigation item ID or null if no match found
 *
 * @example
 * ```typescript
 * const activeId = deriveActiveNavItemId('/dashboard/playground/history', navItems);
 * // Returns 'nav-playground' (parent item ID)
 * ```
 */
export function deriveActiveNavItemId(
  pathname: string,
  navItems: NavigationItem[]
): string | null {
  for (const item of navItems) {
    // Check if main item matches
    if (pathname === item.url || pathname.startsWith(item.url + '/')) {
      return item.id;
    }
    // Check sub-items
    if (item.items) {
      for (const subItem of item.items) {
        if (pathname === subItem.url) {
          return item.id; // Return parent item ID
        }
      }
    }
  }
  return null;
}

/**
 * Check if a navigation item is active based on current pathname
 * @param item - Navigation item to check
 * @param pathname - Current route pathname
 * @returns True if the item or any of its sub-items match the current pathname
 */
export function isNavigationItemActive(
  item: NavigationItem,
  pathname: string
): boolean {
  // Check main item URL
  if (pathname === item.url || pathname.startsWith(item.url + '/')) {
    return true;
  }

  // Check sub-items
  if (item.items) {
    return item.items.some(subItem => pathname === subItem.url);
  }

  return false;
}

/**
 * Toggle sidebar collapsed state
 * @param currentState - Current sidebar state
 * @returns New sidebar state with toggled isCollapsed value
 */
export function toggleSidebarCollapsed(currentState: SidebarState): SidebarState {
  return {
    ...currentState,
    isCollapsed: !currentState.isCollapsed,
  };
}

/**
 * Open mobile sidebar
 * @param currentState - Current sidebar state
 * @returns New sidebar state with isMobileOpen set to true
 */
export function openMobileSidebar(currentState: SidebarState): SidebarState {
  return {
    ...currentState,
    isMobileOpen: true,
  };
}

/**
 * Close mobile sidebar
 * @param currentState - Current sidebar state
 * @returns New sidebar state with isMobileOpen set to false
 */
export function closeMobileSidebar(currentState: SidebarState): SidebarState {
  return {
    ...currentState,
    isMobileOpen: false,
  };
}

/**
 * Set active navigation item
 * @param currentState - Current sidebar state
 * @param itemId - Navigation item ID to set as active (or null to clear)
 * @returns New sidebar state with updated activeNavItemId
 */
export function setActiveNavItem(
  currentState: SidebarState,
  itemId: string | null
): SidebarState {
  return {
    ...currentState,
    activeNavItemId: itemId,
  };
}
