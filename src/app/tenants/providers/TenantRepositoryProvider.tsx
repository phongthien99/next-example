'use client';

/**
 * Tenant Repository Provider
 * Provides dependency injection for ITenantRepository throughout the component tree
 */
import React, { createContext, useContext, useMemo } from 'react';
import { ITenantRepository } from '../repositories/ITenantRepository';
import { TenantRepositoryRegistry, RepositoryType } from '../repositories/TenantRepositoryRegistry';

/**
 * Context for tenant repository instance
 */
const TenantRepositoryContext = createContext<ITenantRepository | null>(null);

interface TenantRepositoryProviderProps {
  children: React.ReactNode;
  repositoryType?: RepositoryType;
}

/**
 * Provider component that injects repository instance into React context
 */
export function TenantRepositoryProvider({
  children,
  repositoryType = 'memory',
}: TenantRepositoryProviderProps) {
  const repository = useMemo(
    () => TenantRepositoryRegistry.getRepository(repositoryType),
    [repositoryType]
  );

  return (
    <TenantRepositoryContext.Provider value={repository}>
      {children}
    </TenantRepositoryContext.Provider>
  );
}

/**
 * Hook to access tenant repository from context
 * @throws Error if used outside of TenantRepositoryProvider
 */
export function useTenantRepository(): ITenantRepository {
  const context = useContext(TenantRepositoryContext);

  if (!context) {
    throw new Error(
      'useTenantRepository must be used within TenantRepositoryProvider'
    );
  }

  return context;
}
