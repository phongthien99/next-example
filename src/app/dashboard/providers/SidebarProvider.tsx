'use client';

/**
 * Dependency Injection Layer - Sidebar State Provider
 *
 * React Context provider that manages sidebar state and dependency injection
 * for the sidebar state repository. Follows Clean Architecture principles.
 *
 * @module SidebarProvider
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ISidebarStateRepository } from '../repositories/ISidebarStateRepository';
import { LocalStorageSidebarStateRepository } from '../repositories/LocalStorageSidebarStateRepository';
import { InMemorySidebarStateRepository } from '../repositories/InMemorySidebarStateRepository';
import { SidebarState } from '../dto/DashboardTypes';
import { getDefaultSidebarState } from '../core/ValidationFunctions';

/**
 * Context value interface
 */
interface SidebarContextValue {
  state: SidebarState;
  setState: (state: SidebarState) => void;
  repository: ISidebarStateRepository;
  isLoading: boolean;
}

/**
 * Sidebar context
 *
 * Provides sidebar state and repository to child components via React Context.
 */
const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

/**
 * Provider props
 */
interface SidebarProviderProps {
  children: ReactNode;
  repository?: ISidebarStateRepository;
}

/**
 * Sidebar state provider component
 *
 * Responsibilities:
 * - Initialize sidebar state repository (localStorage with in-memory fallback)
 * - Load initial state from repository on mount
 * - Persist state changes to repository
 * - Provide context value to child components
 *
 * @param children - Child components to wrap
 * @param repository - Optional repository override (useful for testing)
 */
export function SidebarProvider({ children, repository: providedRepository }: SidebarProviderProps) {
  // Initialize repository with fallback strategy
  const [repository] = useState<ISidebarStateRepository>(() => {
    if (providedRepository) {
      return providedRepository;
    }

    // Try localStorage first, fallback to in-memory if unavailable
    const localStorageRepo = new LocalStorageSidebarStateRepository();
    if (localStorageRepo.isAvailable()) {
      return localStorageRepo;
    }

    console.warn('localStorage unavailable, using in-memory fallback for sidebar state');
    return new InMemorySidebarStateRepository();
  });

  const [state, setState] = useState<SidebarState>(getDefaultSidebarState);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state from repository on mount
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const savedState = await repository.getState();
        if (savedState) {
          setState(savedState);
        }
      } catch (error) {
        console.error('Failed to load initial sidebar state:', error);
        // Keep default state on error
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialState();
  }, [repository]);

  // Persist state changes to repository
  useEffect(() => {
    // Skip persistence during initial load
    if (isLoading) {
      return;
    }

    const persistState = async () => {
      try {
        await repository.setState(state);
      } catch (error) {
        console.error('Failed to persist sidebar state:', error);
        // Continue without persistence - non-blocking error
      }
    };

    persistState();
  }, [state, repository, isLoading]);

  const contextValue: SidebarContextValue = {
    state,
    setState,
    repository,
    isLoading,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * Hook to access sidebar context
 *
 * Must be used within a SidebarProvider component tree.
 *
 * @throws {Error} If used outside SidebarProvider
 * @returns Sidebar context value
 */
export function useSidebarContext(): SidebarContextValue {
  const context = useContext(SidebarContext);

  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider');
  }

  return context;
}
