'use client';

import React, { createContext, useContext } from 'react';
import { IResetPasswordRepository } from '../repositories/IResetPasswordRepository';
import { ResetPasswordRepositoryRegistry } from '../repositories/ResetPasswordRepositoryRegistry';

const ResetPasswordRepositoryContext = createContext<IResetPasswordRepository | null>(null);

/**
 * Provider component for dependency injection of password reset repository
 * Wraps components that need access to the repository
 */
export function ResetPasswordRepositoryProvider({
  children,
  type = 'api'
}: {
  children: React.ReactNode;
  type?: 'api';
}) {
  const repository = ResetPasswordRepositoryRegistry.getRepository(type);

  return (
    <ResetPasswordRepositoryContext.Provider value={repository}>
      {children}
    </ResetPasswordRepositoryContext.Provider>
  );
}

/**
 * Hook to access the injected password reset repository
 * Must be used within ResetPasswordRepositoryProvider
 * @returns Repository instance
 * @throws Error if used outside provider
 */
export function useResetPasswordRepository(): IResetPasswordRepository {
  const context = useContext(ResetPasswordRepositoryContext);
  if (!context) {
    throw new Error('useResetPasswordRepository must be used within ResetPasswordRepositoryProvider');
  }
  return context;
}
