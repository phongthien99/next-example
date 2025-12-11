'use client';

/**
 * Application Layer - Sidebar State Management Hook
 *
 * This hook provides a clean API for components to interact with sidebar state.
 * It encapsulates all sidebar state logic and provides memoized action functions.
 *
 * @module useSidebar
 */

import { useCallback } from 'react';
import { useSidebarContext } from '../providers/SidebarProvider';
import { SidebarState } from '../dto/DashboardTypes';

/**
 * Return type for useSidebar hook
 */
export interface UseSidebarReturn {
  state: SidebarState;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  activeNavItemId: string | null;
  isLoading: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  setActiveNavItem: (id: string | null) => void;
}

/**
 * Sidebar state management hook
 *
 * Provides convenient access to sidebar state and actions.
 * All state changes are persisted via the repository (localStorage or in-memory).
 *
 * @returns Sidebar state and action functions
 * @throws {Error} If used outside SidebarProvider
 *
 * @example
 * ```tsx
 * function SidebarToggle() {
 *   const { isCollapsed, toggle } = useSidebar();
 *   return <button onClick={toggle}>{isCollapsed ? 'Expand' : 'Collapse'}</button>;
 * }
 * ```
 */
export function useSidebar(): UseSidebarReturn {
  const { state, setState, isLoading } = useSidebarContext();

  /**
   * Toggle sidebar collapsed state
   */
  const toggle = useCallback(() => {
    setState({
      ...state,
      isCollapsed: !state.isCollapsed,
    });
  }, [state, setState]);

  /**
   * Expand sidebar (set isCollapsed to false)
   */
  const expand = useCallback(() => {
    setState({
      ...state,
      isCollapsed: false,
    });
  }, [state, setState]);

  /**
   * Collapse sidebar (set isCollapsed to true)
   */
  const collapse = useCallback(() => {
    setState({
      ...state,
      isCollapsed: true,
    });
  }, [state, setState]);

  /**
   * Open mobile sidebar sheet
   */
  const openMobile = useCallback(() => {
    setState({
      ...state,
      isMobileOpen: true,
    });
  }, [state, setState]);

  /**
   * Close mobile sidebar sheet
   */
  const closeMobile = useCallback(() => {
    setState({
      ...state,
      isMobileOpen: false,
    });
  }, [state, setState]);

  /**
   * Set active navigation item
   * @param id - Navigation item ID to set as active, or null to clear
   */
  const setActiveNavItem = useCallback((id: string | null) => {
    setState({
      ...state,
      activeNavItemId: id,
    });
  }, [state, setState]);

  return {
    state,
    isCollapsed: state.isCollapsed,
    isMobileOpen: state.isMobileOpen,
    activeNavItemId: state.activeNavItemId,
    isLoading,
    toggle,
    expand,
    collapse,
    openMobile,
    closeMobile,
    setActiveNavItem,
  };
}
