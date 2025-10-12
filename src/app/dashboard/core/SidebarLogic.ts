/**
 * Domain Layer - Sidebar Business Logic
 *
 * This file contains pure business logic functions for sidebar behavior.
 * All functions are pure (no side effects, no external dependencies) and testable.
 *
 * @module SidebarLogic
 */

import { NavigationItem } from '../dto/DashboardTypes';

/**
 * Toggle sidebar collapsed state
 * @param isCollapsed - Current collapsed state
 * @returns Opposite state (true becomes false, false becomes true)
 *
 * @example
 * ```typescript
 * const newState = toggleSidebar(false); // Returns true
 * const originalState = toggleSidebar(true); // Returns false
 * ```
 */
export function toggleSidebar(isCollapsed: boolean): boolean {
  return !isCollapsed;
}

/**
 * Determine if sidebar should auto-collapse based on screen width
 *
 * Mobile breakpoint: 768px (Tailwind's md: breakpoint)
 * Below this width, sidebar should use mobile sheet instead of desktop sidebar
 *
 * @param screenWidth - Current screen width in pixels
 * @returns True if screen width is below mobile breakpoint (< 768px)
 *
 * @example
 * ```typescript
 * shouldAutoCollapse(320);  // Returns true (mobile)
 * shouldAutoCollapse(768);  // Returns false (desktop)
 * shouldAutoCollapse(1024); // Returns false (desktop)
 * ```
 */
export function shouldAutoCollapse(screenWidth: number): boolean {
  return screenWidth < 768;
}

/**
 * Derive active navigation item ID from current pathname
 *
 * Matches the current pathname against navigation items and their sub-items
 * to determine which navigation item should be marked as active.
 *
 * Matching logic:
 * 1. Exact match: pathname === item.url
 * 2. Prefix match: pathname starts with item.url + '/'
 * 3. Sub-item match: pathname matches any sub-item URL (returns parent ID)
 *
 * @param pathname - Current route pathname (e.g., '/dashboard/playground/history')
 * @param navItems - Array of navigation items to search
 * @returns Active navigation item ID or null if no match found
 *
 * @example
 * ```typescript
 * const activeId = deriveActiveNavItemId('/dashboard/playground', navItems);
 * // Returns 'nav-playground'
 *
 * const activeId = deriveActiveNavItemId('/dashboard/playground/history', navItems);
 * // Returns 'nav-playground' (parent item of sub-item 'history')
 *
 * const activeId = deriveActiveNavItemId('/unknown-route', navItems);
 * // Returns null
 * ```
 */
export function deriveActiveNavItemId(
  pathname: string,
  navItems: NavigationItem[]
): string | null {
  for (const item of navItems) {
    // Check if main item URL matches exactly or as prefix
    if (pathname === item.url || pathname.startsWith(item.url + '/')) {
      return item.id;
    }

    // Check sub-items if present
    if (item.items && item.items.length > 0) {
      for (const subItem of item.items) {
        if (pathname === subItem.url) {
          return item.id; // Return parent item ID when sub-item matches
        }
      }
    }
  }

  return null; // No match found
}

/**
 * Calculate sidebar width in pixels based on collapsed state
 *
 * Radix UI Sidebar component uses these widths:
 * - Expanded: 16rem (256px)
 * - Collapsed: 3rem (48px)
 *
 * @param isCollapsed - Whether sidebar is collapsed
 * @returns Width in pixels
 *
 * @example
 * ```typescript
 * getSidebarWidth(false); // Returns 256 (expanded)
 * getSidebarWidth(true);  // Returns 48 (collapsed)
 * ```
 */
export function getSidebarWidth(isCollapsed: boolean): number {
  return isCollapsed ? 48 : 256;
}

/**
 * Determine if sidebar should be visible on mobile
 * @param isMobileOpen - Mobile sidebar open state
 * @param screenWidth - Current screen width in pixels
 * @returns True if sidebar should be visible on mobile
 */
export function isSidebarVisibleOnMobile(
  isMobileOpen: boolean,
  screenWidth: number
): boolean {
  return isMobileOpen && screenWidth < 768;
}
